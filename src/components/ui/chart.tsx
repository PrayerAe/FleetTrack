import type { TooltipProps } from 'recharts'

/** Dark glass tooltip for all recharts visualizations. */
export function chartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-xl border border-white/10 bg-ink-850/95 px-3 py-2 shadow-xl backdrop-blur">
      {label !== undefined && <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ background: (p.color as string) ?? '#22d3ee' }} />
          <span className="text-slate-300">{p.name}</span>
          <span className="ml-auto font-mono font-semibold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  )
}
