import { Gauge as GaugeIcon, TriangleAlert } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useSim } from '../../sim/SimContext'
import { Card, LiveBadge, SectionTitle } from '../ui/primitives'
import { Gauge } from '../ui/Gauge'
import { MOTOR001_SPEED_PROFILE } from '../../data/fleet'
import { chartTooltip } from '../ui/chart'

export function SpeedMonitor() {
  const { fleet } = useSim()
  const active = fleet.filter((m) => m.status === 'rented' || m.status === 'alert')
  const overspeeding = active.filter((m) => m.spd > m.speedLimit)

  const barData = active.map((m) => ({
    name: m.device_id.replace('MOTOR-', ''),
    spd: Math.round(m.spd),
    over: m.spd > m.speedLimit,
  }))

  return (
    <div>
      <SectionTitle
        icon={<GaugeIcon className="h-5 w-5" />}
        title="Speed Monitor"
        subtitle="Gauge kecepatan real-time per unit aktif · batas overspeed 60 km/h"
        right={<LiveBadge />}
      />

      {overspeeding.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <span className="font-semibold">{overspeeding.length} unit melebihi batas kecepatan:</span>
          {overspeeding.map((m) => (
            <span key={m.device_id} className="font-mono">
              {m.device_id} ({m.spd.toFixed(0)} km/h)
            </span>
          ))}
        </div>
      )}

      {/* Gauges */}
      <Card className="mb-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {active.map((m) => (
            <div key={m.device_id} className="flex flex-col items-center rounded-xl border border-white/5 bg-white/[0.02] p-2">
              <Gauge value={m.spd} max={80} limit={m.speedLimit} label={m.device_id.replace('MOTOR-', 'M')} size={156} />
              <span className={`mt-1 chip ${m.spd > m.speedLimit ? 'bg-rose-500/15 text-rose-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
                {m.spd > m.speedLimit ? 'OVERSPEED' : 'normal'}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-200">Kecepatan unit aktif (km/h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 10, right: 8, left: -14, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.18)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 80]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={chartTooltip} cursor={{ fill: 'rgba(100,116,139,0.10)' }} />
              <ReferenceLine y={60} stroke="#f43f5e" strokeDasharray="5 4" label={{ value: 'batas 60', fill: '#fb7185', fontSize: 11, position: 'right' }} />
              <Bar dataKey="spd" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {barData.map((d, i) => (
                  <Cell key={i} fill={d.over ? '#f43f5e' : 'url(#spdGrad)'} />
                ))}
              </Bar>
              <defs>
                <linearGradient id="spdGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#22d3ee" />
                  <stop offset="1" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-1 text-sm font-semibold text-slate-200">Profil kecepatan — MOTOR-001</h3>
          <p className="mb-3 text-xs text-slate-400">Rekaman perjalanan ≈ 6.57 km / 15 menit · lonjakan t10 (61 km/h) memicu alert RENDAH.</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={MOTOR001_SPEED_PROFILE} margin={{ top: 10, right: 12, left: -14, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#7c3aed" />
                  <stop offset="1" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.18)" />
              <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} interval={1} />
              <YAxis domain={[0, 80]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={chartTooltip} />
              <ReferenceLine y={60} stroke="#f43f5e" strokeDasharray="5 4" />
              <Line type="monotone" dataKey="spd" stroke="url(#lineGrad)" strokeWidth={3} dot={{ r: 3, fill: '#22d3ee' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
