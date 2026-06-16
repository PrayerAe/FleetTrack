import type { Status } from '../types'

/**
 * Device registry — OPTIONAL static metadata per unit (model, plate, renter).
 * Live position/speed/battery always come from real telemetry (Firebase); this
 * only attaches nicer labels to a device id. The dashboard shows ONLY units that
 * have sent real telemetry, so leaving this empty just means live units appear
 * with their id and "—" labels until you add them here.
 *
 * Add your real fleet below, one entry per unit. Example:
 *   { device_id: 'MOTOR-001', model: 'Honda BeAT 110', plat: 'DB 2839 LJ',
 *     baseStatus: 'rented', area: 'Boulevard', street: 'Jl. Piere Tendean',
 *     renter: 'Nama Penyewa', speedLimit: 60, odometer: 0, pos: [1.487, 124.835] },
 */
export interface DeviceMeta {
  device_id: string
  model: string
  plat: string
  baseStatus: Status
  area: string
  street: string
  renter: string | null
  speedLimit: number
  odometer: number
  pos: [number, number]
}

export const DEVICE_REGISTRY: DeviceMeta[] = []

export const REGISTRY_BY_ID = new Map(DEVICE_REGISTRY.map((d) => [d.device_id, d]))
