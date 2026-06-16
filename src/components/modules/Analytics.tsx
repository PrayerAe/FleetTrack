import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BarChart3, Download, Printer, Check, TrendingUp, Route, Target } from 'lucide-react'
import { DAILY_TRIPS, DISTANCE_PER_UNIT, KPIS, LOAD_TEST, POPULAR_ROUTES } from '../../data/fleet'
import { downloadCsv } from '../../lib/ui'
import { Card, SectionTitle } from '../ui/primitives'
import { chartTooltip } from '../ui/chart'

const ROUTE_COLORS = ['#7c3aed', '#3b82f6', '#0ea5e9', '#22d3ee', '#a78bfa']

export function Analytics() {
  const totalTrips = DAILY_TRIPS.reduce((s, d) => s + d.trips, 0)
  const totalDistance = DISTANCE_PER_UNIT.reduce((s, d) => s + d.km, 0)

  const exportCsv = () => {
    downloadCsv('fleettrack-analytics.csv', [
      ['== Trip Harian =='],
      ['Hari', 'Trip'],
      ...DAILY_TRIPS.map((d) => [d.day, d.trips]),
      [],
      ['== Jarak per Unit (km) =='],
      ['Unit', 'km'],
      ...DISTANCE_PER_UNIT.map((d) => [d.unit, d.km]),
      [],
      ['== Rute Terpopuler =='],
      ['Peringkat', 'Rute', 'Trip'],
      ...POPULAR_ROUTES.map((r) => [r.rank, r.route, r.trips]),
    ])
  }

  return (
    <div>
      <SectionTitle
        icon={<BarChart3 className="h-5 w-5" />}
        title="Analytics Dashboard"
        subtitle="Tren operasional, rute terpopuler & pencapaian KPI"
        right={
          <div className="no-print flex gap-2">
            <button onClick={exportCsv} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10">
              <Download className="h-4 w-4" /> CSV
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10">
              <Printer className="h-4 w-4" /> PDF
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <TrendingUp className="h-4 w-4 text-cyan-300" /> Trip Harian (7 hari)
            </h3>
            <span className="font-mono text-sm font-bold text-white">{totalTrips} trip</span>
          </div>
          <ResponsiveContainer width="100%" height={310}>
            <AreaChart data={DAILY_TRIPS} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="tripGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#22d3ee" stopOpacity={0.7} />
                  <stop offset="1" stopColor="#7c3aed" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.18)" />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 65]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={chartTooltip} />
              <Area type="monotone" dataKey="trips" name="Trip" stroke="#22d3ee" strokeWidth={2.5} fill="url(#tripGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Jarak Tempuh per Unit (km)</h3>
            <span className="font-mono text-sm font-bold text-white">{totalDistance.toLocaleString('id-ID')} km</span>
          </div>
          <ResponsiveContainer width="100%" height={310}>
            <BarChart data={DISTANCE_PER_UNIT} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#a78bfa" />
                  <stop offset="1" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.18)" />
              <XAxis dataKey="unit" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 800]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={chartTooltip} cursor={{ fill: 'rgba(100,116,139,0.10)' }} />
              <Bar dataKey="km" name="km" fill="url(#distGrad)" radius={[5, 5, 0, 0]} maxBarSize={46} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Route className="h-4 w-4 text-violet-300" /> Rute Terpopuler
          </h3>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Tooltip content={chartTooltip} />
                <Pie data={POPULAR_ROUTES} dataKey="trips" nameKey="route" innerRadius={62} outerRadius={104} paddingAngle={3} stroke="none">
                  {POPULAR_ROUTES.map((_, i) => (
                    <Cell key={i} fill={ROUTE_COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-1.5">
              {POPULAR_ROUTES.map((r, i) => (
                <div key={r.rank} className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-2.5 py-1.5 text-xs">
                  <span className="grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: ROUTE_COLORS[i] }}>
                    {r.rank}
                  </span>
                  <span className="flex-1 truncate text-slate-300">{r.route}</span>
                  <span className="font-mono font-semibold text-white">{r.trips}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-200">Load Testing — 50 device @ 1 Hz</h3>
          <div className="space-y-1.5">
            {LOAD_TEST.map((l) => (
              <div key={l.aspect} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 text-sm">
                <span className="text-slate-400">{l.aspect}</span>
                <span className="font-mono font-semibold text-white">{l.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Target className="h-4 w-4 text-emerald-300" /> Hasil Pengujian vs Target KPI
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {KPIS.map((k) => (
            <div key={k.metric} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300">
                <Check className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-slate-200">{k.metric}</div>
                <div className="text-[11px] text-slate-500">Target {k.target}</div>
              </div>
              <div className="font-mono text-sm font-bold text-emerald-300">{k.result}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
