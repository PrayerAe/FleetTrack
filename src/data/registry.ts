import type { Status } from '../types'

/**
 * Device registry — static metadata per unit (model, plate, renter, operational
 * zone). Live position/speed/battery do NOT come from here; they arrive as real
 * telemetry from Firebase. `pos` is only a last-known seed so a freshly-opened
 * dashboard can place each unit on the map before its first packet.
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

export const DEVICE_REGISTRY: DeviceMeta[] = [
  { device_id: 'MOTOR-001', model: 'Honda BeAT 110',    plat: 'DB 2839 LJ', baseStatus: 'rented',      area: 'Boulevard Manado',       street: 'Jl. Piere Tendean',           renter: 'Kevin Rumengan',    speedLimit: 60, odometer: 2769.4, pos: [1.487, 124.835] },
  { device_id: 'MOTOR-002', model: 'Yamaha NMAX 155',   plat: 'DB 6464 GD', baseStatus: 'rented',      area: 'Boulevard Manado',       street: 'Jl. Piere Tendean',           renter: 'Andre Wenas',       speedLimit: 60, odometer: 3120.8, pos: [1.489, 124.84] },
  { device_id: 'MOTOR-003', model: 'Honda Vario 125',   plat: 'DB 4757 BB', baseStatus: 'rented',      area: 'Tikala',                 street: 'Jl. 14 Februari',             renter: 'Stevani Pinontoan', speedLimit: 60, odometer: 1985.2, pos: [1.495, 124.852] },
  { device_id: 'MOTOR-004', model: 'Honda Scoopy 110',  plat: 'DB 6522 EL', baseStatus: 'rented',      area: 'Pasar 45',               street: 'Jl. Sam Ratulangi',           renter: 'Stevani Pinontoan', speedLimit: 60, odometer: 2410.6, pos: [1.484, 124.843] },
  { device_id: 'MOTOR-005', model: 'Yamaha Aerox 155',  plat: 'DB 2653 DB', baseStatus: 'available',   area: 'Mega Mall / Megamas',    street: 'Jl. Piere Tendean (Megamas)', renter: null,                speedLimit: 60, odometer: 1560.0, pos: [1.4952, 124.8322] },
  { device_id: 'MOTOR-006', model: 'Honda PCX 160',     plat: 'DB 4187 LL', baseStatus: 'available',   area: 'Pelabuhan Manado',       street: 'Jl. Ahmad Yani',              renter: null,                speedLimit: 60, odometer: 3890.4, pos: [1.5061, 124.8338] },
  { device_id: 'MOTOR-007', model: 'Yamaha Fazzio 125', plat: 'DB 6562 DL', baseStatus: 'available',   area: 'Pasar 45',               street: 'Jl. Dr. Sutomo',              renter: null,                speedLimit: 60, odometer: 980.7,  pos: [1.4842, 124.8444] },
  { device_id: 'MOTOR-008', model: 'Honda Genio 110',   plat: 'DB 3728 KF', baseStatus: 'rented',      area: 'Boulevard Manado',       street: 'Jl. Piere Tendean',           renter: 'Olivia Tular',      speedLimit: 60, odometer: 2675.1, pos: [1.486, 124.834] },
  { device_id: 'MOTOR-009', model: 'Suzuki Nex II',     plat: 'DB 6598 JE', baseStatus: 'rented',      area: 'Malalayang',             street: 'Jl. Wolter Monginsidi',       renter: 'Kevin Rumengan',    speedLimit: 60, odometer: 3344.9, pos: [1.448, 124.795] },
  { device_id: 'MOTOR-010', model: 'Yamaha Gear 125',   plat: 'DB 6042 BA', baseStatus: 'maintenance', area: 'Bengkel Mitra (Tikala)', street: 'Jl. Babe Palar',              renter: null,                speedLimit: 60, odometer: 4102.3, pos: [1.4982, 124.8534] },
]

export const REGISTRY_BY_ID = new Map(DEVICE_REGISTRY.map((d) => [d.device_id, d]))
