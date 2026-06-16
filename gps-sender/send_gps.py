#!/usr/bin/env python3
"""
gps-sender — kirim telemetri GPS ke Firebase Realtime Database (FleetTrack Manado).

Program ini titik kerja REKAN (pengirim data). Ia membaca posisi GPS lalu
mem-PUT JSON ke:  <FIREBASE_DB_URL>/telemetry/<DEVICE_ID>.json
Dashboard membaca perubahan itu secara real-time. Tidak ada server yang perlu
dijalankan/di-hosting.

Dua mode:
  MODE=demo    -> koordinat bergerak di sekitar Manado (uji TANPA hardware)
  MODE=serial  -> baca GPS NMEA dari port serial (butuh pyserial + pynmea2)

Konfigurasi lewat environment variable atau file .env di folder ini:
  FIREBASE_DB_URL  WAJIB. Mis. https://fleettrack-manado-default-rtdb.firebaseio.com
  DEVICE_ID        id unit, default MOTOR-001
  AUTH             opsional, token Firebase (ditambah sebagai ?auth=... bila diisi)
  RATE             paket per detik (Hz), default 1
  MODE             demo | serial (default demo)
  SERIAL_PORT      mis. COM5 atau /dev/ttyUSB0   [mode serial]
  SERIAL_BAUD      default 9600                   [mode serial]

Jalankan:  python send_gps.py
"""
import json
import math
import os
import random
import sys
import time
import urllib.error
import urllib.request


def load_dotenv(path=".env"):
    here = os.path.join(os.path.dirname(os.path.abspath(__file__)), path)
    if not os.path.exists(here):
        return
    for line in open(here, encoding="utf-8"):
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip())


load_dotenv()

DB_URL = os.environ.get("FIREBASE_DB_URL", "").rstrip("/")
DEVICE_ID = os.environ.get("DEVICE_ID", "MOTOR-001")
AUTH = os.environ.get("AUTH", "")
RATE = float(os.environ.get("RATE", "1"))
MODE = os.environ.get("MODE", "demo").lower()
SERIAL_PORT = os.environ.get("SERIAL_PORT", "")
SERIAL_BAUD = int(os.environ.get("SERIAL_BAUD", "9600"))

if not DB_URL:
    sys.exit("Set FIREBASE_DB_URL di .env (mis. https://xxx-default-rtdb.firebaseio.com)")


def put(packet):
    """PUT satu paket JSON ke /telemetry/<id>.json. Mengembalikan kode HTTP."""
    url = f"{DB_URL}/telemetry/{packet['id']}.json"
    if AUTH:
        url += f"?auth={AUTH}"
    body = json.dumps({k: v for k, v in packet.items() if k != "id"}).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="PUT")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.status


# ── MODE DEMO ────────────────────────────────────────────────────────────────
def demo_stream():
    lat, lng = 1.4900, 124.8380
    heading = random.random() * 2 * math.pi
    while True:
        spd = max(0.0, 30 + random.uniform(-10, 12))
        heading += random.uniform(-0.4, 0.4)
        meters = (spd / 3.6) / RATE
        lat += (meters * math.cos(heading)) / 111_320
        lng += (meters * math.sin(heading)) / (111_320 * math.cos(math.radians(lat)))
        yield {
            "id": DEVICE_ID,
            "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "lat": round(lat, 5), "lng": round(lng, 5),
            "spd": round(spd, 1), "bat": 80, "sat": random.randint(6, 11), "st": "rented",
        }
        time.sleep(1 / RATE)


# ── MODE SERIAL (GPS NMEA sungguhan) ─────────────────────────────────────────
def serial_stream():
    try:
        import pynmea2
        import serial
    except ImportError:
        sys.exit("Mode serial butuh: pip install pyserial pynmea2")
    if not SERIAL_PORT:
        sys.exit("Set SERIAL_PORT (mis. COM5 atau /dev/ttyUSB0) untuk mode serial.")

    ser = serial.Serial(SERIAL_PORT, SERIAL_BAUD, timeout=1)
    print(f"Membaca GPS dari {SERIAL_PORT} @ {SERIAL_BAUD} baud…")
    last_sent = 0.0
    while True:
        raw = ser.readline().decode("ascii", errors="ignore").strip()
        if not raw.startswith("$"):
            continue
        try:
            msg = pynmea2.parse(raw)
        except pynmea2.ParseError:
            continue
        lat = getattr(msg, "latitude", None)
        lng = getattr(msg, "longitude", None)
        if not lat or not lng:
            continue
        now = time.time()
        if now - last_sent < 1 / RATE:
            continue
        last_sent = now
        spd_knots = getattr(msg, "spd_over_grnd", None)
        sats = getattr(msg, "num_sats", None)
        yield {
            "id": DEVICE_ID,
            "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "lat": round(float(lat), 5), "lng": round(float(lng), 5),
            "spd": round(float(spd_knots) * 1.852, 1) if spd_knots else 0.0,
            "sat": int(sats) if sats else 0, "st": "rented",
        }


def main():
    print(f"gps-sender → {DB_URL}/telemetry/{DEVICE_ID}.json")
    print(f"  mode={MODE}  rate={RATE}Hz  auth={'on' if AUTH else 'off'}")
    stream = serial_stream() if MODE == "serial" else demo_stream()
    sent = 0
    for packet in stream:
        try:
            code = put(packet)
            sent += 1
            print(f"\r[{sent}] PUT {packet['id']} ({packet['lat']},{packet['lng']}) spd={packet['spd']}  ← HTTP {code}   ", end="")
        except urllib.error.HTTPError as e:
            print(f"\nHTTP {e.code}: {e.read().decode('utf-8', 'ignore')}  (cek rules & FIREBASE_DB_URL)")
            time.sleep(2)
        except Exception as e:  # noqa: BLE001
            print(f"\nGagal kirim: {e}  (cek FIREBASE_DB_URL & koneksi)")
            time.sleep(2)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nberhenti.")
