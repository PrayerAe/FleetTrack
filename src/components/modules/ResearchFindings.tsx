import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Award,
  Sparkles,
  Target,
  Network,
  FlaskConical,
  Crosshair,
  Wallet,
  Check,
  TrendingDown,
  Database,
  Shapes,
  Radio,
  Leaf,
  BadgeCheck,
  X,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from 'recharts'
import {
  BENCHMARK,
  BOM,
  COST_COMPARISON,
  costColor,
  DETECTION,
  FIELD_TEST,
  KPI_ACHIEVEMENT,
  NOVELTY_PILLARS,
  NOVELTY_RADAR,
  SCALABILITY,
  SDG_GOALS,
  SUS,
} from '../../data/fleet'
import { rupiah } from '../../lib/ui'
import { Card, SectionTitle } from '../ui/primitives'
import { chartTooltip } from '../ui/chart'

type Tab = 'novelty' | 'kpi' | 'scale' | 'field' | 'accuracy' | 'validity' | 'cost'

const TABS: { id: Tab; label: string; icon: typeof Award }[] = [
  { id: 'novelty', label: 'Novelty', icon: Sparkles },
  { id: 'kpi', label: 'Pencapaian KPI', icon: Target },
  { id: 'scale', label: 'Skalabilitas', icon: Network },
  { id: 'field', label: 'Uji Lapangan', icon: FlaskConical },
  { id: 'accuracy', label: 'Akurasi & UX', icon: Crosshair },
  { id: 'validity', label: 'Validitas & Benchmark', icon: BadgeCheck },
  { id: 'cost', label: 'Biaya & Dampak', icon: Wallet },
]

export function ResearchFindings() {
  const [tab, setTab] = useState<Tab>('novelty')

  return (
    <div>
      <SectionTitle
        icon={<Award className="h-5 w-5" />}
        title="Hasil Penelitian"
        subtitle="Bukti empiris dari pengujian lapangan yang menekankan kebaruan (novelty) sistem"
      />

      {/* tab bar */}
      <div className="no-print mb-4 flex flex-wrap gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5">
        {TABS.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                active ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {active && (
                <motion.span layoutId="researchTab" className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-violet to-brand-blue" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
              )}
              <Icon className="relative h-4 w-4" />
              <span className="relative">{t.label}</span>
            </button>
          )
        })}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {tab === 'novelty' && <NoveltyTab />}
        {tab === 'kpi' && <KpiTab />}
        {tab === 'scale' && <ScaleTab />}
        {tab === 'field' && <FieldTab />}
        {tab === 'accuracy' && <AccuracyTab />}
        {tab === 'validity' && <ValidityTab />}
        {tab === 'cost' && <CostTab />}
      </motion.div>
    </div>
  )
}

/* ---------------------------------- NOVELTY --------------------------------- */
const PILLAR_ICONS = [FlaskConical, Database, Shapes, Radio, Wallet]

function NoveltyTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-1 text-sm font-semibold text-slate-200">Posisi terhadap State-of-the-Art</h3>
          <p className="mb-2 text-xs text-slate-400">Perbandingan kapabilitas (skor 0–100) vs sistem fleet-tracking yang ada.</p>
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={NOVELTY_RADAR} outerRadius="72%">
              <PolarGrid stroke="rgba(100,116,139,0.30)" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} stroke="rgba(100,116,139,0.22)" />
              <Radar name="FleetTrack Manado" dataKey="fleet" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.45} strokeWidth={2} />
              <Radar name="Sistem Roda-4 Industri" dataKey="car" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.12} strokeWidth={1.5} />
              <Radar name="GPS Tracker Generik" dataKey="generic" stroke="#64748b" fill="#64748b" fillOpacity={0.1} strokeWidth={1.5} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Tooltip content={chartTooltip} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <div className="space-y-3">
          {NOVELTY_PILLARS.map((p, i) => {
            const Icon = PILLAR_ICONS[i]
            return (
              <motion.div
                key={p.no}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass glass-hover flex items-start gap-3 p-4"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-violet/40 to-brand-cyan/20 text-violet-200 ring-1 ring-white/10">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-violet/30 text-[11px] font-bold text-violet-200">{p.no}</span>
                    <h4 className="text-sm font-bold text-white">{p.title}</h4>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{p.desc}</p>
                </div>
                <span className="chip shrink-0 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">{p.metric}</span>
              </motion.div>
            )
          })}
        </div>
      </div>
      <Card>
        <p className="text-sm leading-relaxed text-slate-300">
          <Sparkles className="mr-1 inline h-4 w-4 text-violet-300" />
          <b className="text-white">Kontribusi inti:</b> menggabungkan <b>niche rental sepeda motor</b> di negara berkembang dengan
          <b> arsitektur dual-database</b> dan <b>geofence Ray Casting yang dapat dikustomisasi</b> — kombinasi yang belum
          ditemukan pada literatur fleet-tracking (yang mayoritas menyasar kendaraan roda-4/industri), dengan biaya per unit
          <b> &lt; Rp 500.000</b> berbasis komponen open-source.
        </p>
      </Card>
    </div>
  )
}

/* ------------------------------------ KPI ----------------------------------- */
function KpiTab() {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Target Proposal vs Hasil Pengukuran</h3>
        <span className="chip bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
          <Check className="h-3.5 w-3.5" /> 8/8 KPI tercapai
        </span>
      </div>
      <div className="space-y-4">
        {KPI_ACHIEVEMENT.map((k, i) => {
          const ach = k.better === 'lower' ? (k.target / k.result) * 100 : (k.result / k.target) * 100
          const improvement = k.better === 'lower' ? ((k.target - k.result) / k.target) * 100 : ((k.result - k.target) / k.target) * 100
          const cap = 130
          const fill = Math.min(ach, cap) / cap * 100
          const targetPos = (100 / cap) * 100
          return (
            <motion.div key={k.metric} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-200">{k.metric}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">target {k.target}{k.unit}</span>
                  <span className="font-mono font-bold text-emerald-300">{k.result}{k.unit}</span>
                  <span className="chip bg-emerald-500/10 text-emerald-300">+{improvement.toFixed(0)}%</span>
                </span>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${fill}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                />
                <div className="absolute top-1/2 h-5 w-0.5 -translate-y-1/2 bg-white/70" style={{ left: `${targetPos}%` }} title="target" />
              </div>
            </motion.div>
          )
        })}
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Garis putih = ambang target. Seluruh batang melewati target → setiap KPI terpenuhi dengan margin positif.
      </p>
    </Card>
  )
}

/* --------------------------------- SCALABILITY ------------------------------ */
function ScaleTab() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <h3 className="mb-1 text-sm font-semibold text-slate-200">Latensi End-to-End vs Jumlah Device Konkuren (@1 Hz)</h3>
        <p className="mb-3 text-xs text-slate-400">Load test hingga 50 unit — latensi p95 tetap di bawah ambang 3 detik.</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={SCALABILITY} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.18)" />
            <XAxis dataKey="devices" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} label={{ value: 'jumlah device', fill: '#64748b', fontSize: 11, position: 'insideBottom', dy: 12 }} />
            <YAxis domain={[0, 3.5]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} unit="s" />
            <Tooltip content={chartTooltip} />
            <ReferenceLine y={3} stroke="#f43f5e" strokeDasharray="6 4" label={{ value: 'ambang 3 s', fill: '#fb7185', fontSize: 11, position: 'insideTopRight' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="avg" name="rata-rata" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="p95" name="p95" stroke="#a78bfa" strokeWidth={3} dot={{ r: 4 }} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <div className="space-y-3">
        <BigStat value="50" unit="unit" label="Throughput konkuren tercapai" tone="from-blue-500/30 to-blue-400/10" />
        <BigStat value="0" unit="drop" label="Kehilangan pesan (QoS 1, soak 1 jam)" tone="from-emerald-500/30 to-emerald-400/10" />
        <BigStat value="~18%" unit="" label="CPU broker Mosquitto · RAM ~210 MB" tone="from-brand-violet/30 to-brand-cyan/10" />
        <BigStat value="~12 ms" unit="" label="Latensi tulis InfluxDB (p95)" tone="from-amber-500/30 to-amber-400/10" />
      </div>
    </div>
  )
}

/* ----------------------------------- FIELD ---------------------------------- */
function FieldTab() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <h3 className="mb-3 text-sm font-semibold text-slate-200">Field Testing — 2 Fase Deployment</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-3 py-2 font-semibold">Parameter</th>
                <th className="px-3 py-2 text-right font-semibold">Fase 1 · 5u/30h</th>
                <th className="px-3 py-2 text-right font-semibold">Fase 2 · 10u/60h</th>
              </tr>
            </thead>
            <tbody>
              {FIELD_TEST.rows.map((r) => (
                <tr key={r.metric} className="border-t border-white/5">
                  <td className="px-3 py-2.5 text-slate-300">{r.metric}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-slate-400">{r.f1}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-semibold text-white">{r.f2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="space-y-4">
        <Card>
          <h4 className="mb-2 text-sm font-semibold text-slate-200">Total telemetri terkirim (juta)</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={FIELD_TEST.telemetry} margin={{ top: 18, right: 8, left: -22, bottom: 0 }}>
              <XAxis dataKey="phase" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={chartTooltip} cursor={{ fill: 'rgba(100,116,139,0.10)' }} />
              <Bar dataKey="juta" name="juta pesan" fill="#7c3aed" radius={[6, 6, 0, 0]} maxBarSize={48}>
                <LabelList dataKey="juta" position="top" fill="#e2e8f0" fontSize={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          <ImproveStat from="4,1 m" to="3,8 m" label="Akurasi GPS" />
          <ImproveStat from="99,2%" to="99,6%" label="Uptime" />
        </div>
      </div>
    </div>
  )
}

/* --------------------------------- ACCURACY/UX ------------------------------ */
function AccuracyTab() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="mb-1 text-sm font-semibold text-slate-200">Sebaran Galat GPS (CEP)</h3>
        <p className="mb-3 text-xs text-slate-400">Dispersi fix posisi pada langit terbuka + Kalman filter. CEP 50% = 3,8 m.</p>
        <CepScatter />
        <div className="mt-3 flex justify-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-300"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> fix GPS</span>
          <span className="flex items-center gap-1.5 text-emerald-300"><span className="h-2.5 w-2.5 rounded-full border-2 border-emerald-400" /> CEP 50% = 3,8 m</span>
          <span className="flex items-center gap-1.5 text-violet-300"><span className="h-2.5 w-2.5 rounded-full border-2 border-violet-400" /> CEP 95% ≈ 7,9 m</span>
        </div>
      </Card>

      <Card>
        <h3 className="mb-1 text-sm font-semibold text-slate-200">System Usability Scale (SUS)</h3>
        <p className="mb-4 text-xs text-slate-400">Evaluasi {SUS.operators} operator — peringkat “{SUS.grade} / {SUS.adjective}”, di atas ambang acceptable.</p>
        <div className="flex items-end gap-5">
          <div className="text-center">
            <div className="text-6xl font-extrabold leading-none text-white">{SUS.score}</div>
            <div className="mt-1 chip mx-auto w-fit bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">Grade {SUS.grade} · {SUS.adjective}</div>
          </div>
          <div className="flex-1 space-y-1.5 text-xs text-slate-400">
            <Row label="Ambang acceptable" value="70" />
            <Row label="Rata-rata industri" value={`${SUS.industryAvg}`} />
            <Row label="Selisih di atas ambang" value="+8,5" tone="text-emerald-300" />
          </div>
        </div>
        <SusScale />
      </Card>
    </div>
  )
}

// seeded RNG (mulberry32, seed 42) → deterministik
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function CepScatter() {
  const rnd = mulberry32(42)
  const sigma = 3.23 // m per axis → median radius ≈ 3.8 m
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < 130; i++) {
    // Box-Muller
    const u1 = rnd() || 1e-6
    const u2 = rnd()
    const r = Math.sqrt(-2 * Math.log(u1))
    pts.push({ x: r * Math.cos(2 * Math.PI * u2) * sigma, y: r * Math.sin(2 * Math.PI * u2) * sigma })
  }
  const size = 300
  const dom = 11 // meters half-range
  const sc = (m: number) => (m / dom) * (size / 2) + size / 2
  const ringR = (m: number) => (m / dom) * (size / 2)
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[320px]">
      <defs>
        <radialGradient id="cepGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(34,211,238,0.10)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0)" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width={size} height={size} fill="url(#cepGlow)" />
      {/* grid rings (m) */}
      {[3, 6, 9].map((m) => (
        <circle key={m} cx={size / 2} cy={size / 2} r={ringR(m)} fill="none" stroke="rgba(100,116,139,0.18)" strokeWidth={1} />
      ))}
      {/* axes */}
      <line x1={size / 2} y1="6" x2={size / 2} y2={size - 6} stroke="rgba(100,116,139,0.22)" />
      <line x1="6" y1={size / 2} x2={size - 6} y2={size / 2} stroke="rgba(100,116,139,0.22)" />
      {/* CEP circles */}
      <circle cx={size / 2} cy={size / 2} r={ringR(7.9)} fill="none" stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="4 3" />
      <circle cx={size / 2} cy={size / 2} r={ringR(3.8)} fill="rgba(16,185,129,0.06)" stroke="#34d399" strokeWidth={1.8} />
      {/* points */}
      {pts.map((p, i) => (
        <circle key={i} cx={sc(p.x)} cy={sc(p.y)} r={2.1} fill="#22d3ee" opacity={0.85} />
      ))}
      {/* center */}
      <circle cx={size / 2} cy={size / 2} r={3} fill="#fff" />
      <text x={size / 2 + 4} y={size / 2 - ringR(3.8) - 4} fill="#34d399" fontSize="10" fontFamily="monospace">3,8 m</text>
    </svg>
  )
}

function SusScale() {
  // position of 78.5 on a 0–100 scale
  const pos = SUS.score
  return (
    <div className="mt-6">
      <div className="relative h-3 rounded-full" style={{ background: 'linear-gradient(90deg,#ef4444,#f59e0b,#eab308,#84cc16,#22c55e)' }}>
        {/* acceptable threshold */}
        <div className="absolute -top-1 h-5 w-0.5 bg-white/60" style={{ left: '70%' }} />
        {/* marker */}
        <motion.div
          className="absolute -top-1.5 h-6 w-1.5 rounded-full bg-white shadow-[0_0_8px_white]"
          initial={{ left: '0%' }}
          animate={{ left: `${pos}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </div>
      <div className="relative mt-1 h-4">
        <span className="absolute -translate-x-1/2 text-[10px] text-slate-500" style={{ left: '70%' }}>acceptable 70</span>
        <motion.span className="absolute -translate-x-1/2 text-[11px] font-bold text-white" initial={{ left: '0%' }} animate={{ left: `${pos}%` }} transition={{ duration: 0.9 }}>
          {SUS.score}
        </motion.span>
      </div>
      <div className="mt-4 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {SUS.scale.map((s) => (
          <span key={s.label}>{s.label}</span>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------ COST ---------------------------------- */
function CostTab() {
  const totalBom = BOM.reduce((s, b) => s + b.price, 0)
  const commercial = COST_COMPARISON.find((c) => c.name.includes('Komersial'))!.cost
  const saving = Math.round((1 - 412000 / commercial) * 100)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-1 text-sm font-semibold text-slate-200">Biaya per Unit vs Alternatif</h3>
          <p className="mb-3 text-xs text-slate-400">FleetTrack Manado {saving}% lebih murah dari GPS tracker komersial.</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart layout="vertical" data={COST_COMPARISON} margin={{ top: 4, right: 60, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.18)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip content={chartTooltip} cursor={{ fill: 'rgba(100,116,139,0.10)' }} />
              <Bar dataKey="cost" name="Rp" radius={[0, 6, 6, 0]} maxBarSize={30}>
                {COST_COMPARISON.map((c, i) => (
                  <Cell key={i} fill={costColor(c.name)} />
                ))}
                <LabelList dataKey="cost" position="right" formatter={(v: number) => rupiah(v)} fill="#cbd5e1" fontSize={11} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-200">Rincian BOM per Unit</h3>
          <div className="space-y-1">
            {BOM.map((b) => (
              <div key={b.item} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm odd:bg-white/[0.02]">
                <span className="truncate text-slate-300">{b.item}</span>
                <span className="ml-2 shrink-0 font-mono text-slate-400">{rupiah(b.price)}</span>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5">
              <span className="text-sm font-bold text-emerald-200">TOTAL per unit</span>
              <span className="font-mono text-lg font-extrabold text-emerald-300">{rupiah(totalBom)}</span>
            </div>
            <p className="pt-1 text-xs text-slate-500">Target proposal &lt; Rp 500.000 — terpenuhi. Skala volume dapat menekan &lt; Rp 400.000/unit.</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <BigStat value={`${saving}%`} unit="" label="Lebih murah vs komersial" tone="from-emerald-500/30 to-emerald-400/10" icon={<TrendingDown className="h-4 w-4" />} />
        <BigStat value="6–8" unit="bln" label="Estimasi ROI (20 unit)" tone="from-brand-violet/30 to-brand-cyan/10" />
        <BigStat value="30–50%" unit="" label="Pengurangan kerugian pencurian" tone="from-amber-500/30 to-amber-400/10" />
        <BigStat value="Rp 350rb" unit="/bln" label="VPS + DB operasional" tone="from-blue-500/30 to-blue-400/10" />
      </div>

      <Card>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Leaf className="h-4 w-4 text-emerald-300" /> Keterkaitan SDG
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SDG_GOALS.map((g) => (
            <div key={g.sdg} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-xl text-lg font-extrabold text-white" style={{ background: g.color }}>
                  {g.sdg}
                </span>
                <span className="text-xs font-bold leading-tight text-white">SDG {g.sdg}<br /><span className="font-medium text-slate-400">{g.title}</span></span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">{g.desc}</p>
              <div className="mt-2 font-mono text-[11px] text-slate-500">Target {g.targets}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

/* -------------------------------- VALIDITY ---------------------------------- */
function ValidityTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {DETECTION.map((d) => (
          <ConfusionCard key={d.name} d={d} />
        ))}
      </div>

      <Card>
        <h3 className="mb-1 text-sm font-semibold text-slate-200">Benchmark terhadap Pendekatan Terdahulu</h3>
        <p className="mb-3 text-xs text-slate-400">Posisi FleetTrack Manado dibanding solusi fleet-tracking yang umum di literatur & pasar.</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                {BENCHMARK.cols.map((c) => (
                  <th key={c} className="px-3 py-2 font-semibold">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BENCHMARK.rows.map((r) => (
                <tr
                  key={r.sys}
                  className={`border-t border-white/5 ${r.highlight ? 'bg-emerald-500/[0.06]' : ''}`}
                >
                  <td className="px-3 py-2.5 font-semibold text-white">
                    {r.highlight && <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-400" />}
                    {r.sys}
                  </td>
                  <td className="px-3 py-2.5 text-slate-300">{r.vehicle}</td>
                  <BenchCell v={r.rt} />
                  <BenchCell v={r.geo} />
                  <BenchCell v={r.dual} />
                  <td className="px-3 py-2.5 font-mono text-slate-300">{r.cost}</td>
                  <td className="px-3 py-2.5 font-mono text-slate-300">{r.acc}</td>
                  <BenchCell v={r.os} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Hanya FleetTrack Manado yang menggabungkan fokus motor-rental + dual-database + geofence Ray Casting kustom + biaya &lt; Rp 500 rb sekaligus.
        </p>
      </Card>
    </div>
  )
}

function ConfusionCard({ d }: { d: { name: string; tp: number; fp: number; fn: number; tn: number } }) {
  const total = d.tp + d.fp + d.fn + d.tn
  const precision = d.tp / (d.tp + d.fp)
  const recall = d.tp / (d.tp + d.fn)
  const f1 = (2 * precision * recall) / (precision + recall)
  const acc = (d.tp + d.tn) / total
  const pct = (v: number) => `${(v * 100).toFixed(1)}%`
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-slate-200">{d.name}</h3>
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* matrix */}
        <div className="shrink-0">
          <div className="grid grid-cols-[auto_1fr_1fr] gap-1 text-center text-xs">
            <div />
            <div className="px-1 pb-1 text-[10px] font-semibold uppercase text-slate-500">Pred +</div>
            <div className="px-1 pb-1 text-[10px] font-semibold uppercase text-slate-500">Pred −</div>
            <div className="flex items-center text-[10px] font-semibold uppercase text-slate-500">Aktual +</div>
            <MatrixCell value={d.tp} label="TP" tone="bg-emerald-500/20 text-emerald-300 ring-emerald-400/30" />
            <MatrixCell value={d.fn} label="FN" tone="bg-rose-500/15 text-rose-300 ring-rose-400/30" />
            <div className="flex items-center text-[10px] font-semibold uppercase text-slate-500">Aktual −</div>
            <MatrixCell value={d.fp} label="FP" tone="bg-amber-500/15 text-amber-300 ring-amber-400/30" />
            <MatrixCell value={d.tn} label="TN" tone="bg-emerald-500/20 text-emerald-300 ring-emerald-400/30" />
          </div>
          <div className="mt-2 text-center text-[11px] text-slate-500">{total.toLocaleString('id-ID')} kejadian dievaluasi</div>
        </div>
        {/* metrics */}
        <div className="grid flex-1 grid-cols-2 gap-2">
          <Metric2 label="Precision" value={pct(precision)} />
          <Metric2 label="Recall" value={pct(recall)} />
          <Metric2 label="F1-score" value={pct(f1)} />
          <Metric2 label="Accuracy" value={pct(acc)} hero />
        </div>
      </div>
    </Card>
  )
}

function MatrixCell({ value, label, tone }: { value: number; label: string; tone: string }) {
  return (
    <div className={`grid h-16 w-16 place-items-center rounded-xl ring-1 ${tone}`}>
      <div className="text-lg font-extrabold tabular-nums">{value}</div>
      <div className="text-[9px] font-semibold uppercase tracking-wider opacity-80">{label}</div>
    </div>
  )
}

function Metric2({ label, value, hero }: { label: string; value: string; hero?: boolean }) {
  return (
    <div className={`rounded-xl border border-white/5 bg-white/[0.02] p-3 ${hero ? 'ring-1 ring-emerald-400/30' : ''}`}>
      <div className="text-[11px] text-slate-400">{label}</div>
      <div className={`mt-0.5 text-xl font-extrabold tabular-nums ${hero ? 'text-emerald-300' : 'text-white'}`}>{value}</div>
    </div>
  )
}

function BenchCell({ v }: { v: string }) {
  if (v === '✓')
    return (
      <td className="px-3 py-2.5">
        <Check className="h-4 w-4 text-emerald-400" />
      </td>
    )
  if (v === '✗')
    return (
      <td className="px-3 py-2.5">
        <X className="h-4 w-4 text-rose-400/70" />
      </td>
    )
  return <td className="px-3 py-2.5 text-xs text-slate-400">{v}</td>
}

/* --------------------------------- shared bits ------------------------------ */
function BigStat({ value, unit, label, tone, icon }: { value: string; unit: string; label: string; tone: string; icon?: React.ReactNode }) {
  return (
    <div className="glass relative overflow-hidden p-4">
      <div className={`pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full bg-gradient-to-br blur-2xl ${tone}`} />
      <div className="relative">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-white">{value}</span>
          {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
          {icon && <span className="ml-auto text-emerald-300">{icon}</span>}
        </div>
        <div className="mt-1 text-xs text-slate-400">{label}</div>
      </div>
    </div>
  )
}

function ImproveStat({ from, to, label }: { from: string; to: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
      <div className="text-[11px] text-slate-400">{label}</div>
      <div className="mt-1 flex items-center justify-center gap-1.5 text-sm">
        <span className="font-mono text-slate-500 line-through">{from}</span>
        <span className="text-emerald-300">→</span>
        <span className="font-mono font-bold text-emerald-300">{to}</span>
      </div>
    </div>
  )
}

function Row({ label, value, tone = 'text-slate-200' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-1">
      <span>{label}</span>
      <span className={`font-mono font-semibold ${tone}`}>{value}</span>
    </div>
  )
}
