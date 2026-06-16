# 🔥 Setup Firebase (gratis, tanpa kartu) — FleetTrack Manado

Firebase jadi "perantara" yang menerima data GPS dari teman Anda dan mengalirkannya
ke dashboard secara real-time. **Gratis (paket Spark), selalu online, tanpa kartu.**

```
Program GPS teman  ──PUT JSON (HTTP)──▶  Firebase Realtime DB  ──realtime──▶  Dashboard (Vercel)
```

## 1. Buat project Firebase
1. Buka **https://console.firebase.google.com** → login Google.
2. **Add project** → beri nama (mis. `fleettrack-manado`) → matikan Google Analytics (opsional) → **Create project**.

## 2. Buat Realtime Database
1. Menu kiri: **Build → Realtime Database** → **Create Database**.
2. Pilih lokasi (mis. *Singapore*) → mode **Start in test mode** → **Enable**.
3. Salin **URL database**-nya, mis. `https://fleettrack-manado-default-rtdb.firebaseio.com`.

## 3. Pasang aturan keamanan
Tab **Rules** di Realtime Database → tempel isi [firebase.rules.json](firebase.rules.json) → **Publish**.
(Mengizinkan tulis/baca hanya di path `/telemetry`. Untuk demo ini cukup; lihat catatan keamanan di bawah.)

## 4. Daftarkan Web App (untuk dashboard)
1. **Project settings** (ikon gerigi) → **General** → bagian *Your apps* → klik ikon **Web `</>`**.
2. Beri nama (mis. `dashboard`) → **Register app**.
3. Salin nilai `firebaseConfig` yang muncul: `apiKey`, `authDomain`, `databaseURL`, `projectId`, `appId`.

## 5. Masukkan ke dashboard (Vercel)
Di **Vercel → project → Settings → Environment Variables**, tambahkan (Production):

| Name | Value |
|------|-------|
| `VITE_FIREBASE_DATABASE_URL` | databaseURL (dari langkah 2/4) |
| `VITE_FIREBASE_API_KEY` | apiKey |
| `VITE_FIREBASE_AUTH_DOMAIN` | authDomain |
| `VITE_FIREBASE_PROJECT_ID` | projectId |
| `VITE_FIREBASE_APP_ID` | appId |

Lalu **Redeploy**. (Untuk uji lokal: salin ke file `.env` di root — lihat [.env.example](.env.example).)

## 6. Beri teman Anda link kirim data
Teman cukup `PUT` JSON ke:
```
https://<DATABASE_URL>/telemetry/<DEVICE_ID>.json
```
Detail + contoh kode: [INTEGRASI_API_GPS.md](INTEGRASI_API_GPS.md). Folder [gps-sender/](gps-sender/) siap pakai.

---

### Catatan keamanan
Aturan di `firebase.rules.json` membuka tulis/baca pada `/telemetry` (tanpa login) agar
teman Anda mudah mengirim. Cukup untuk demo/penelitian. Untuk produksi, kunci dengan
token (`?auth=`) atau Firebase App Check, dan batasi `.write` per device.
