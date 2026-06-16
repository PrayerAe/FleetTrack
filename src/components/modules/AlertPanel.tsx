import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Siren, Gauge, ShieldX, BatteryWarning, Moon, Wrench, SatelliteDish } from 'lucide-react'
import { useSim } from '../../sim/SimContext'
import { SEVERITY_META, fmtDateTime, timeAgo } from '../../lib/ui'
import { LiveBadge, SectionTitle, SeverityBadge } from '../ui/primitives'
import type { AlertType, Severity } from '../../types'

const TYPE_ICON: Record<AlertType, typeof Gauge> = {
  Overspeed: Gauge,
  'Geofence Violation': ShieldX,
  'Low Battery': BatteryWarning,
  'Idle Timeout': Moon,
  Maintenance: Wrench,
  'Low Satellite': SatelliteDish,
}

export function AlertPanel() {
  const { alerts, simClock } = useSim()
  const [filter, setFilter] = useState<Severity | 'all'>('all')

  const sevCounts: Record<Severity, number> = { TINGGI: 0, SEDANG: 0, RENDAH: 0, INFO: 0 }
  for (const a of alerts) sevCounts[a.severity]++

  const filtered = alerts.filter((a) => filter === 'all' || a.severity === filter)

  return (
    <div>
      <SectionTitle
        icon={<Siren className="h-5 w-5" />}
        title="Alert Panel"
        subtitle="Notifikasi pelanggaran real-time via Socket.IO"
        right={<LiveBadge />}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['TINGGI', 'SEDANG', 'RENDAH', 'INFO'] as Severity[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? 'all' : s)}
            className={`glass glass-hover p-4 text-left transition ${filter === s ? 'ring-2 ring-white/30' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{SEVERITY_META[s].label}</span>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: SEVERITY_META[s].hex }} />
            </div>
            <div className="mt-1 text-3xl font-extrabold tabular-nums text-white">{sevCounts[s]}</div>
          </button>
        ))}
      </div>

      <div className="glass p-2 sm:p-3">
        <div className="mb-2 flex items-center justify-between px-2 pt-1">
          <span className="text-sm font-semibold text-slate-200">Riwayat Alert ({filtered.length})</span>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="text-xs font-semibold text-violet-300 hover:text-violet-200">
              Tampilkan semua
            </button>
          )}
        </div>
        <div className="max-h-[60vh] space-y-1.5 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {filtered.map((a) => {
              const Icon = TYPE_ICON[a.type]
              return (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, x: -16, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start gap-3 rounded-xl border p-3 ${
                    a.live ? 'border-rose-400/20 bg-rose-500/[0.06]' : 'border-white/5 bg-white/[0.02]'
                  }`}
                >
                  <div
                    className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                    style={{ background: `${SEVERITY_META[a.severity].hex}22`, color: SEVERITY_META[a.severity].hex }}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-white">{a.device_id}</span>
                      <span className="text-sm font-semibold text-slate-200">{a.type}</span>
                      <SeverityBadge severity={a.severity} />
                      {a.live && (
                        <span className="chip bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" /> baru
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">{a.detail}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-[11px] font-medium text-slate-300">{timeAgo(a.time, simClock)}</div>
                    <div className="text-[10px] text-slate-500">{fmtDateTime(a.time)}</div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          {filtered.length === 0 && <div className="py-10 text-center text-sm text-slate-500">Tidak ada alert pada filter ini.</div>}
        </div>
      </div>
    </div>
  )
}
