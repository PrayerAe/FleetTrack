<div align="center">

# 🏍️ FleetTrack Manado — Smart Fleet Dashboard

**Web dashboard interaktif** untuk sistem monitoring sewa motor real-time berbasis IoT.
Menerima **data GPS nyata** dari perangkat lapangan melalui server (MQTT/HTTP → Socket.IO).

`React 18` · `TypeScript` · `Vite` · `TailwindCSS` · `Leaflet` · `Recharts` · `Framer Motion`

</div>

---

## 🛰️ Arsitektur data real

Tidak ada lagi simulasi di browser. Data telemetri **datang dari perangkat GPS nyata**:

```
GPS (ESP32 + NEO-6M + SIM800L) ──MQTT / HTTP JSON──▶ server Node.js
        (geofence Ray Casting · overspeed · baterai)  ──Socket.IO──▶ dashboard React (9 modul)
                                                       └────────────▶ PostgreSQL + InfluxDB (opsional)
```

- **Server** ada di [`server/`](server/) — lihat [server/README.md](server/README.md).
- **Cara perangkat/rekan mengirim data GPS** (link API + format JSON): **[INTEGRASI_API_GPS.md](INTEGRASI_API_GPS.md)**.

### Menjalankan lengkap (server + dashboard)

```bash
# Terminal 1 — server penerima telemetri
cd server && npm install && npm start          # http://localhost:4000

# Terminal 2 — dashboard
npm install && npm run dev                      # http://localhost:5173

# Terminal 3 (opsional) — emulator 10 unit GPS untuk uji tanpa hardware
cd server && npm run emulate
```

Atur alamat server lewat `.env` frontend (`VITE_API_URL`, default `http://localhost:4000`).

## ✨ Fitur

Dashboard berlangganan server via **Socket.IO**: 10 unit motor di Kota Manado mengirim telemetri
**± 1 Hz**, diperiksa terhadap **geofence (Ray Casting)** dan **batas kecepatan** di sisi server,
lalu di-broadcast ke 9 modul dasbor.

| Modul | Isi |
|------|-----|
| 🧭 **Dashboard** | Hero, KPI strip, mini live-map, donut status, alert terbaru, tren trip |
| 🗺️ **Live Map** | Leaflet + CARTO dark, marker meluncur halus antar tick, trail, geofence, popup, panel unit + filter/search |
| ⏱️ **Speed Monitor** | Gauge SVG animasi per unit, bar chart kecepatan, profil kecepatan MOTOR-001 |
| 🛡️ **Geofence Manager** | Peta zona + verteks, **uji titik Ray Casting interaktif** (klik peta), toggle zona, pseudocode |
| 📊 **Fleet Overview** | KPI cards, donut distribusi, tabel armada real-time |
| 🚨 **Alert Panel** | Alert streaming live (overspeed / geofence / low battery), filter severity, animasi masuk |
| 🧾 **Rental Management** | Tabel transaksi, ringkasan pendapatan, ekspor CSV, form sewa baru |
| 📈 **Analytics** | Trip harian, jarak per unit, rute terpopuler, hasil KPI, load test, ekspor CSV/PDF |
| 💻 **Telemetry Console** | Aliran payload **MQTT/JSON** mentah live, struktur topic, skema ISO-8601 |

Kontrol global di top-bar: **play/pause** simulasi, kecepatan **1× / 2× / 5×**, status koneksi
Socket.IO, latensi, msg/detik, dan jam simulasi. **Toast** muncul setiap ada alert baru.

---

## 🚀 Menjalankan

```bash
npm install      # sudah terpasang
npm run dev      # http://localhost:5173 (terbuka otomatis)
```

Build & preview produksi:

```bash
npm run build
npm run preview
```

## 🧪 Verifikasi (opsional)

Smoke-test headless yang memuat seluruh modul, menangkap error konsol, dan menyimpan screenshot
ke `scripts/shots/`:

```bash
npx playwright install chromium
node scripts/verify.mjs
```

---

## 🏗️ Arsitektur kode

```
server/                      # ← server penerima telemetri GPS (Node.js)
├─ src/server.js             # Express + Socket.IO + REST ingest
├─ src/fleet.js              # state armada + engine geofence/overspeed/baterai
├─ src/geo.js · geofences.js · devices.js
├─ src/mqtt.js · store.js    # subscriber MQTT · persistensi dual-DB opsional
├─ db/schema.sql             # skema PostgreSQL
└─ tools/device-emulator.mjs # pengganti perangkat untuk uji

src/                         # ← dashboard React
├─ data/fleet.ts             # metadata referensi (rental, analitik, KPI, BOM, geofence)
├─ lib/realtime.ts           # klien Socket.IO + tipe event server
├─ sim/
│  ├─ geo.ts                 # Ray Casting (uji titik interaktif di Geofence Manager)
│  └─ SimContext.tsx         # langganan Socket.IO + state global (fleet, alerts, feed, metrik)
├─ components/
│  ├─ layout/                # Sidebar, TopBar, AlertToaster
│  ├─ ui/ · modules/         # primitif UI · 9 modul dasbor
├─ nav.tsx · types.ts · lib/ui.ts · App.tsx
```

Posisi, kecepatan, baterai, dan satelit kini **berasal dari paket telemetri GPS nyata**
yang masuk ke server. Geofence + overspeed dievaluasi di server, lalu hasilnya
di-broadcast ke dashboard via Socket.IO — kontrak event identik dengan spesifikasi proposal.
Dataset referensi (rental, KPI, BOM, analitik) tetap di `src/data/fleet.ts`.

<div align="center">
<sub>FleetTrack Manado · live GPS telemetry · iCAST 2026</sub>
</div>
