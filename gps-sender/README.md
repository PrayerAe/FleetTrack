# gps-sender

Program kecil untuk **mengirim data GPS** ke server FleetTrack Manado. Ini bagian
yang dikerjakan **rekan pengirim data** — tidak perlu menyentuh kode dashboard.

Cukup `POST` JSON ke endpoint `/api/telemetry`. Detail lengkap format & endpoint
ada di **[../INTEGRASI_API_GPS.md](../INTEGRASI_API_GPS.md)**.

## Pakai cepat (mode demo — tanpa hardware)

```bash
cd gps-sender
cp .env.example .env          # isi API_URL (wajib)
python send_gps.py            # butuh Python 3, tanpa dependency tambahan
```

Atur `API_URL` di `.env` ke server tujuan:
- lokal: `http://localhost:4000/api/telemetry`
- deploy: `https://fleettrack-server.onrender.com/api/telemetry`

Berhasil bila tiap baris menampilkan `{"ok":true,"accepted":1}` dan unit bergerak
di dashboard.

## Mode GPS sungguhan (serial NMEA)

Untuk modul GPS yang terhubung ke port serial (USB/UART):

```bash
pip install -r requirements.txt          # pyserial + pynmea2
# di .env:
#   MODE=serial
#   SERIAL_PORT=COM5        (Windows)  atau  /dev/ttyUSB0 (Linux)
python send_gps.py
```

Program membaca kalimat NMEA (`$GxRMC`/`$GxGGA`), mengambil lat/lng/kecepatan/satelit,
lalu mengirimnya dengan laju `RATE` Hz.

## Konfigurasi (`.env`)

| Var | Guna |
|-----|------|
| `API_URL` | **Wajib.** URL ingest server. |
| `DEVICE_ID` | ID unit (samakan dengan daftar di server, mis. `MOTOR-001`). |
| `API_KEY` | Isi hanya bila server mengaktifkan `INGEST_API_KEY`. |
| `RATE` | Paket per detik (Hz). |
| `MODE` | `demo` atau `serial`. |
| `SERIAL_PORT` / `SERIAL_BAUD` | Untuk `MODE=serial`. |

## Mengganti dengan sumber GPS Anda sendiri

Bila datanya bukan dari serial NMEA (mis. dari API operator seluler, file log, atau
modul lain), cukup hasilkan dict berisi `id, lat, lng` (idealnya juga `spd, bat, sat`)
lalu panggil `post(packet)` di [send_gps.py](send_gps.py). Sisa pipeline tetap sama.
