import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import clsx from 'clsx'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: ReactNode
  sub?: ReactNode
  accent?: string
  delay?: number
}

export function StatCard({ icon, label, value, sub, accent = 'from-brand-violet/25 to-brand-cyan/10', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className="glass glass-hover relative overflow-hidden p-4"
    >
      <div className={clsx('pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-gradient-to-br blur-2xl', accent)} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-1.5 text-2xl font-extrabold tabular-nums text-white">{value}</p>
          {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-violet-200 ring-1 ring-white/10">
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
