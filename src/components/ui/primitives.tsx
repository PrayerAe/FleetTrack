import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import clsx from 'clsx'
import type { Severity, Status } from '../../types'
import { SEVERITY_META, STATUS_META } from '../../lib/ui'

export function Card({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={clsx('glass glass-hover p-5', className)}
    >
      {children}
    </motion.div>
  )
}

export function SectionTitle({
  icon,
  title,
  subtitle,
  right,
}: {
  icon?: ReactNode
  title: string
  subtitle?: string
  right?: ReactNode
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-violet/30 to-brand-cyan/20 text-violet-200 ring-1 ring-white/10">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  )
}

export function StatusBadge({ status }: { status: Status }) {
  const m = STATUS_META[status]
  return (
    <span className={clsx('chip', m.bg, m.text, 'ring-1', m.ring)}>
      <span className={clsx('h-1.5 w-1.5 rounded-full', m.dot)} />
      {m.label}
    </span>
  )
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <span className={clsx('chip', SEVERITY_META[severity].cls)}>{SEVERITY_META[severity].label}</span>
}

export function LiveBadge({ label = 'LIVE' }: { label?: string }) {
  return (
    <span className="chip bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
      </span>
      {label}
    </span>
  )
}

export function Progress({ value, color }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color ?? 'linear-gradient(90deg,#7c3aed,#0ea5e9)' }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  )
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={clsx('rounded-md bg-white/5 px-2 py-0.5 font-mono text-[11px] text-slate-300 ring-1 ring-white/10', className)}>
      {children}
    </span>
  )
}
