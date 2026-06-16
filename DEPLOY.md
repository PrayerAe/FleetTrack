# 🚀 Deploy — FleetTrack Manado

Server dan dashboard di-deploy **terpisah** karena sifatnya berbeda.

```
Program GPS (rekan)  ──HTTPS POST JSON──▶  SERVER (Render)  ──WSS──▶  DASHBOARD (Vercel)
```

## 1. Push ke GitHub

```bash
git init                 # sudah disiapkan; lihat .gitignore
git add -A
git commit -m "FleetTrack Manado — live GPS telemetry"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

> ⚠️ **Sengaja TIDAK ikut ke repo/deploy** (diatur di `.gitignore` & `.vercelignore`):
> `.claude/` (konfigurasi editor), proposal & paper (`*.docx`, `*.pdf`,
> `FleetTrack_*.md`), serta figur paper (`fig*.png`). Cek dengan `git status`
> sebelum commit untuk memastikan file-file itu tidak terdaftar.

## 2. Deploy SERVER → Render

Render → **New → Blueprint** → pilih repo ini. Render membaca [render.yaml](render.yaml):
- Root `server/`, build `npm install`, start `npm start`, health `/api/health`.
- Set env `CORS_ORIGIN` ke URL dashboard (atau `*`), dan `INGEST_API_KEY` bila perlu.

Dapat URL, mis. `https://fleettrack-server.onrender.com`. Tes: buka `…/api/health`.

## 3. Deploy DASHBOARD → Vercel

Vercel → import repo (config di [vercel.json](vercel.json)). Tambahkan Environment Variable:

```
VITE_API_URL = https://fleettrack-server.onrender.com
```

Deploy → dapat URL, mis. `https://fleettrack.vercel.app`.
**Penting:** `VITE_API_URL` dipanggang saat build — redeploy bila URL server berubah.

## 4. Sambungkan & uji

1. (Jika `CORS_ORIGIN` belum `*`) set ke URL Vercel, redeploy server.
2. Beri rekan link ingest: `https://fleettrack-server.onrender.com/api/telemetry`
   (format JSON di [INTEGRASI_API_GPS.md](INTEGRASI_API_GPS.md)).
3. Rekan jalankan [gps-sender/](gps-sender/) → unit muncul real-time di dashboard.

## Catatan free-tier

Render gratis menidurkan server saat menganggur ~15 menit (request pertama lambat).
Begitu perangkat GPS mengirim rutin, server tetap hidup. Untuk demo penting, pakai
paket berbayar kecil atau VPS.
