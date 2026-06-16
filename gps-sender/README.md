# gps-sender

Program kecil untuk **mengirim data GPS** ke **Firebase Realtime Database** (FleetTrack
Manado). Ini bagian rekan pengirim data — tidak perlu menyentuh kode dashboard.

Cukup `PUT` JSON ke `https://<DB>/telemetry/<DEVICE_ID>.json`. Detail format & endpoint:
**[../INTEGRASI_API_GPS.md](../INTEGRASI_API_GPS.md)**.

## Pakai cepat (mode demo — tanpa hardware)

```bash
cd gps-sender
cp .env.example .env          # isi FIREBASE_DB_URL (wajib)
python send_gps.py            # butuh Python 3, tanpa dependency tambahan
```

Berhasil bila tiap baris menampilkan `HTTP 200` dan unit bergerak di dashboard.

## Mode GPS sungguhan (serial NMEA)

```bash
pip install -r requirements.txt          # pyserial + pynmea2
# di .env:  MODE=serial  ·  SERIAL_PORT=COM5 (atau /dev/ttyUSB0)
python send_gps.py
```

## Konfigurasi (`.env`)

| Var | Guna |
|-----|------|
| `FIREBASE_DB_URL` | **Wajib.** URL Realtime Database. |
| `DEVICE_ID` | ID unit (mis. `MOTOR-001`). |
| `AUTH` | Token Firebase — isi hanya bila database memakai auth. |
| `RATE` | Paket per detik (Hz). |
| `MODE` | `demo` atau `serial`. |
| `SERIAL_PORT` / `SERIAL_BAUD` | Untuk `MODE=serial`. |

## Sumber GPS lain

Bila datanya bukan dari serial NMEA, cukup hasilkan dict berisi `id, lat, lng`
(idealnya juga `spd, bat, sat`) lalu panggil `put(packet)` di [send_gps.py](send_gps.py).
