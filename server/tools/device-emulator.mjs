// Device emulator — a stand-in for the physical ESP32 + NEO-6M + SIM800L units.
//
// It pushes REAL telemetry packets into the server's ingest API exactly like a
// field device would, so you can watch the live pipeline (ingest → geofence →
// Socket.IO → dashboard) end-to-end before the hardware is wired up. Delete or
// stop this once real devices are reporting.
//
//   node tools/device-emulator.mjs                     # HTTP POST @1 Hz, 10 units
//   API=http://host:4000 KEY=secret RATE=1 node tools/device-emulator.mjs
//
// No dependencies — uses Node 18+ global fetch.

const API = process.env.API ?? 'http://localhost:4000'
const KEY = process.env.KEY ?? ''
const RATE = Number(process.env.RATE ?? 1) // Hz

// Starting positions + behavior per unit (mirrors the registry).
const UNITS = [
  { id: 'MOTOR-001', lat: 1.487, lng: 124.835, base: 34, st: 'rented' },
  { id: 'MOTOR-002', lat: 1.489, lng: 124.84, base: 36, st: 'rented' },
  { id: 'MOTOR-003', lat: 1.495, lng: 124.852, base: 30, st: 'rented' },
  { id: 'MOTOR-004', lat: 1.484, lng: 124.843, base: 32, st: 'rented' },
  { id: 'MOTOR-005', lat: 1.4952, lng: 124.8322, base: 0, st: 'available' },
  { id: 'MOTOR-006', lat: 1.5061, lng: 124.8338, base: 0, st: 'available' },
  { id: 'MOTOR-007', lat: 1.4842, lng: 124.8444, base: 0, st: 'available' },
  { id: 'MOTOR-008', lat: 1.486, lng: 124.834, base: 66, st: 'rented' }, // overspeed
  { id: 'MOTOR-009', lat: 1.448, lng: 124.795, base: 32, st: 'rented' }, // outside zone
  { id: 'MOTOR-010', lat: 1.4982, lng: 124.8534, base: 0, st: 'maintenance' },
]

const state = UNITS.map((u) => ({
  ...u,
  heading: Math.random() * Math.PI * 2,
  bat: 60 + Math.random() * 35,
  spd: u.base,
}))

function tick() {
  const batch = state.map((u) => {
    const moving = u.base > 0
    if (moving) {
      u.spd = Math.max(0, u.base + (Math.random() - 0.5) * 10)
      u.heading += (Math.random() - 0.5) * 0.5
      const metersPerTick = (u.spd / 3.6) / RATE
      const dLat = (metersPerTick * Math.cos(u.heading)) / 111_320
      const dLng = (metersPerTick * Math.sin(u.heading)) / (111_320 * Math.cos((u.lat * Math.PI) / 180))
      u.lat += dLat
      u.lng += dLng
      u.bat = Math.max(8, u.bat - 0.004)
    } else {
      u.spd = 0
    }
    return {
      id: u.id,
      ts: new Date().toISOString(),
      lat: +u.lat.toFixed(5),
      lng: +u.lng.toFixed(5),
      spd: +u.spd.toFixed(1),
      bat: Math.round(u.bat),
      sat: 6 + Math.round(Math.random() * 5),
      st: u.st,
    }
  })

  fetch(`${API}/api/telemetry`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(KEY ? { 'x-api-key': KEY } : {}) },
    body: JSON.stringify(batch),
  })
    .then((r) => r.json())
    .then((j) => process.stdout.write(`\r→ ${API}  sent ${batch.length}  accepted ${j.accepted ?? '?'}   `))
    .catch((e) => process.stdout.write(`\r✗ ${e.message}            `))
}

console.log(`Emulating ${UNITS.length} GPS units → ${API}/api/telemetry @ ${RATE} Hz (Ctrl+C to stop)`)
setInterval(tick, 1000 / RATE)
tick()
