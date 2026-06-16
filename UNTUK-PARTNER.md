# 📡 Cara Kirim Data GPS ke Dashboard FleetTrack

Kirim data GPS dalam bentuk **JSON** ke alamat di bawah; dashboard menampilkannya
real-time. Tidak perlu install/SDK — cukup **HTTP + JSON**.

## 1. Endpoint
```
PUT https://fleettrack-manado-ecbb8-default-rtdb.asia-southeast1.firebasedatabase.app/telemetry/MOTOR-001.json
Content-Type: application/json
```

> ID unit ada di URL, jadi **tidak perlu** ditaruh di body. Kirim ulang tiap ~1 detik (1 Hz).

## 2. Format JSON
```json
{ "lat": 1.487, "lng": 124.835, "spd": 45.2, "bat": 87, "sat": 8, "st": "rented" }
```

| Field | Wajib | Keterangan |
|-------|:-----:|-----------|
| `lat` | ✅ | Latitude (derajat desimal) |
| `lng` | ✅ | Longitude (derajat desimal) |
| `spd` | — | Kecepatan km/jam |
| `bat` | — | Baterai % (0–100) |
| `sat` | — | Jumlah satelit |
| `st`  | — | `rented` / `available` / `maintenance` |
| `ts`  | — | Waktu ISO-8601 (opsional) |

Nama field alternatif diterima otomatis: `latitude`→lat, `longitude`/`lon`→lng,
`speed`→spd, `battery`→bat, `satellites`→sat.

## 3. Tes cepat (curl)
```bash
curl -X PUT "https://fleettrack-manado-ecbb8-default-rtdb.asia-southeast1.firebasedatabase.app/telemetry/MOTOR-001.json" \
  -H "content-type: application/json" \
  -d "{\"lat\":1.487,\"lng\":124.835,\"spd\":40,\"bat\":85,\"sat\":9,\"st\":\"rented\"}"
```

Kalau balasannya menampilkan JSON yang sama = **berhasil**. Cek hasilnya muncul di
dashboard: **https://icast-her.vercel.app**

> Catatan: `id` unit cukup di URL (tak perlu di body). Belum perlu autentikasi.
