import { CircleMarker, MapContainer, Polygon, TileLayer } from 'react-leaflet'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Area, AreaChart, XAxis } from 'recharts'
import { motion } from 'framer-motion'
import {
  Satellite,
  Timer,
  Activity,
  Wallet,
  ArrowRight,
  Bike,
  Siren,
  Gauge as GaugeIcon,
  ServerCog,
} from 'lucide-react'
import { DAILY_TRIPS, GEOFENCES, MANADO_CENTER } from '../../data/fleet'
import { useSim } from '../../sim/SimContext'
import { SEVERITY_META, STATUS_META, fmtTime, rupiah, timeAgo } from '../../lib/ui'
import { Card, LiveBadge } from '../ui/primitives'
import { StatCard } from '../ui/StatCard'
import { MapAutoResize } from '../ui/MapAutoResize'
import { chartTooltip } from '../ui/chart'
import type { ViewId } from '../../nav'

export function Overview({ onNavigate }: { onNavigate: (v: ViewId) => void }) {
  const { fleet, counts, utilization, alerts, simClock, totalMessages } = useSim()
  const zone = GEOFENCES[0]
  const pieData = [
    { name: 'Disewa', value: counts.rented, color: STATUS_META.rented.hex },
    { name: 'Tersedia', value: counts.available, color: STATUS_META.available.hex },
    { name: 'Alert', value: counts.alert, color: STATUS_META.alert.hex },
    { name: 'Maintenance', value: counts.maintenance, color: STATUS_META.maintenance.hex },
  ].filter((d) => d.value > 0)
  const recentAlerts = alerts.slice(0, 5)

  return (
    <div className="space-y-4">
      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass relative overflow-hidden p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-10 -top-16 h-72 w-72 rounded-full bg-brand-violet/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-32 h-60 w-60 rounded-full bg-brand-cyan/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <LiveBadge label="SISTEM AKTIF" />
              <span className="chip bg-white/5 text-slate-300 ring-1 ring-white/10">
                <ServerCog className="h-3.5 w-3.5" /> Manado · {fmtTime(simClock)}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              FleetTrack <span className="gradient-text">Manado</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Monitoring sewa motor real-time berbasis IoT — {fleet.length} unit aktif dengan telemetri 1 Hz,
              geofence Ray Casting, dan deteksi pelanggaran end-to-end &lt; 3 detik.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => onNavigate('map')}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-blue px-4 py-2.5 text-sm font-bold text-white shadow-glow transition hover:opacity-90"
              >
                Buka Live Map <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onNavigate('telemetry')}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10"
              >
                Lihat Telemetri
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <HeroStat label="Total Unit" value={fleet.length} tone="text-white" />
            <HeroStat label="Utilisasi" value={`${utilization}%`} tone="text-cyan-300" />
            <HeroStat label="Uptime" value="99.6%" tone="text-emerald-300" />
          </div>
        </div>
      </motion.div>

      {/* KPI STRIP */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<Satellite className="h-5 w-5" />} label="Akurasi GPS" value="3.8 m" sub="target < 5 m" accent="from-emerald-500/30 to-emerald-400/10" />
        <StatCard icon={<Timer className="h-5 w-5" />} label="Latensi E2E" value="1.7 s" sub="p95 2.6 s · target < 3 s" accent="from-brand-violet/30 to-brand-cyan/10" delay={0.05} />
        <StatCard icon={<Activity className="h-5 w-5" />} label="Throughput" value="50 unit" sub={`${totalMessages.toLocaleString('id-ID')} pesan · 0 drop`} accent="from-blue-500/30 to-blue-400/10" delay={0.1} />
        <StatCard icon={<Wallet className="h-5 w-5" />} label="Biaya / Unit" value={rupiah(412000)} sub="target < Rp 500.000" accent="from-amber-500/30 to-amber-400/10" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* mini map */}
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Bike className="h-4 w-4 text-violet-300" /> Posisi Armada — Kota Manado
            </h3>
            <button onClick={() => onNavigate('map')} className="flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-violet-200">
              Buka penuh <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="h-[380px] overflow-hidden rounded-xl">
            <MapContainer center={MANADO_CENTER} zoom={12} scrollWheelZoom={false} className="h-full w-full">
              <MapAutoResize />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" subdomains="abc" maxZoom={19} attribution="&copy; OpenStreetMap contributors" />
              <Polygon
                positions={zone.polygon.map(([lng, lat]) => [lat, lng] as [number, number])}
                pathOptions={{ color: '#7c3aed', weight: 2, fillColor: '#7c3aed', fillOpacity: 0.06 }}
              />
              {fleet.map((m) => (
                <CircleMarker
                  key={m.device_id}
                  center={[m.lat, m.lng]}
                  radius={6}
                  pathOptions={{ color: STATUS_META[m.status].hex, fillColor: STATUS_META[m.status].hex, fillOpacity: 0.85, weight: 2 }}
                />
              ))}
            </MapContainer>
          </div>
        </Card>

        {/* status donut */}
        <Card>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
            <GaugeIcon className="h-4 w-4 text-cyan-300" /> Status Armada
          </h3>
          <div className="relative">
            <ResponsiveContainer width="100%" height={224}>
              <PieChart>
                <Tooltip content={chartTooltip} />
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={64} outerRadius={94} paddingAngle={3} stroke="none">
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-white">{utilization}%</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">utilisasi</span>
            </div>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-1.5">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                {d.name}
                <span className="ml-auto font-mono font-semibold text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* recent alerts */}
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Siren className="h-4 w-4 text-rose-300" /> Alert Terbaru
            </h3>
            <button onClick={() => onNavigate('alerts')} className="flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-violet-200">
              Semua alert <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-1.5">
            {recentAlerts.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: SEVERITY_META[a.severity].hex }} />
                <span className="font-mono text-xs font-semibold text-white">{a.device_id}</span>
                <span className="text-sm text-slate-300">{a.type}</span>
                <span className="ml-auto text-[11px] text-slate-500">{timeAgo(a.time, simClock)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* trips sparkline */}
        <Card>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Activity className="h-4 w-4 text-cyan-300" /> Trip 7 Hari
          </h3>
          <ResponsiveContainer width="100%" height={176}>
            <AreaChart data={DAILY_TRIPS} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="ovTrip" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#22d3ee" stopOpacity={0.6} />
                  <stop offset="1" stopColor="#7c3aed" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={chartTooltip} />
              <Area type="monotone" dataKey="trips" name="Trip" stroke="#22d3ee" strokeWidth={2.5} fill="url(#ovTrip)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2 text-xs">
            <span className="text-slate-400">Total minggu ini</span>
            <span className="font-mono font-bold text-white">{DAILY_TRIPS.reduce((s, d) => s + d.trips, 0)} trip</span>
          </div>
        </Card>
      </div>
    </div>
  )
}

function HeroStat({ label, value, tone }: { label: string; value: React.ReactNode; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center backdrop-blur">
      <div className={`text-2xl font-extrabold tabular-nums sm:text-3xl ${tone}`}>{value}</div>
      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
    </div>
  )
}
