import { motion } from 'framer-motion'

interface GaugeProps {
  value: number
  max?: number
  limit?: number
  unit?: string
  size?: number
  label?: string
}

/** Animated 270° arc speed gauge. */
export function Gauge({ value, max = 80, limit = 60, unit = 'km/h', size = 150, label }: GaugeProps) {
  const stroke = 11
  const r = (size - stroke) / 2 - 6
  const cx = size / 2
  const cy = size / 2
  const startAngle = 135
  const sweep = 270
  const pct = Math.max(0, Math.min(1, value / max))
  const circ = 2 * Math.PI * r
  const arcLen = (sweep / 360) * circ
  const over = value > limit
  const color = over ? '#f43f5e' : value > limit * 0.8 ? '#f59e0b' : '#22d3ee'

  // limit tick angle
  const limitFrac = limit / max
  const limitAngle = startAngle + limitFrac * sweep
  const lr = r + stroke / 2 + 2
  const lx1 = cx + (r - stroke / 2 - 2) * Math.cos((limitAngle * Math.PI) / 180)
  const ly1 = cy + (r - stroke / 2 - 2) * Math.sin((limitAngle * Math.PI) / 180)
  const lx2 = cx + lr * Math.cos((limitAngle * Math.PI) / 180)
  const ly2 = cy + lr * Math.sin((limitAngle * Math.PI) / 180)

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-0">
        <defs>
          <linearGradient id={`gg-${label}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.9" />
            <stop offset="1" stopColor={color} stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {/* track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(100,116,139,0.22)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arcLen} ${circ}`}
          transform={`rotate(${startAngle} ${cx} ${cy})`}
        />
        {/* value */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={`url(#gg-${label})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arcLen} ${circ}`}
          transform={`rotate(${startAngle} ${cx} ${cy})`}
          initial={false}
          animate={{ strokeDashoffset: arcLen * (1 - pct) }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          style={{ filter: `drop-shadow(0 0 6px ${color}aa)` }}
        />
        {/* limit tick */}
        <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke="#f43f5e" strokeWidth={2.5} strokeLinecap="round" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-extrabold tabular-nums text-white" style={{ color: over ? '#fda4af' : '#fff' }}>
          {value.toFixed(0)}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">{unit}</span>
        {label && <span className="mt-1 font-mono text-[11px] text-slate-300">{label}</span>}
      </div>
    </div>
  )
}
