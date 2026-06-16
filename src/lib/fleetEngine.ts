// Client-side fleet engine. Runs the geofence (Ray Casting), overspeed, battery
// and satellite checks in the browser as real telemetry arrives from Firebase —
// the same logic that previously lived in the Node server, ported to TypeScript.

import { GEOFENCES } from '../data/fleet'
import { DEVICE_REGISTRY, REGISTRY_BY_ID } from '../data/registry'
import type { AlertItem, LatLng, Motorcycle, Severity, Status, Telemetry } from '../types'
import { bearing, clamp, haversine, pointInPolygon } from '../sim/geo'

const TRAIL_MAX = 40
const ALERT_COOLDOWN_MS = 25_000
let alertCounter = 0

const BASE_STATUSES = new Set<Status>(['rented', 'available', 'maintenance'])

const numOf = (v: unknown): number | null => {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** Map a loosely-shaped GPS payload onto the canonical telemetry schema. */
export function normalize(raw: any): Telemetry | null {
  if (!raw || typeof raw !== 'object') return null
  const id = raw.id ?? raw.device_id ?? raw.deviceId ?? raw.imei
  const lat = numOf(raw.lat ?? raw.latitude)
  const lng = numOf(raw.lng ?? raw.lon ?? raw.long ?? raw.longitude)
  if (!id || lat == null || lng == null) return null
  const st = (raw.st ?? raw.status ?? null) as Status | null
  return {
    id: String(id),
    ts: raw.ts ?? raw.timestamp ?? raw.time ?? new Date().toISOString(),
    lat,
    lng,
    spd: numOf(raw.spd ?? raw.speed ?? raw.kmh) ?? 0,
    bat: numOf(raw.bat ?? raw.battery ?? raw.batt) ?? 0,
    sat: numOf(raw.sat ?? raw.satellites ?? raw.sats) ?? 0,
    st: (st ?? 'available') as Status,
  }
}

function seedDevice(d: (typeof DEVICE_REGISTRY)[number]): Motorcycle {
  return {
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
  }
}

export interface IngestResult {
  device: Motorcycle
  telemetry: Telemetry
  newAlerts: AlertItem[]
}

export class FleetEngine {
  devices = new Map<string, Motorcycle>()
  trails: Record<string, LatLng[]> = {}
  alerts: AlertItem[] = []
  private cooldowns = new Map<string, number>()

  constructor() {
    for (const d of DEVICE_REGISTRY) {
      this.devices.set(d.device_id, seedDevice(d))
      this.trails[d.device_id] = []
    }
  }

  private activeZone() {
    return GEOFENCES.find((g) => g.active) ?? GEOFENCES[0]
  }

  /** Process one raw telemetry packet. Returns null if it was invalid. */
  ingest(raw: any): IngestResult | null {
    const t = normalize(raw)
    if (!t) return null

    let m = this.devices.get(t.id)
    if (!m) {
      const reg = REGISTRY_BY_ID.get(t.id)
      m = reg
        ? seedDevice(reg)
        : {
            device_id: t.id, model: '—', plat: '—', baseStatus: 'available', status: 'available',
            area: '—', street: '—', renter: null, speedLimit: 60, odometer: 0,
            lat: t.lat, lng: t.lng, spd: 0, bat: 0, sat: 0, heading: 0, online: false, lastSeen: null,
          }
      this.devices.set(t.id, m)
      this.trails[t.id] = []
    }

    const nowMs = Date.parse(t.ts) || Date.now()
    if (t.st && BASE_STATUSES.has(t.st)) m.baseStatus = t.st

    const prev: LatLng = [m.lat, m.lng]
    const next: LatLng = [t.lat, t.lng]
    const moved = haversine(prev, next)
    if (moved > 1) m.heading = bearing(prev, next)
    if (moved > 0 && moved < 1000) m.odometer += moved / 1000

    m.lat = t.lat
    m.lng = t.lng
    m.spd = clamp(t.spd, 0, 200)
    if (t.bat) m.bat = clamp(t.bat, 0, 100)
    if (t.sat) m.sat = clamp(Math.round(t.sat), 0, 30)
    m.online = true
    m.lastSeen = t.ts

    const inUse = m.baseStatus === 'rented'
    if (inUse && moved > 4) {
      const trail = this.trails[m.device_id] ?? []
      trail.push(next)
      if (trail.length > TRAIL_MAX) trail.shift()
      this.trails[m.device_id] = trail
    }

    const zone = this.activeZone()
    const outside = inUse && !pointInPolygon([m.lng, m.lat], zone.polygon)
    const overspeed = m.spd > m.speedLimit

    if (m.baseStatus === 'maintenance') m.status = 'maintenance'
    else if (outside || overspeed) m.status = 'alert'
    else m.status = m.baseStatus

    const newAlerts: AlertItem[] = []
    if (overspeed) {
      const sev: Severity = m.spd > 65 ? 'TINGGI' : 'RENDAH'
      this.raise(m, 'Overspeed', sev, `Kecepatan ${m.spd.toFixed(0)} km/h melebihi batas ${m.speedLimit} km/h`, nowMs, newAlerts)
    }
    if (outside) {
      this.raise(m, 'Geofence Violation', 'TINGGI', `Unit di luar zona operasional (${m.lat.toFixed(3)}, ${m.lng.toFixed(3)})`, nowMs, newAlerts)
    }
    if (m.bat > 0 && m.bat < 20 && inUse) {
      this.raise(m, 'Low Battery', 'SEDANG', `Baterai ${m.bat.toFixed(0)}% — di bawah ambang 20%`, nowMs, newAlerts, 120_000)
    }
    if (t.sat > 0 && t.sat < 4 && inUse) {
      this.raise(m, 'Low Satellite', 'RENDAH', `Jumlah satelit ${t.sat} (< 4) — interpolasi posisi aktif`, nowMs, newAlerts, 120_000)
    }

    const telemetry: Telemetry = {
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

  private raise(m: Motorcycle, type: AlertItem['type'], severity: Severity, detail: string, nowMs: number, out: AlertItem[], cooldown = ALERT_COOLDOWN_MS) {
    const key = `${m.device_id}:${type}`
    const last = this.cooldowns.get(key) ?? -Infinity
    if (nowMs - last < cooldown) return
    this.cooldowns.set(key, nowMs)
    const alert: AlertItem = {
      id: `LIVE-${++alertCounter}`,
      time: new Date(nowMs),
      device_id: m.device_id,
      type,
      severity,
      detail,
      live: true,
    }
    this.alerts = [alert, ...this.alerts].slice(0, 60)
    out.push(alert)
  }

  fleet(): Motorcycle[] {
    return [...this.devices.values()].map((m) => ({ ...m }))
  }
}

function round(v: number, d: number) {
  const p = 10 ** d
  return Math.round(v * p) / p
}
