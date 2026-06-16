// Authoritative fleet state + real-time alert engine.
//
// Every telemetry packet (from MQTT or HTTP) is normalized, merged into the
// device record, scored against the geofence + speed limit + battery thresholds,
// and turned into Socket.IO broadcasts. This is the server-side equivalent of the
// old in-browser FleetSimulator — except the numbers now come from real GPS units.

import { activeZone, GEOFENCES } from './geofences.js'
import { bearing, clamp, haversine, pointInPolygon } from './geo.js'
import { DEVICE_REGISTRY, REGISTRY_BY_ID } from './devices.js'

const TRAIL_MAX = 40
const ALERT_COOLDOWN_MS = 25_000 // per (device:type) debounce
const OFFLINE_AFTER_MS = 15_000 // no packet for this long → mark unit offline
let alertCounter = 0

const BASE_STATUSES = new Set(['rented', 'available', 'maintenance'])

/** Map a loosely-shaped GPS payload onto the canonical telemetry schema. */
export function normalize(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = raw.id ?? raw.device_id ?? raw.deviceId ?? raw.imei
  const lat = num(raw.lat ?? raw.latitude)
  const lng = num(raw.lng ?? raw.lon ?? raw.long ?? raw.longitude)
  if (!id || lat == null || lng == null) return null
  return {
    id: String(id),
    ts: raw.ts ?? raw.timestamp ?? raw.time ?? new Date().toISOString(),
    lat,
    lng,
    spd: num(raw.spd ?? raw.speed ?? raw.kmh) ?? 0,
    bat: num(raw.bat ?? raw.battery ?? raw.batt ?? raw.bat_pct),
    sat: num(raw.sat ?? raw.satellites ?? raw.sats),
    st: raw.st ?? raw.status ?? null,
  }
}

const num = (v) => {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export class FleetState {
  /** @param {{ onAlert?: (a:any)=>void }} [hooks] */
  constructor(hooks = {}) {
    this.devices = new Map()
    this.trails = new Map()
    this.alerts = []
    this.cooldowns = new Map()
    this.hooks = hooks

    // Seed the roster from the registry so the dashboard lists every unit
    // immediately; they stay `online:false` until their first real packet.
    for (const d of DEVICE_REGISTRY) {
      this.devices.set(d.device_id, {
        device_id: d.device_id,
        model: d.model,
        plat: d.plat,
        baseStatus: d.baseStatus,
        status: d.baseStatus,
        area: d.area,
        street: d.street,
        renter: d.renter,
        speedLimit: d.speedLimit,
        odometer: d.odometer,
        lat: d.pos[0],
        lng: d.pos[1],
        spd: 0,
        bat: 0,
        sat: 0,
        heading: 0,
        online: false,
        lastSeen: null,
      })
      this.trails.set(d.device_id, [])
    }
  }

  /**
   * Ingest one telemetry packet. Returns the affected device, the canonical
   * telemetry echo, and any new alerts — or null if the packet was invalid.
   */
  ingest(raw) {
    const t = normalize(raw)
    if (!t) return null

    let m = this.devices.get(t.id)
    if (!m) {
      // Unknown device: accept it as a minimal record (auto-registration).
      const reg = REGISTRY_BY_ID.get(t.id)
      m = {
        device_id: t.id,
        model: reg?.model ?? 'Unknown',
        plat: reg?.plat ?? '—',
        baseStatus: reg?.baseStatus ?? 'available',
        status: reg?.baseStatus ?? 'available',
        area: reg?.area ?? '—',
        street: reg?.street ?? '—',
        renter: reg?.renter ?? null,
        speedLimit: reg?.speedLimit ?? 60,
        odometer: reg?.odometer ?? 0,
        lat: t.lat,
        lng: t.lng,
        spd: 0,
        bat: 0,
        sat: 0,
        heading: 0,
        online: false,
        lastSeen: null,
      }
      this.devices.set(t.id, m)
      this.trails.set(t.id, [])
    }

    const nowMs = Date.parse(t.ts) || Date.now()

    // Device may report its operational status; only relational states override.
    if (t.st && BASE_STATUSES.has(t.st)) m.baseStatus = t.st

    // Movement-derived fields.
    const prev = [m.lat, m.lng]
    const next = [t.lat, t.lng]
    const moved = haversine(prev, next)
    if (moved > 1) m.heading = bearing(prev, next)
    if (moved > 0 && moved < 1000) m.odometer += moved / 1000 // km, reject GPS jumps

    m.lat = t.lat
    m.lng = t.lng
    m.spd = clamp(t.spd ?? 0, 0, 200)
    if (t.bat != null) m.bat = clamp(t.bat, 0, 100)
    if (t.sat != null) m.sat = clamp(Math.round(t.sat), 0, 30)
    m.online = true
    m.lastSeen = t.ts

    // Trail (only meaningful for in-use units, keeps payloads light).
    const inUse = m.baseStatus === 'rented'
    if (inUse && moved > 4) {
      const trail = this.trails.get(m.device_id)
      trail.push([t.lat, t.lng])
      if (trail.length > TRAIL_MAX) trail.shift()
    }

    // ── Evaluate geofence + speed limit (Ray Casting, §III-F) ──
    const zone = activeZone()
    const outside = inUse && !pointInPolygon([m.lng, m.lat], zone.polygon)
    const overspeed = m.spd > m.speedLimit

    if (m.baseStatus === 'maintenance') m.status = 'maintenance'
    else if (outside || overspeed) m.status = 'alert'
    else m.status = m.baseStatus

    const newAlerts = []
    if (overspeed) {
      const sev = m.spd > 65 ? 'TINGGI' : 'RENDAH'
      this.raise(m, 'Overspeed', sev, `Kecepatan ${m.spd.toFixed(0)} km/h melebihi batas ${m.speedLimit} km/h`, nowMs, newAlerts)
    }
    if (outside) {
      this.raise(m, 'Geofence Violation', 'TINGGI', `Unit di luar zona operasional (${m.lat.toFixed(3)}, ${m.lng.toFixed(3)})`, nowMs, newAlerts)
    }
    if (m.bat > 0 && m.bat < 20 && inUse) {
      this.raise(m, 'Low Battery', 'SEDANG', `Baterai ${m.bat.toFixed(0)}% — di bawah ambang 20%`, nowMs, newAlerts, 120_000)
    }
    if (t.sat != null && t.sat < 4 && inUse) {
      this.raise(m, 'Low Satellite', 'RENDAH', `Jumlah satelit ${t.sat} (< 4) — interpolasi posisi aktif`, nowMs, newAlerts, 120_000)
    }

    const telemetry = {
      id: m.device_id,
      ts: t.ts,
      lat: round(m.lat, 5),
      lng: round(m.lng, 5),
      spd: round(m.spd, 1),
      bat: Math.round(m.bat),
      sat: m.sat,
      st: m.status,
    }

    return { device: { ...m }, telemetry, newAlerts }
  }

  raise(m, type, severity, detail, nowMs, out, cooldown = ALERT_COOLDOWN_MS) {
    const key = `${m.device_id}:${type}`
    const last = this.cooldowns.get(key) ?? -Infinity
    if (nowMs - last < cooldown) return
    this.cooldowns.set(key, nowMs)
    const alert = {
      id: `LIVE-${++alertCounter}`,
      time: new Date(nowMs).toISOString(),
      device_id: m.device_id,
      type,
      severity,
      detail,
      live: true,
    }
    this.alerts = [alert, ...this.alerts].slice(0, 60)
    out.push(alert)
    this.hooks.onAlert?.(alert)
  }

  /** Flip units that have gone quiet to offline; returns those that changed. */
  reapOffline(nowMs = Date.now()) {
    const changed = []
    for (const m of this.devices.values()) {
      if (!m.online || !m.lastSeen) continue
      if (nowMs - (Date.parse(m.lastSeen) || 0) > OFFLINE_AFTER_MS) {
        m.online = false
        m.spd = 0
        if (m.baseStatus !== 'maintenance') m.status = m.baseStatus
        changed.push({ ...m })
      }
    }
    return changed
  }

  snapshot() {
    return {
      devices: [...this.devices.values()].map((m) => ({ ...m })),
      alerts: this.alerts.slice(),
      trails: Object.fromEntries(this.trails),
      geofences: GEOFENCES,
      serverTs: new Date().toISOString(),
    }
  }
}

function round(v, d) {
  const p = 10 ** d
  return Math.round(v * p) / p
}
