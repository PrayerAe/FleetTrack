import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { TerminalSquare, Radio, Database, Cpu } from 'lucide-react'
import { useSim } from '../../sim/SimContext'
import { STATUS_META } from '../../lib/ui'
import { Card, LiveBadge, SectionTitle, Tag } from '../ui/primitives'
import type { Telemetry } from '../../types'

const MQTT_TOPICS = [
  { topic: 'rental/motor/{id}/telemetry', dir: 'device → server', qos: 1, payload: 'Telemetri JSON (1 Hz)' },
  { topic: 'rental/motor/{id}/cmd', dir: 'server → device', qos: 1, payload: 'engine_cutoff · set_interval' },
  { topic: 'rental/system/heartbeat', dir: 'device → server', qos: 0, payload: 'Denyut keaktifan / 30 dtk' },
]

export function TelemetryConsole() {
  const { feed, totalMessages, msgPerSec, fleet } = useSim()
  const [device, setDevice] = useState<string>('all')

  const shown = useMemo(() => (device === 'all' ? feed : feed.filter((p) => p.id === device)).slice(0, 60), [feed, device])

  return (
    <div>
      <SectionTitle
        icon={<TerminalSquare className="h-5 w-5" />}
        title="Telemetry Console"
        subtitle="Aliran pesan MQTT mentah (QoS 1) · payload JSON langsung dari perangkat ESP32 di lapangan"
        right={<LiveBadge label="STREAM" />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* console */}
        <div className="glass flex flex-col overflow-hidden p-0 lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-white/10 bg-ink-950/60 px-4 py-2.5">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-400/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
            </div>
            <span className="font-mono text-xs text-slate-400">mosquitto_sub · rental/motor/+/telemetry</span>
            <select
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              className="ml-auto rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs text-slate-200 focus:outline-none"
            >
              <option value="all" className="bg-ink-850">semua device</option>
              {fleet.map((m) => (
                <option key={m.device_id} value={m.device_id} className="bg-ink-850">
                  {m.device_id}
                </option>
              ))}
            </select>
          </div>
          <div className="h-[58vh] min-h-[420px] overflow-y-auto bg-ink-950/40 p-3 font-mono text-[12.5px] leading-relaxed">
            {shown.map((p, i) => (
              <Line key={`${p.id}-${p.ts}-${i}`} p={p} fresh={i === 0} />
            ))}
            {shown.length === 0 && <div className="py-10 text-center text-slate-500">Menunggu paket telemetri…</div>}
          </div>
        </div>

        {/* side */}
        <div className="space-y-4">
          <Card>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Cpu className="h-4 w-4 text-cyan-300" /> Throughput Broker
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                <div className="text-2xl font-extrabold tabular-nums text-white">{msgPerSec}</div>
                <div className="text-[11px] text-slate-400">msg / detik</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                <div className="text-2xl font-extrabold tabular-nums text-white">{totalMessages.toLocaleString('id-ID')}</div>
                <div className="text-[11px] text-slate-400">total terkirim</div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
              <span className="flex items-center gap-1.5"><Radio className="h-3.5 w-3.5" /> QoS 1 · TLS</span>
              <span className="font-mono">0 drop</span>
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Radio className="h-4 w-4 text-violet-300" /> Struktur Topic MQTT
            </h3>
            <div className="space-y-2">
              {MQTT_TOPICS.map((t) => (
                <div key={t.topic} className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <Tag className="truncate">{t.topic}</Tag>
                    <span className="chip bg-violet-500/15 text-violet-300">QoS {t.qos}</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{t.dir}</span>
                    <span className="truncate text-slate-500">{t.payload}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Database className="h-4 w-4 text-sky-300" /> Skema Payload (ISO-8601)
            </h3>
            <pre className="overflow-x-auto rounded-xl border border-white/10 bg-ink-950/80 p-3 font-mono text-[11.5px] leading-relaxed text-slate-300">
{`{
  "id":  "MOTOR-001",
  "ts":  "2026-02-18T10:30:00Z",
  "lat": 1.48700,
  "lng": 124.83500,
  "spd": 45.2,
  "bat": 87,
  "sat": 8,
  "st":  "rented"
}`}
            </pre>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Line({ p, fresh }: { p: Telemetry; fresh: boolean }) {
  return (
    <motion.div
      initial={fresh ? { backgroundColor: 'rgba(124,58,237,0.18)' } : false}
      animate={{ backgroundColor: 'rgba(0,0,0,0)' }}
      transition={{ duration: 1.2 }}
      className="flex flex-wrap items-center gap-x-1 rounded px-1 py-0.5"
    >
      <span className="text-slate-600">›</span>
      <span className="text-violet-300">rental/motor/{p.id}/telemetry</span>
      <span className="text-slate-600">{'{'}</span>
      <K k="ts" />
      <V className="text-amber-300">"{p.ts.slice(11, 19)}"</V>
      <K k="lat" />
      <V className="text-sky-300">{p.lat.toFixed(5)}</V>
      <K k="lng" />
      <V className="text-sky-300">{p.lng.toFixed(5)}</V>
      <K k="spd" />
      <V className={p.spd > 60 ? 'text-rose-300' : 'text-emerald-300'}>{p.spd.toFixed(1)}</V>
      <K k="bat" />
      <V className="text-emerald-300">{p.bat}</V>
      <K k="sat" />
      <V className="text-slate-300">{p.sat}</V>
      <K k="st" />
      <span style={{ color: STATUS_META[p.st].hex }}>"{p.st}"</span>
      <span className="text-slate-600">{'}'}</span>
    </motion.div>
  )
}

function K({ k }: { k: string }) {
  return (
    <span>
      <span className="text-slate-500">"{k}"</span>
      <span className="text-slate-600">:</span>
    </span>
  )
}
function V({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span>
      <span className={className}>{children}</span>
      <span className="text-slate-600">,</span>
    </span>
  )
}
