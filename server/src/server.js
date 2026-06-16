// FleetTrack Manado — cloud server.
//
//   GPS device ──MQTT/HTTP──▶ ingest ──▶ geofence + speed engine ──▶ Socket.IO ──▶ dashboard
//                                   └────────────────▶ dual database (optional)
//
// Receives real telemetry "thrown" by the GPS units, scores it, persists it, and
// pushes live updates to every connected dashboard. No simulation anywhere.

import http from 'node:http'
import express from 'express'
import cors from 'cors'
import { Server as SocketServer } from 'socket.io'

import { config } from './config.js'
import { FleetState } from './fleet.js'
import { createStore } from './store.js'
import { startMqtt } from './mqtt.js'
import { GEOFENCES } from './geofences.js'

const log = console

const store = await createStore(config, log)
const state = new FleetState({ onAlert: (a) => store.writeAlert(a) })

const app = express()
app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin }))
app.use(express.json({ limit: '256kb' }))

const server = http.createServer(app)
const io = new SocketServer(server, {
  cors: { origin: config.corsOrigin === '*' ? true : config.corsOrigin },
})

// ── Core ingest pipeline (shared by MQTT and HTTP) ───────────────────────────
function handleTelemetry(raw) {
  const result = state.ingest(raw)
  if (!result) return false
  const { device, telemetry, newAlerts } = result

  io.emit('telemetry', { ...telemetry, rxTs: new Date().toISOString() })
  io.emit('device:update', device)
  for (const a of newAlerts) io.emit('alert', a)

  store.writeTelemetry(telemetry)
  store.upsertDeviceStatus(device)
  return true
}

// ── MQTT (device → server) ───────────────────────────────────────────────────
const mqttBridge = startMqtt(config, handleTelemetry, log)

// ── REST API ─────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    uptimeSec: Math.round(process.uptime()),
    devices: state.devices.size,
    online: [...state.devices.values()].filter((m) => m.online).length,
    mqtt: !!mqttBridge,
    store: config.store,
    serverTs: new Date().toISOString(),
  })
})

app.get('/api/fleet', (_req, res) => res.json(state.snapshot().devices))
app.get('/api/alerts', (_req, res) => res.json(state.alerts))
app.get('/api/geofences', (_req, res) => res.json(GEOFENCES))

// Ingest endpoint for GPS devices that POST over HTTP (e.g. SIM800L/GPRS), and
// the easiest way to test the pipeline. Accepts one packet or an array.
function checkApiKey(req, res) {
  if (!config.ingestApiKey) return true
  if (req.get('x-api-key') === config.ingestApiKey) return true
  res.status(401).json({ ok: false, error: 'invalid api key' })
  return false
}

// Human-friendly help so a teammate who opens the link in a browser sees exactly
// what JSON to POST and which field names are accepted.
const INGEST_HELP = {
  service: 'FleetTrack Manado — GPS telemetry ingest',
  method: 'POST',
  url: '/api/telemetry',
  contentType: 'application/json',
  auth: config.ingestApiKey ? 'required: header x-api-key' : 'none (dev mode)',
  body: 'a single JSON object OR an array of objects (batch)',
  schema: {
    id: 'string — device id, e.g. "MOTOR-001" (aliases: device_id, imei)',
    ts: 'string — ISO-8601 timestamp (optional; server time used if absent)',
    lat: 'number — latitude  (alias: latitude)',
    lng: 'number — longitude (aliases: lon, long, longitude)',
    spd: 'number — speed km/h (alias: speed)',
    bat: 'number — battery %  (alias: battery)',
    sat: 'number — satellites (alias: satellites)',
    st: 'string — rented | available | maintenance (optional)',
  },
  example: {
    id: 'MOTOR-001',
    ts: new Date().toISOString(),
    lat: 1.487,
    lng: 124.835,
    spd: 45.2,
    bat: 87,
    sat: 8,
    st: 'rented',
  },
}
app.get('/', (_req, res) => res.json({ ok: true, ...INGEST_HELP }))
app.get('/api/telemetry', (_req, res) => res.json(INGEST_HELP))

app.post('/api/telemetry', (req, res) => {
  if (!checkApiKey(req, res)) return
  const batch = Array.isArray(req.body) ? req.body : [req.body]
  let accepted = 0
  for (const pkt of batch) if (handleTelemetry(pkt)) accepted++
  if (accepted === 0) return res.status(400).json({ ok: false, error: 'no valid packets (need id, lat, lng)' })
  res.json({ ok: true, accepted, rejected: batch.length - accepted })
})

// Send a command back to a device (engine_cutoff, set_interval) — needs MQTT.
app.post('/api/command/:id', (req, res) => {
  if (!checkApiKey(req, res)) return
  if (!mqttBridge) return res.status(503).json({ ok: false, error: 'MQTT disabled' })
  mqttBridge.sendCommand(req.params.id, req.body ?? {})
  res.json({ ok: true })
})

// ── Socket.IO (server → dashboard) ───────────────────────────────────────────
io.on('connection', (socket) => {
  socket.emit('snapshot', state.snapshot())
  log.info(`[io] dashboard connected (${io.engine.clientsCount} total)`)
  socket.on('disconnect', () => log.info(`[io] dashboard disconnected (${io.engine.clientsCount} left)`))
})

// Periodically flip silent units to offline and broadcast the change.
setInterval(() => {
  for (const device of state.reapOffline()) io.emit('device:update', device)
}, 5000).unref()

server.listen(config.port, () => {
  log.info(`[http] FleetTrack server on http://localhost:${config.port}`)
  log.info(`[http] ingest:  POST http://localhost:${config.port}/api/telemetry`)
  log.info(`[io]   socket:  ws://localhost:${config.port}  (CORS: ${config.corsOrigin})`)
})

// Graceful shutdown
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, async () => {
    log.info(`\n[sys] ${sig} — shutting down…`)
    await store.close()
    mqttBridge?.client.end()
    server.close(() => process.exit(0))
    setTimeout(() => process.exit(0), 2000).unref()
  })
}
