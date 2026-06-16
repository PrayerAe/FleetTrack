# 📡 API Pengiriman Data GPS — FleetTrack Manado

Dokumen ini untuk **rekan yang menulis program/perangkat GPS**. Program Anda cukup
mengirim **satu HTTP request JSON** per pembacaan ke endpoint di bawah. Server akan
otomatis menempatkan unit di peta, menghitung geofence, overspeed, dan baterai,
lalu menampilkannya real-time di dashboard.

---

## 1. Link API (endpoint)

```
POST  http://<HOST>:4000/api/telemetry
```

Ganti `<HOST>`:

| Skenario | URL yang dipakai |
|----------|------------------|
| Program GPS jalan di **PC yang sama** dengan server | `http://localhost:4000/api/telemetry` |
| Perangkat/PC lain di **Wi-Fi/LAN yang sama** | `http://<IP-LAN-server>:4000/api/telemetry` (mis. `http://192.168.1.10:4000/api/telemetry`) |
| Lewat **internet** (perangkat seluler/SIM800L) | URL publik server (VPS/tunnel) — lihat bagian §6 |

> Cara cek IP LAN server (Windows): jalankan `ipconfig` → lihat **IPv4 Address**.
> Pastikan keduanya satu jaringan & firewall mengizinkan port `4000`.

Cek koneksi: buka `http://<HOST>:4000/api/telemetry` di browser → muncul skema JSON.
Atau `http://<HOST>:4000/api/health` → `{"ok":true,...}`.

---

## 2. Format JSON yang dikirim

`Content-Type: application/json`. Kirim **satu objek**:

```json
{
  "id":  "MOTOR-001",
  "ts":  "2026-06-16T14:30:00Z",
  "lat": 1.48700,
  "lng": 124.83500,
  "spd": 45.2,
  "bat": 87,
  "sat": 8,
  "st":  "rented"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|:-----:|-----------|
| `id`  | string | ✅ | ID perangkat/motor, mis. `"MOTOR-001"` |
| `lat` | number | ✅ | Latitude (derajat desimal) |
| `lng` | number | ✅ | Longitude (derajat desimal) |
| `spd` | number | — | Kecepatan km/jam (default 0) |
| `bat` | number | — | Baterai % (0–100) |
| `sat` | number | — | Jumlah satelit GPS |
| `ts`  | string | — | Waktu ISO-8601; bila kosong dipakai waktu server |
| `st`  | string | — | `rented` / `available` / `maintenance` |

**Nama field alternatif diterima otomatis** (biar fleksibel dengan library GPS Anda):

```
device_id | imei     →  id
latitude            →  lat
longitude | lon | long →  lng
speed               →  spd
battery             →  bat
satellites          →  sat
```

Jadi payload seperti ini juga valid:

```json
{ "device_id": "MOTOR-002", "latitude": 1.489, "longitude": 124.840, "speed": 38, "battery": 80, "satellites": 9 }
```

### Kirim banyak unit sekaligus (opsional)

Bungkus dalam array — server memprosesnya satu per satu:

```json
[
  { "id": "MOTOR-001", "lat": 1.487, "lng": 124.835, "spd": 42 },
  { "id": "MOTOR-002", "lat": 1.489, "lng": 124.840, "spd": 38 }
]
```

### Respons server

```json
{ "ok": true, "accepted": 1, "rejected": 0 }
```

Jika `accepted: 0` → cek `id`, `lat`, `lng` ada dan berupa angka.

---

## 3. Contoh — `curl`

```bash
curl -X POST http://localhost:4000/api/telemetry \
  -H "content-type: application/json" \
  -d '{"id":"MOTOR-001","lat":1.487,"lng":124.835,"spd":45.2,"bat":87,"sat":8,"st":"rented"}'
```

## 4. Contoh — Python

```python
import requests, time

URL = "http://localhost:4000/api/telemetry"   # ganti <HOST> sesuai §1
# API_KEY = "rahasia"   # hanya jika server mengaktifkan INGEST_API_KEY

while True:
    payload = {
        "id": "MOTOR-001",
        "lat": 1.48700, "lng": 124.83500,
        "spd": 45.2, "bat": 87, "sat": 8, "st": "rented",
    }
    r = requests.post(URL, json=payload)   # , headers={"x-api-key": API_KEY}
    print(r.json())
    time.sleep(1)   # 1 Hz
```

## 5. Contoh — ESP32 / Arduino (HTTP)

```cpp
#include <HTTPClient.h>

void kirimTelemetri(float lat, float lng, float spd, int bat, int sat) {
  HTTPClient http;
  http.begin("http://<HOST>:4000/api/telemetry");        // ganti <HOST>
  http.addHeader("Content-Type", "application/json");
  // http.addHeader("x-api-key", "rahasia");             // jika diaktifkan

  String body = "{";
  body += "\"id\":\"MOTOR-001\",";
  body += "\"lat\":" + String(lat, 5) + ",";
  body += "\"lng\":" + String(lng, 5) + ",";
  body += "\"spd\":" + String(spd, 1) + ",";
  body += "\"bat\":" + String(bat) + ",";
  body += "\"sat\":" + String(sat) + ",";
  body += "\"st\":\"rented\"}";

  int code = http.POST(body);
  Serial.printf("HTTP %d: %s\n", code, http.getString().c_str());
  http.end();
}
```

## 5b. Alternatif — MQTT (sesuai proposal §III-D)

Bila pakai broker Mosquitto, publikasikan JSON yang sama ke topic per-unit
(QoS 1). Server otomatis berlangganan bila `MQTT_URL` diisi di `.env`.

```
Topic:    rental/motor/{id}/telemetry      (mis. rental/motor/MOTOR-001/telemetry)
Payload:  {"id":"MOTOR-001","lat":1.487,"lng":124.835,"spd":45.2,"bat":87,"sat":8,"st":"rented"}
QoS:      1
```

---

## 6. Membuat link bisa diakses dari luar

- **Satu Wi-Fi (paling mudah):** pakai IP LAN server (`http://192.168.x.x:4000/...`).
- **Lewat internet, cepat (untuk uji):** jalankan tunnel di PC server lalu beri rekan URL publiknya:
  ```bash
  npx localtunnel --port 4000        # atau: cloudflared tunnel --url http://localhost:4000
  ```
- **Permanen (produksi):** deploy server ke VPS/Railway/Render (Node.js host yang
  mendukung WebSocket). Catatan: **Vercel** cocok untuk dashboard (statis), **bukan**
  untuk server Socket.IO ini — gunakan host Node biasa.

## 7. Keamanan (opsional)

Jika di server `.env` diisi `INGEST_API_KEY=...`, setiap request **wajib** menyertakan
header:

```
x-api-key: <nilai INGEST_API_KEY>
```

Tanpa header yang benar → `401`. Biarkan kosong saat pengembangan.

---

### Ringkas untuk rekan Anda

> Kirim `POST` JSON ke **`http://<HOST>:4000/api/telemetry`** berisi minimal
> `id`, `lat`, `lng` (idealnya juga `spd`, `bat`, `sat`, `st`) setiap ~1 detik.
> Itu saja — dashboard langsung memperlihatkan unitnya secara real-time.
