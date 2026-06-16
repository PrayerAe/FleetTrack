import {
  LayoutDashboard,
  Map,
  Gauge,
  ShieldCheck,
  Bike,
  Siren,
  ReceiptText,
  BarChart3,
  TerminalSquare,
  Award,
  type LucideIcon,
} from 'lucide-react'

export type ViewId =
  | 'overview'
  | 'map'
  | 'speed'
  | 'geofence'
  | 'fleet'
  | 'alerts'
  | 'rentals'
  | 'analytics'
  | 'research'
  | 'telemetry'

export interface NavItem {
  id: ViewId
  label: string
  short: string
  icon: LucideIcon
  group: string
}

export const NAV: NavItem[] = [
  { id: 'overview', label: 'Dashboard', short: 'Ringkasan armada', icon: LayoutDashboard, group: 'Utama' },
  { id: 'map', label: 'Live Map', short: 'Pelacakan posisi real-time', icon: Map, group: 'Monitoring' },
  { id: 'speed', label: 'Speed Monitor', short: 'Gauge kecepatan & batas', icon: Gauge, group: 'Monitoring' },
  { id: 'geofence', label: 'Geofence Manager', short: 'Zona operasional Ray Casting', icon: ShieldCheck, group: 'Monitoring' },
  { id: 'fleet', label: 'Fleet Overview', short: 'Status & utilisasi armada', icon: Bike, group: 'Manajemen' },
  { id: 'alerts', label: 'Alert Panel', short: 'Notifikasi pelanggaran', icon: Siren, group: 'Manajemen' },
  { id: 'rentals', label: 'Rental Management', short: 'Transaksi & pendapatan', icon: ReceiptText, group: 'Manajemen' },
  { id: 'analytics', label: 'Analytics', short: 'Tren, rute & KPI', icon: BarChart3, group: 'Manajemen' },
  { id: 'research', label: 'Hasil Penelitian', short: 'Novelty, KPI & uji lapangan', icon: Award, group: 'Penelitian' },
  { id: 'telemetry', label: 'Telemetry Console', short: 'Aliran MQTT/JSON mentah', icon: TerminalSquare, group: 'Developer' },
]
