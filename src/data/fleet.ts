import type { AlertItem, Geofence, Kpi, LatLng, Rental } from '../types'

/** Geographic center of Kota Manado (§4 of the spec). */
export const MANADO_CENTER: LatLng = [1.4748, 124.8421]

/** Operational geofence — 7-vertex polygon in [lng, lat] (GeoJSON, §5.1). */
export const ZONE_POLYGON: number[][] = [
  [124.825, 1.518],
  [124.865, 1.521],
  [124.888, 1.496],
  [124.87, 1.46],
  [124.825, 1.438],
  [124.805, 1.452],
  [124.806, 1.49],
  [124.825, 1.518],
]

export const GEOFENCES: Geofence[] = [
  { id: 1, name: 'Zona Operasional Manado', polygon: ZONE_POLYGON, active: true },
  {
    id: 2,
    name: 'Zona Bandara Sam Ratulangi',
    polygon: [
      [124.91, 1.56],
      [124.94, 1.562],
      [124.95, 1.54],
      [124.93, 1.528],
      [124.908, 1.54],
      [124.91, 1.56],
    ],
    active: false,
  },
]

/** Historical trip trace for MOTOR-001 (§4.3) — [lat,lng,speed]. */
export const MOTOR001_TRACE: { t: string; lat: number; lng: number; spd: number; bat: number; sat: number }[] = [
  { t: '10:22', lat: 1.487, lng: 124.835, spd: 0, bat: 91, sat: 11 },
  { t: '10:23', lat: 1.48826, lng: 124.83461, spd: 12, bat: 90, sat: 11 },
  { t: '10:24', lat: 1.49065, lng: 124.83595, spd: 24, bat: 89, sat: 8 },
  { t: '10:25', lat: 1.49432, lng: 124.83354, spd: 33, bat: 88, sat: 10 },
  { t: '10:26', lat: 1.49915, lng: 124.83194, spd: 41, bat: 87, sat: 10 },
  { t: '10:27', lat: 1.50267, lng: 124.83111, spd: 38, bat: 86, sat: 10 },
  { t: '10:28', lat: 1.50892, lng: 124.83225, spd: 47, bat: 85, sat: 8 },
  { t: '10:29', lat: 1.51544, lng: 124.8299, spd: 52, bat: 84, sat: 9 },
  { t: '10:30', lat: 1.51895, lng: 124.83109, spd: 49, bat: 83, sat: 8 },
  { t: '10:31', lat: 1.52357, lng: 124.83036, spd: 44, bat: 82, sat: 8 },
  { t: '10:32', lat: 1.53149, lng: 124.83291, spd: 61, bat: 81, sat: 10 },
  { t: '10:33', lat: 1.53602, lng: 124.82978, spd: 58, bat: 80, sat: 8 },
  { t: '10:34', lat: 1.53841, lng: 124.82917, spd: 36, bat: 79, sat: 8 },
  { t: '10:35', lat: 1.54135, lng: 124.82894, spd: 22, bat: 78, sat: 9 },
  { t: '10:36', lat: 1.54232, lng: 124.82868, spd: 14, bat: 77, sat: 9 },
  { t: '10:37', lat: 1.54232, lng: 124.82868, spd: 0, bat: 76, sat: 11 },
]

/** Speed profile of MOTOR-001's recorded trip (for the detail chart). */
export const MOTOR001_SPEED_PROFILE = MOTOR001_TRACE.map((p, i) => ({
  t: `t${i}`,
  time: p.t,
  spd: p.spd,
}))

const d = (day: number, time: string) => new Date(`2026-02-${day}T${time}+08:00`)

/** Seeded alert history (§5.5). New live alerts are prepended by the engine. */
export const SEED_ALERTS: AlertItem[] = [
  { id: 'A-08-os', time: d(18, '10:32:14'), device_id: 'MOTOR-008', type: 'Overspeed', severity: 'TINGGI', detail: 'Kecepatan 68 km/h melebihi batas 60 km/h di Jl. Boulevard' },
  { id: 'A-09-gf', time: d(18, '10:29:51'), device_id: 'MOTOR-009', type: 'Geofence Violation', severity: 'TINGGI', detail: 'Unit keluar zona operasional di Malalayang (1.450, 124.795)' },
  { id: 'A-04-lb', time: d(18, '09:58:03'), device_id: 'MOTOR-004', type: 'Low Battery', severity: 'SEDANG', detail: 'Baterai 17% — di bawah ambang 20%' },
  { id: 'A-01-os', time: d(18, '09:41:37'), device_id: 'MOTOR-001', type: 'Overspeed', severity: 'RENDAH', detail: 'Kecepatan 61 km/h sesaat (durasi < 8 dtk)' },
  { id: 'A-06-gf', time: d(18, '08:50:12'), device_id: 'MOTOR-006', type: 'Geofence Violation', severity: 'TINGGI', detail: 'Unit mendekati batas timur zona (auto-resolved)' },
  { id: 'A-03-idle', time: d(17, '22:14:09'), device_id: 'MOTOR-003', type: 'Idle Timeout', severity: 'RENDAH', detail: 'Tidak bergerak > 5 menit — masuk deep sleep' },
  { id: 'A-10-mnt', time: d(17, '19:03:44'), device_id: 'MOTOR-010', type: 'Maintenance', severity: 'INFO', detail: 'Unit ditandai maintenance oleh admin' },
  { id: 'A-02-sat', time: d(17, '16:27:20'), device_id: 'MOTOR-002', type: 'Low Satellite', severity: 'RENDAH', detail: 'Jumlah satelit turun ke 4 (urban canyon), interpolasi aktif' },
]

/** Rental ledger (§5.6). */
export const RENTALS: Rental[] = [
  { id: 'RNT-2301', device: 'MOTOR-004', model: 'Honda Scoopy 110', renter: 'Brian Tampi', start: '13/02 11:45', durationDays: 3, tarif: 255000, status: 'Aktif' },
  { id: 'RNT-2302', device: 'MOTOR-006', model: 'Honda PCX 160', renter: 'Maria Lengkong', start: '18/02 14:00', durationDays: 2, tarif: 320000, status: 'Aktif' },
  { id: 'RNT-2303', device: 'MOTOR-004', model: 'Honda Scoopy 110', renter: 'Cindy Manopo', start: '15/02 07:15', durationDays: 1, tarif: 85000, status: 'Aktif' },
  { id: 'RNT-2304', device: 'MOTOR-004', model: 'Honda Scoopy 110', renter: 'Gloria Sondakh', start: '11/02 07:15', durationDays: 1, tarif: 85000, status: 'Aktif' },
  { id: 'RNT-2305', device: 'MOTOR-001', model: 'Honda BeAT 110', renter: 'Andre Wenas', start: '15/02 08:15', durationDays: 7, tarif: 560000, status: 'Selesai' },
  { id: 'RNT-2306', device: 'MOTOR-008', model: 'Honda Genio 110', renter: 'Maria Lengkong', start: '18/02 09:45', durationDays: 1, tarif: 85000, status: 'Selesai' },
  { id: 'RNT-2307', device: 'MOTOR-008', model: 'Honda Genio 110', renter: 'Gloria Sondakh', start: '16/02 10:00', durationDays: 7, tarif: 595000, status: 'Selesai' },
  { id: 'RNT-2308', device: 'MOTOR-007', model: 'Yamaha Fazzio 125', renter: 'Naomi Sumual', start: '16/02 13:45', durationDays: 2, tarif: 180000, status: 'Selesai' },
  { id: 'RNT-2309', device: 'MOTOR-001', model: 'Honda BeAT 110', renter: 'Naomi Sumual', start: '11/02 07:45', durationDays: 5, tarif: 400000, status: 'Selesai' },
  { id: 'RNT-2310', device: 'MOTOR-006', model: 'Honda PCX 160', renter: 'Maria Lengkong', start: '11/02 10:15', durationDays: 7, tarif: 1120000, status: 'Selesai' },
]

/** Analytics datasets (§5.7). */
export const DAILY_TRIPS = [
  { day: 'Sen', trips: 34 },
  { day: 'Sel', trips: 31 },
  { day: 'Rab', trips: 32 },
  { day: 'Kam', trips: 42 },
  { day: 'Jum', trips: 44 },
  { day: 'Sab', trips: 56 },
  { day: 'Min', trips: 41 },
]

export const DISTANCE_PER_UNIT = [
  { unit: 'M01', km: 465 },
  { unit: 'M02', km: 694 },
  { unit: 'M03', km: 531 },
  { unit: 'M04', km: 673 },
  { unit: 'M05', km: 567 },
  { unit: 'M06', km: 397 },
  { unit: 'M07', km: 720 },
  { unit: 'M08', km: 664 },
  { unit: 'M09', km: 709 },
  { unit: 'M10', km: 695 },
]

export const POPULAR_ROUTES = [
  { rank: 1, route: 'Boulevard ↔ Mega Mall', trips: 137 },
  { rank: 2, route: 'Bahu ↔ Pusat Kota (Pasar 45)', trips: 110 },
  { rank: 3, route: 'Bandara ↔ Boulevard', trips: 94 },
  { rank: 4, route: 'Malalayang ↔ Bahu', trips: 75 },
  { rank: 5, route: 'Megamas ↔ Tomohon', trips: 53 },
]

/** KPI target vs simulated result (§6.1). */
export const KPIS: Kpi[] = [
  { metric: 'Akurasi GPS (CEP 50%)', target: '< 5 m', result: '3.8 m', ok: true },
  { metric: 'Frekuensi update', target: '1 Hz', result: '1.0 Hz', ok: true },
  { metric: 'Latensi end-to-end', target: '< 3 s', result: '1.7 s (p95 2.6 s)', ok: true },
  { metric: 'Uptime sistem', target: '> 99%', result: '99.6%', ok: true },
  { metric: 'Akurasi kecepatan', target: '< 5% deviasi', result: '3.2%', ok: true },
  { metric: 'Baterai (aktif)', target: '> 12 jam', result: '14.5 jam', ok: true },
  { metric: 'Baterai (deep sleep)', target: '> 72 jam', result: '81 jam', ok: true },
  { metric: 'Konsumsi daya (aktif)', target: '< 500 mW', result: '430 mW', ok: true },
  { metric: 'Throughput konkuren', target: '50+ unit @1Hz', result: '50 unit · 0 drop', ok: true },
  { metric: 'SUS score', target: '> 70', result: '78.5 (12 operator)', ok: true },
  { metric: 'Biaya per unit', target: '< Rp 500.000', result: 'Rp 412.000', ok: true },
]

/** Load-testing results (§6.2). */
export const LOAD_TEST = [
  { aspect: 'Beban pesan', value: '50 msg/s · 180.000 pesan/jam' },
  { aspect: 'CPU broker (Mosquitto)', value: '~18%' },
  { aspect: 'RAM broker', value: '~210 MB' },
  { aspect: 'Latensi tulis InfluxDB (p95)', value: '~12 ms' },
  { aspect: 'Latensi broadcast WebSocket (p95)', value: '~140 ms' },
  { aspect: 'Kehilangan pesan (QoS 1)', value: '0' },
]

// ============================================================================
//  RESEARCH FINDINGS — datasets hasil pengukuran lapangan untuk menekankan NOVELTY
// ============================================================================

/** Posisi terhadap state-of-the-art (skor 0–100) — 7 sumbu radar. */
export const NOVELTY_RADAR = [
  { axis: 'Spesifik Rental Motor', fleet: 95, car: 35, generic: 25 },
  { axis: 'Dual-Database', fleet: 92, car: 55, generic: 15 },
  { axis: 'Geofence Kustom', fleet: 90, car: 72, generic: 45 },
  { axis: 'Skalabilitas MQTT', fleet: 88, car: 78, generic: 50 },
  { axis: 'Biaya Rendah', fleet: 94, car: 28, generic: 62 },
  { axis: 'Real-time < 3s', fleet: 91, car: 68, generic: 55 },
  { axis: 'Open Source', fleet: 96, car: 18, generic: 22 },
]

export interface Pillar {
  no: number
  title: string
  desc: string
  metric: string
}

/** 5 pilar kebaruan (Tinjauan §2.2). */
export const NOVELTY_PILLARS: Pillar[] = [
  { no: 1, title: 'Platform End-to-End Khusus Rental Motor', desc: 'Mayoritas literatur fleet-tracking menyasar roda-4/industri. Sistem terpadu khusus rental sepeda motor di negara berkembang masih jarang.', metric: 'Celah riset nyata' },
  { no: 2, title: 'Arsitektur Dual-Database', desc: 'Pemisahan PostgreSQL (relasional) untuk entitas & InfluxDB (time-series) untuk deret lokasi/kecepatan — keputusan tepat yang jarang dibahas.', metric: 'PostgreSQL + InfluxDB' },
  { no: 3, title: 'Geofence Ray Casting Kustom', desc: 'Operator menggambar/mengubah poligon zona sendiri; point-in-polygon dijalankan server tiap paket telemetri.', metric: 'O(n) per paket' },
  { no: 4, title: 'MQTT QoS-1 untuk 50+ Unit', desc: 'Publish-subscribe ringan, andal di bandwidth rendah, terbukti 50 msg/s tanpa kehilangan pesan pada soak 1 jam.', metric: '50 unit · 0 drop' },
  { no: 5, title: 'Desain Hemat Biaya Open-Source', desc: 'BOM Rp 412.000/unit dengan komponen open-source (ESP32, Leaflet/OSM, Mosquitto) — di bawah target Rp 500.000.', metric: 'ROI 6–8 bulan' },
]

/** Skalabilitas — latensi end-to-end vs jumlah device concurrent @1Hz. */
export const SCALABILITY = [
  { devices: 5, avg: 0.4, p95: 0.7, drop: 0 },
  { devices: 10, avg: 0.6, p95: 1.0, drop: 0 },
  { devices: 20, avg: 0.9, p95: 1.5, drop: 0 },
  { devices: 30, avg: 1.2, p95: 1.9, drop: 0 },
  { devices: 40, avg: 1.5, p95: 2.3, drop: 0 },
  { devices: 50, avg: 1.7, p95: 2.6, drop: 0 },
]

/** Field testing 2 fase (§6.3). */
export const FIELD_TEST = {
  rows: [
    { metric: 'Total telemetri terkirim', f1: '± 1,29 juta', f2: '± 5,18 juta' },
    { metric: 'Akurasi GPS rata-rata', f1: '4,1 m', f2: '3,8 m' },
    { metric: 'Uptime', f1: '99,2%', f2: '99,6%' },
    { metric: 'Insiden geofence terdeteksi', f1: '3', f2: '7' },
    { metric: 'Alert overspeed', f1: '41', f2: '96' },
    { metric: 'Baterai (median)', f1: '13,8 jam', f2: '14,5 jam' },
  ],
  telemetry: [
    { phase: 'Fase 1\n(5 unit · 30 hari)', juta: 1.29 },
    { phase: 'Fase 2\n(10 unit · 60 hari)', juta: 5.18 },
  ],
  accuracy: [
    { phase: 'Fase 1', m: 4.1 },
    { phase: 'Fase 2', m: 3.8 },
  ],
}

/** System Usability Scale (§6.3). */
export const SUS = {
  score: 78.5,
  grade: 'B',
  adjective: 'Good',
  acceptable: 70,
  industryAvg: 68,
  operators: 12,
  // titik referensi pada skala adjective (Bangor et al.)
  scale: [
    { label: 'Worst', x: 12 },
    { label: 'Poor', x: 35 },
    { label: 'OK', x: 52 },
    { label: 'Good', x: 73 },
    { label: 'Excellent', x: 85 },
    { label: 'Best', x: 96 },
  ],
}

/** Perbandingan biaya per unit vs alternatif (Rp). */
export const COST_COMPARISON = [
  { name: 'FleetTrack Manado', cost: 412000 },
  { name: 'Target Proposal', cost: 500000 },
  { name: 'GPS Tracker Komersial', cost: 1500000 },
  { name: 'Sistem Fleet Roda-4', cost: 2800000 },
]

export function costColor(name: string): string {
  if (name === 'FleetTrack Manado') return '#22c55e'
  if (name === 'Target Proposal') return '#7c3aed'
  return '#475569'
}

/** KPI sebagai pencapaian relatif (untuk bullet bar). */
export const KPI_ACHIEVEMENT = [
  { metric: 'Akurasi GPS', target: 5, result: 3.8, unit: 'm', better: 'lower' as const },
  { metric: 'Latensi end-to-end', target: 3, result: 1.7, unit: 's', better: 'lower' as const },
  { metric: 'Uptime sistem', target: 99, result: 99.6, unit: '%', better: 'higher' as const },
  { metric: 'Deviasi kecepatan', target: 5, result: 3.2, unit: '%', better: 'lower' as const },
  { metric: 'Baterai aktif', target: 12, result: 14.5, unit: 'jam', better: 'higher' as const },
  { metric: 'Konsumsi daya', target: 500, result: 430, unit: 'mW', better: 'lower' as const },
  { metric: 'SUS score', target: 70, result: 78.5, unit: '', better: 'higher' as const },
  { metric: 'Biaya per unit', target: 500, result: 412, unit: 'rb', better: 'lower' as const },
]

/** Validitas deteksi — confusion matrix per jenis kejadian (hasil uji lapangan). */
export const DETECTION = [
  { name: 'Deteksi Overspeed', tp: 96, fp: 4, fn: 3, tn: 897 },
  { name: 'Deteksi Geofence', tp: 7, fp: 1, fn: 0, tn: 992 },
]

/** Benchmark terhadap pendekatan terdahulu (komparatif, bukan sitasi spesifik). */
export const BENCHMARK = {
  cols: ['Sistem', 'Kendaraan', 'Real-time', 'Geofence kustom', 'Dual-DB', 'Biaya/unit', 'Akurasi', 'Open-source'],
  rows: [
    { sys: 'FleetTrack Manado (ini)', vehicle: 'Motor rental', rt: '✓ < 3 s', geo: '✓ Ray Casting', dual: '✓', cost: 'Rp 412 rb', acc: '3,8 m', os: '✓', highlight: true },
    { sys: 'Platform rental mobil', vehicle: 'Mobil', rt: '✓ ~5 s', geo: 'tetap', dual: '✗', cost: '> Rp 1,5 jt', acc: '5 m', os: '✗', highlight: false },
    { sys: 'Fleet truk industri', vehicle: 'Truk', rt: '✓', geo: 'tetap', dual: '✗', cost: '> Rp 2,5 jt', acc: '4 m', os: '✗', highlight: false },
    { sys: 'GPS tracker komersial', vehicle: 'Umum', rt: 'polling', geo: 'radius', dual: '✗', cost: 'Rp 1,5 jt', acc: '5–10 m', os: '✗', highlight: false },
    { sys: 'Riset geofence sepeda', vehicle: 'Sepeda', rt: 'batch', geo: '✓', dual: '✗', cost: 'n/a', acc: '8 m', os: '✓', highlight: false },
  ],
}

export const SDG_GOALS = [
  { sdg: 8, color: '#a21caf', title: 'Pekerjaan Layak & Pertumbuhan Ekonomi', desc: 'Digitalisasi UMKM, keputusan berbasis data, biaya terjangkau.', targets: '8.2 · 8.3 · 8.9' },
  { sdg: 9, color: '#ea580c', title: 'Industri, Inovasi & Infrastruktur', desc: 'Retrofit IoT pada armada rental; transfer teknologi ke UMKM.', targets: '9.1 · 9.4 · 9.5 · 9.b' },
  { sdg: 11, color: '#f59e0b', title: 'Kota & Permukiman Berkelanjutan', desc: 'Kontrol kecepatan + geofence → mobilitas lebih aman; data perencanaan transportasi.', targets: '11.2 · 11.3 · 11.6' },
]

/** Bill of Materials per unit (§8.1). */
export const BOM = [
  { item: 'Mikrokontroler ESP32 DevKit V1', price: 68000 },
  { item: 'Modul GPS NEO-6M + antena keramik', price: 62000 },
  { item: 'Modul GSM SIM800L (2G/GPRS)', price: 48000 },
  { item: 'Sensor Hall Effect A3144 + magnet', price: 13000 },
  { item: 'Baterai Li-Po 3.7V 2000mAh', price: 65000 },
  { item: 'Modul charging TP4056 + proteksi', price: 9000 },
  { item: 'Custom PCB (2-layer)', price: 52000 },
  { item: 'Enclosure IP65 (cetak 3D PLA+)', price: 42000 },
  { item: 'Kabel, pin header, komponen pasif', price: 28000 },
  { item: 'Amortisasi kartu SIM + kuota', price: 25000 },
]
