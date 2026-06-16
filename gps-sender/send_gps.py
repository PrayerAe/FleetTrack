#!/usr/bin/env python3
"""
gps-sender — kirim telemetri GPS ke server FleetTrack Manado.

Program ini titik kerja REKAN (pengirim data). Ia membaca posisi GPS lalu
mengirim JSON ke endpoint /api/telemetry milik server. Tidak perlu mengubah
kode dashboard sama sekali — cukup arahkan API_URL ke server.

Dua mode:
  MODE=demo    -> hasilkan koordinat bergerak di sekitar Manado (uji TANPA hardware)
  MODE=serial  -> baca GPS NMEA dari port serial sungguhan (butuh pyserial + pynmea2)

Konfigurasi lewat environment variable atau file .env di folder ini:
  API_URL      WAJIB. Mis. https://fleettrack-server.onrender.com/api/telemetry
  DEVICE_ID    id unit, default MOTOR-001 (samakan dengan daftar di server)
  API_KEY      opsional, dikirim sebagai header x-api-key bila server memintanya
  RATE         paket per detik (Hz), default 1
  MODE         demo | serial (default demo)
  SERIAL_PORT  mis. COM5 (Windows) atau /dev/ttyUSB0 (Linux)  [mode serial]
  SERIAL_BAUD  default 9600                                    [mode serial]

Jalankan:
  python send_gps.py
"""
import json
import math
import os
import random
import sys
import time
import urllib.error
import urllib.request


# ── konfigurasi ──────────────────────────────────────────────────────────────
def load_dotenv(path=".env"):
    """Pembaca .env sederhana (tanpa dependency)."""
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

API_URL = os.environ.get("API_URL", "http://localhost:4000/api/telemetry")
DEVICE_ID = os.environ.get("DEVICE_ID", "MOTOR-001")
API_KEY = os.environ.get("API_KEY", "")
RATE = float(os.environ.get("RATE", "1"))
MODE = os.environ.get("MODE", "demo").lower()
SERIAL_PORT = os.environ.get("SERIAL_PORT", "")
SERIAL_BAUD = int(os.environ.get("SERIAL_BAUD", "9600"))


def post(packet):
    """POST satu paket JSON ke server. Mengembalikan teks respons."""
    body = json.dumps(packet).encode("utf-8")
    headers = {"Content-Type": "application/json"}
    if API_KEY:
        headers["x-api-key"] = API_KEY
    req = urllib.request.Request(API_URL, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.read().decode("utf-8")


# ── MODE DEMO: koordinat bergerak buatan ─────────────────────────────────────
def demo_stream():
    lat, lng = 1.4900, 124.8380       # dekat Boulevard Manado
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
            "lat": round(lat, 5),
            "lng": round(lng, 5),
            "spd": round(spd, 1),
            "bat": 80,
            "sat": random.randint(6, 11),
            "st": "rented",
        }
        time.sleep(1 / RATE)


# ── MODE SERIAL: baca GPS NMEA sungguhan ─────────────────────────────────────
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
        # batasi laju kirim sesuai RATE
        now = time.time()
        if now - last_sent < 1 / RATE:
            continue
        last_sent = now
        spd_knots = getattr(msg, "spd_over_grnd", None)
        spd_kmh = round(float(spd_knots) * 1.852, 1) if spd_knots else 0.0
        sats = getattr(msg, "num_sats", None)
        yield {
            "id": DEVICE_ID,
            "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "lat": round(float(lat), 5),
            "lng": round(float(lng), 5),
            "spd": spd_kmh,
            "sat": int(sats) if sats else 0,
            "st": "rented",
        }


def main():
    print(f"gps-sender → {API_URL}")
    print(f"  device={DEVICE_ID}  mode={MODE}  rate={RATE}Hz  auth={'on' if API_KEY else 'off'}")
    stream = serial_stream() if MODE == "serial" else demo_stream()
    sent = 0
    for packet in stream:
        try:
            resp = post(packet)
            sent += 1
            print(f"\r[{sent}] sent {packet['id']} ({packet['lat']},{packet['lng']}) spd={packet['spd']}  ← {resp}   ", end="")
        except urllib.error.HTTPError as e:
            print(f"\nHTTP {e.code}: {e.read().decode('utf-8', 'ignore')}")
        except Exception as e:  # noqa: BLE001
            print(f"\nGagal kirim: {e}  (cek API_URL & koneksi)")
            time.sleep(2)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nberhenti.")
