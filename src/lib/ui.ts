import type { Severity, Status } from '../types'

export const STATUS_META: Record<
  Status,
  { label: string; dot: string; text: string; bg: string; ring: string; hex: string }
> = {
  rented: { label: 'Disewa', dot: 'bg-blue-400', text: 'text-blue-300', bg: 'bg-blue-500/15', ring: 'ring-blue-400/30', hex: '#3b82f6' },
  available: { label: 'Tersedia', dot: 'bg-emerald-400', text: 'text-emerald-300', bg: 'bg-emerald-500/15', ring: 'ring-emerald-400/30', hex: '#22c55e' },
  alert: { label: 'Alert', dot: 'bg-rose-400', text: 'text-rose-300', bg: 'bg-rose-500/15', ring: 'ring-rose-400/30', hex: '#ef4444' },
  maintenance: { label: 'Maintenance', dot: 'bg-slate-400', text: 'text-slate-300', bg: 'bg-slate-500/15', ring: 'ring-slate-400/30', hex: '#94a3b8' },
}

export const SEVERITY_META: Record<Severity, { label: string; cls: string; hex: string }> = {
  TINGGI: { label: 'TINGGI', cls: 'bg-rose-500/15 text-rose-300 border border-rose-500/30', hex: '#f43f5e' },
  SEDANG: { label: 'SEDANG', cls: 'bg-amber-500/15 text-amber-300 border border-amber-500/30', hex: '#f59e0b' },
  RENDAH: { label: 'RENDAH', cls: 'bg-yellow-500/15 text-yellow-200 border border-yellow-500/30', hex: '#eab308' },
  INFO: { label: 'INFO', cls: 'bg-slate-500/15 text-slate-300 border border-slate-500/30', hex: '#94a3b8' },
}

export function rupiah(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export function timeAgo(date: Date, now: Date): string {
  const s = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000))
  if (s < 60) return `${s}d lalu`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}j lalu`
  return `${Math.floor(h / 24)}h lalu`
}

export function fmtTime(date: Date): string {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

export function fmtDateTime(date: Date): string {
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function batteryColor(bat: number): string {
  if (bat <= 20) return '#f43f5e'
  if (bat <= 45) return '#f59e0b'
  return '#22c55e'
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
