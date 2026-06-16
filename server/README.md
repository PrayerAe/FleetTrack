# FleetTrack Manado — Cloud Server

Server penerima telemetri GPS **real-time**. Menerima data yang "dilempar" perangkat
GPS (ESP32 + NEO-6M + SIM800L) lewat **MQTT** atau **HTTP**, mengevaluasi
**geofence (Ray Casting)** + **batas kecepatan** + **baterai**, lalu mem-broadcast
ke dashboard via **Socket.IO**. Mengikuti arsitektur 3-lapis pada proposal (§III).

```
GPS device ──MQTT / HTTP JSON──▶  server (ingest → geofence/overspeed engine) ──Socket.IO──▶  dashboard
                                         └────────────▶  PostgreSQL + InfluxDB (opsional)
```

## Menjalankan

```bash
cd server
npm install
cp .env.example .env     # opsional — semua punya default
npm start                # http://localhost:4000
```

Uji cepat tanpa perangkat fisik (emulator 10 unit GPS @1 Hz):

```bash
npm run emulate          # mengirim telemetri real ke POST /api/telemetry
```

Lalu jalankan dashboard di terminal lain (`cd .. && npm run dev`) → data muncul live.

## REST API

| Method | Endpoint | Guna |
|--------|----------|------|
| `POST` | `/api/telemetry` | **Ingest telemetri GPS** (1 objek JSON atau array). Endpoint utama untuk perangkat. |
| `GET`  | `/api/telemetry` | Menampilkan skema JSON + contoh (buka di browser). |
| `GET`  | `/api/fleet` | Snapshot seluruh unit (metadata + posisi live). |
| `GET`  | `/api/alerts` | Daftar alert terbaru. |
| `GET`  | `/api/geofences` | Poligon zona operasional. |
| `GET`  | `/api/health` | Status server. |
| `POST` | `/api/command/:id` | Kirim perintah ke perangkat (`engine_cutoff`, `set_interval`) — perlu MQTT. |

### Format payload (`POST /api/telemetry`)

```json
{
  "id":  "MOTOR-001",
  "ts":  "2026-02-18T10:30:00Z",
  "lat": 1.48700,
  "lng": 124.83500,
  "spd": 45.2,
  "bat": 87,
  "sat": 8,
  "st":  "rented"
}
```

Bisa juga mengirim **array** untuk batch. Nama field alternatif diterima otomatis:
`device_id`/`imei` → `id`, `latitude` → `lat`, `longitude`/`lon` → `lng`,
`speed` → `spd`, `battery` → `bat`, `satellites` → `sat`. Hanya `id`, `lat`, `lng`
yang wajib; sisanya opsional.

> Dokumen lengkap untuk rekan yang mengirim data GPS: **[../INTEGRASI_API_GPS.md](../INTEGRASI_API_GPS.md)**.

## Event Socket.IO (server → dashboard)

| Event | Payload | Kapan |
|-------|---------|-------|
| `snapshot` | `{ devices, alerts, trails, geofences, serverTs }` | Saat dashboard connect. |
| `device:update` | objek unit (metadata + posisi/kecepatan/baterai + status) | Tiap paket telemetri. |
| `telemetry` | `{ id, ts, lat, lng, spd, bat, sat, st, rxTs }` | Tiap paket (untuk konsol). |
| `alert` | `{ id, time, device_id, type, severity, detail }` | Saat overspeed/geofence/low-battery. |

## Konfigurasi (`.env`)

Lihat [.env.example](.env.example). Yang penting:

- `PORT` (default `4000`), `CORS_ORIGIN` (default `http://localhost:5173`).
- `INGEST_API_KEY` — bila diisi, `POST /api/telemetry` wajib header `x-api-key`.
- **MQTT** — isi `MQTT_URL` (mis. `mqtt://localhost:1883`) untuk subscribe broker
  Mosquitto pada `rental/motor/+/telemetry` (QoS 1). Kosong = HTTP-only.
- **Dual-DB** — set `STORE=db` untuk persist ke PostgreSQL (relasional) + InfluxDB
  (time-series). Jalankan skema dulu: `psql fleettrack -f db/schema.sql`.

## Catatan

- Mode default **in-memory + HTTP** berjalan tanpa layanan eksternal.
- `tools/device-emulator.mjs` adalah pengganti perangkat ESP32 untuk pengujian —
  hapus/abaikan saat perangkat fisik sudah mengirim data.
