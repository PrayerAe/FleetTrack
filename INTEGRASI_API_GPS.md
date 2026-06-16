# 📡 API Pengiriman Data GPS — FleetTrack Manado (Firebase)

Dokumen untuk **rekan yang menulis program/perangkat GPS**. Program Anda cukup
mengirim **satu HTTP request JSON** per pembacaan ke URL Firebase di bawah. Dashboard
otomatis menempatkan unit di peta, menghitung geofence/overspeed, dan menampilkannya
real-time. **Tanpa SDK, tanpa instalasi — hanya HTTP + JSON.**

---

## 1. Link API (endpoint)

```
PUT  https://<DATABASE_URL>/telemetry/<DEVICE_ID>.json
```

- `<DATABASE_URL>` = URL Realtime Database, mis. `https://fleettrack-manado-default-rtdb.firebaseio.com`
- `<DEVICE_ID>`   = id unit, mis. `MOTOR-001`

Contoh URL jadi:
```
https://fleettrack-manado-default-rtdb.firebaseio.com/telemetry/MOTOR-001.json
```

> **PUT** menimpa data terbaru unit itu (selalu posisi terkini). Kirim ulang tiap ~1 detik.
> Untuk uji koneksi: buka URL di browser → menampilkan data terakhir (atau `null` bila kosong).

---

## 2. Format JSON yang dikirim

`Content-Type: application/json`. Body = satu objek:

```json
{
  "lat": 1.48700,
  "lng": 124.83500,
  "spd": 45.2,
  "bat": 87,
  "sat": 8,
  "st":  "rented",
  "ts":  "2026-06-16T14:30:00Z"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|:-----:|-----------|
| `lat` | number | ✅ | Latitude (derajat desimal) |
| `lng` | number | ✅ | Longitude (derajat desimal) |
| `spd` | number | — | Kecepatan km/jam |
| `bat` | number | — | Baterai % (0–100) |
| `sat` | number | — | Jumlah satelit |
| `st`  | string | — | `rented` / `available` / `maintenance` |
| `ts`  | string | — | Waktu ISO-8601 (bila kosong, dashboard pakai waktu terima) |

> `id` unit **tidak perlu** di body — sudah ada di URL (`/telemetry/<DEVICE_ID>.json`).

**Nama field alternatif diterima otomatis** (dinormalkan di dashboard):
```
latitude → lat   ·   longitude | lon | long → lng   ·   speed → spd
battery → bat    ·   satellites → sat
```

---

## 3. Contoh — `curl`

```bash
curl -X PUT "https://<DATABASE_URL>/telemetry/MOTOR-001.json" \
  -H "content-type: application/json" \
  -d '{"lat":1.487,"lng":124.835,"spd":45.2,"bat":87,"sat":8,"st":"rented"}'
```

## 4. Contoh — Python

```python
import requests, time

DB = "https://<DATABASE_URL>"   # ganti
DEVICE = "MOTOR-001"

while True:
    payload = {"lat": 1.487, "lng": 124.835, "spd": 45.2, "bat": 87, "sat": 8, "st": "rented"}
    r = requests.put(f"{DB}/telemetry/{DEVICE}.json", json=payload)
    print(r.status_code, r.text)
    time.sleep(1)   # 1 Hz
```

> Folder **[gps-sender/](gps-sender/)** sudah berisi program Python siap pakai (mode demo & GPS serial).

## 5. Contoh — ESP32 / Arduino (HTTP)

```cpp
#include <HTTPClient.h>

void kirim(float lat, float lng, float spd, int bat, int sat) {
  HTTPClient http;
  http.begin("https://<DATABASE_URL>/telemetry/MOTOR-001.json");   // ganti
  http.addHeader("Content-Type", "application/json");
  String body = "{";
  body += "\"lat\":" + String(lat, 5) + ",";
  body += "\"lng\":" + String(lng, 5) + ",";
  body += "\"spd\":" + String(spd, 1) + ",";
  body += "\"bat\":" + String(bat) + ",";
  body += "\"sat\":" + String(sat) + ",";
  body += "\"st\":\"rented\"}";
  int code = http.PUT(body);                 // PUT, bukan POST
  Serial.printf("HTTP %d\n", code);
  http.end();
}
```

---

## 6. Keamanan (opsional)

Untuk demo, database mengizinkan tulis tanpa login. Bila nanti diaktifkan token,
tambahkan `?auth=<TOKEN>` pada URL:
```
https://<DATABASE_URL>/telemetry/MOTOR-001.json?auth=<TOKEN>
```

---

### Ringkas untuk rekan Anda

> **PUT** JSON berisi minimal `lat` & `lng` (idealnya juga `spd`, `bat`, `sat`, `st`)
> ke **`https://<DATABASE_URL>/telemetry/<DEVICE_ID>.json`** setiap ~1 detik. Selesai —
> dashboard langsung menampilkan unitnya real-time.
