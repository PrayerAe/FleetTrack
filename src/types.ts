export type Status = 'rented' | 'available' | 'alert' | 'maintenance'

export type Severity = 'TINGGI' | 'SEDANG' | 'RENDAH' | 'INFO'

export type AlertType =
  | 'Overspeed'
  | 'Geofence Violation'
  | 'Low Battery'
  | 'Idle Timeout'
  | 'Maintenance'
  | 'Low Satellite'

/** A single GPS coordinate as [lat, lng] (Leaflet order). */
export type LatLng = [number, number]

/** Raw telemetry packet — mirrors the MQTT JSON payload in the spec (§3.6). */
export interface Telemetry {
  id: string
  ts: string
  lat: number
  lng: number
  spd: number
  bat: number
  sat: number
  st: Status
}

export interface Motorcycle {
  device_id: string
  model: string
  plat: string
  status: Status
  /** Underlying operational status (rented/available/maintenance), independent of live alerts. */
  baseStatus: Status
  area: string
  /** Nama jalan/koridor utama unit berada (Kota Manado). */
  street: string
  renter: string | null
  speedLimit: number
  odometer: number
  /** Live telemetry state (updated from incoming device telemetry). */
  lat: number
  lng: number
  spd: number
  bat: number
  sat: number
  heading: number
  /** True once the device has sent at least one live packet recently. */
  online?: boolean
  /** ISO timestamp of the last telemetry packet received for this unit. */
  lastSeen?: string | null
}

export interface AlertItem {
  id: string
  time: Date
  device_id: string
  type: AlertType
  severity: Severity
  detail: string
  live?: boolean
}

export interface Rental {
  id: string
  device: string
  model: string
  renter: string
  start: string
  durationDays: number
  tarif: number
  status: 'Aktif' | 'Selesai'
}

export interface Geofence {
  id: number
  name: string
  /** polygon in [lng, lat] order (GeoJSON) */
  polygon: number[][]
  active: boolean
}

export interface Kpi {
  metric: string
  target: string
  result: string
  ok: boolean
}
