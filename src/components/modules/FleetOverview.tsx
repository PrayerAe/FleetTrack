import { Bike, CircleDot, CircleCheck, Siren, Wrench, Activity, Battery, Satellite, Gauge } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useSim } from '../../sim/SimContext'
import { STATUS_META, batteryColor } from '../../lib/ui'
import { Card, SectionTitle, StatusBadge } from '../ui/primitives'
import { StatCard } from '../ui/StatCard'
import { chartTooltip } from '../ui/chart'

export function FleetOverview() {
  const { fleet, counts, utilization } = useSim()

  const pieData = [
    { name: 'Disewa', value: counts.rented, color: STATUS_META.rented.hex },
    { name: 'Tersedia', value: counts.available, color: STATUS_META.available.hex },
    { name: 'Alert', value: counts.alert, color: STATUS_META.alert.hex },
    { name: 'Maintenance', value: counts.maintenance, color: STATUS_META.maintenance.hex },
  ].filter((d) => d.value > 0)

  return (
    <div>
      <SectionTitle icon={<Bike className="h-5 w-5" />} title="Fleet Overview" subtitle="Status & utilisasi armada · 10 unit terdaftar" />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={<Bike className="h-5 w-5" />} label="Total Unit" value={fleet.length} sub="terdaftar" delay={0} />
        <StatCard icon={<CircleDot className="h-5 w-5" />} label="Disewa" value={counts.rented} sub="rented" accent="from-blue-500/30 to-blue-400/10" delay={0.05} />
        <StatCard icon={<CircleCheck className="h-5 w-5" />} label="Tersedia" value={counts.available} sub="available" accent="from-emerald-500/30 to-emerald-400/10" delay={0.1} />
        <StatCard icon={<Siren className="h-5 w-5" />} label="Alert" value={counts.alert} sub="butuh perhatian" accent="from-rose-500/30 to-rose-400/10" delay={0.15} />
        <StatCard icon={<Wrench className="h-5 w-5" />} label="Maintenance" value={counts.maintenance} sub="di bengkel" accent="from-slate-500/30 to-slate-400/10" delay={0.2} />
        <StatCard icon={<Activity className="h-5 w-5" />} label="Utilisasi" value={`${utilization}%`} sub="unit dipakai" accent="from-brand-violet/30 to-brand-cyan/10" delay={0.25} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* donut */}
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-200">Distribusi Status Armada</h3>
          <div className="relative">
            <ResponsiveContainer width="100%" height={258}>
              <PieChart>
                <Tooltip content={chartTooltip} />
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={102} paddingAngle={3} stroke="none">
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white">{fleet.length}</span>
              <span className="text-[11px] uppercase tracking-wider text-slate-400">unit</span>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                {d.name}
                <span className="ml-auto font-mono font-semibold text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* fleet table */}
        <Card className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-slate-200">Daftar Armada (snapshot real-time)</h3>
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-2 py-2 font-semibold">Unit</th>
                  <th className="px-2 py-2 font-semibold">Model</th>
                  <th className="px-2 py-2 font-semibold">Status</th>
                  <th className="px-2 py-2 text-right font-semibold">Kec.</th>
                  <th className="px-2 py-2 text-right font-semibold">Baterai</th>
                  <th className="px-2 py-2 text-right font-semibold">Sat</th>
                  <th className="px-2 py-2 text-right font-semibold">Odo (km)</th>
                </tr>
              </thead>
              <tbody>
                {fleet.map((m) => (
                  <tr key={m.device_id} className="border-t border-white/5 transition hover:bg-white/[0.03]">
                    <td className="px-2 py-2.5">
                      <div className="font-mono text-xs font-semibold text-white">{m.device_id}</div>
                      <div className="text-[10px] text-slate-500">{m.plat}</div>
                    </td>
                    <td className="px-2 py-2.5 text-xs text-slate-300">
                      {m.model}
                      <div className="text-[10px] text-slate-500">{m.street} · {m.area}</div>
                    </td>
                    <td className="px-2 py-2.5"><StatusBadge status={m.status} /></td>
                    <td className="px-2 py-2.5 text-right">
                      <span className={`inline-flex items-center gap-1 font-mono tabular-nums ${m.spd > m.speedLimit ? 'text-rose-300' : 'text-slate-200'}`}>
                        <Gauge className="h-3 w-3 opacity-60" />{m.spd.toFixed(0)}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <span className="inline-flex items-center gap-1 font-mono tabular-nums" style={{ color: batteryColor(m.bat) }} title="Baterai perangkat tracker">
                        <Battery className="h-3 w-3" />{m.bat.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-300">
                        <Satellite className="h-3 w-3 opacity-60" />{m.sat}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-right font-mono tabular-nums text-slate-300">{m.odometer.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
