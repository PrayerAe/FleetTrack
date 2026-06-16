import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ReceiptText, Download, Plus, Wallet, CircleDot, CheckCircle2, X } from 'lucide-react'
import { RENTALS } from '../../data/fleet'
import { useSim } from '../../sim/SimContext'
import { downloadCsv, rupiah } from '../../lib/ui'
import { Card, SectionTitle } from '../ui/primitives'
import { StatCard } from '../ui/StatCard'
import type { Rental } from '../../types'

export function RentalManagement() {
  const { fleet } = useSim()
  const [rentals, setRentals] = useState<Rental[]>(RENTALS)
  const [filter, setFilter] = useState<'all' | 'Aktif' | 'Selesai'>('all')
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)

  const activeRevenue = rentals.filter((r) => r.status === 'Aktif').reduce((s, r) => s + r.tarif, 0)
  const totalRevenue = rentals.reduce((s, r) => s + r.tarif, 0)
  const activeCount = rentals.filter((r) => r.status === 'Aktif').length
  const doneCount = rentals.filter((r) => r.status === 'Selesai').length

  const filtered = useMemo(
    () =>
      rentals.filter((r) => {
        const okF = filter === 'all' || r.status === filter
        const okQ = !query || [r.id, r.device, r.renter, r.model].some((v) => v.toLowerCase().includes(query.toLowerCase()))
        return okF && okQ
      }),
    [rentals, filter, query],
  )

  const exportCsv = () => {
    downloadCsv('fleettrack-rentals.csv', [
      ['ID', 'Unit', 'Model', 'Penyewa', 'Mulai', 'Durasi (hari)', 'Tarif', 'Status'],
      ...filtered.map((r) => [r.id, r.device, r.model, r.renter, r.start, r.durationDays, r.tarif, r.status]),
    ])
  }

  return (
    <div>
      <SectionTitle
        icon={<ReceiptText className="h-5 w-5" />}
        title="Rental Management"
        subtitle="Transaksi sewa & pendapatan armada"
        right={
          <div className="flex gap-2">
            <button onClick={exportCsv} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10">
              <Download className="h-4 w-4" /> CSV
            </button>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-blue px-3 py-2 text-sm font-semibold text-white shadow-glow hover:opacity-90">
              <Plus className="h-4 w-4" /> Sewa Baru
            </button>
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<CircleDot className="h-5 w-5" />} label="Sewa Aktif" value={activeCount} accent="from-blue-500/30 to-blue-400/10" />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Selesai" value={doneCount} accent="from-emerald-500/30 to-emerald-400/10" delay={0.05} />
        <StatCard icon={<Wallet className="h-5 w-5" />} label="Pendapatan Aktif" value={rupiah(activeRevenue)} accent="from-brand-violet/30 to-brand-cyan/10" delay={0.1} />
        <StatCard icon={<Wallet className="h-5 w-5" />} label="Total Pendapatan" value={rupiah(totalRevenue)} accent="from-amber-500/30 to-amber-400/10" delay={0.15} />
      </div>

      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5">
            {(['all', 'Aktif', 'Selesai'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${filter === f ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {f === 'all' ? 'Semua' : f}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari ID / penyewa / unit…"
            className="ml-auto w-full max-w-xs rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-violet/50 focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
          />
        </div>

        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-3 py-2 font-semibold">ID</th>
                <th className="px-3 py-2 font-semibold">Unit / Model</th>
                <th className="px-3 py-2 font-semibold">Penyewa</th>
                <th className="px-3 py-2 font-semibold">Mulai</th>
                <th className="px-3 py-2 text-center font-semibold">Durasi</th>
                <th className="px-3 py-2 text-right font-semibold">Tarif</th>
                <th className="px-3 py-2 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-white/5 transition hover:bg-white/[0.03]">
                  <td className="px-3 py-3 font-mono text-xs font-semibold text-violet-300">{r.id}</td>
                  <td className="px-3 py-3">
                    <div className="font-mono text-xs text-white">{r.device}</div>
                    <div className="text-[11px] text-slate-400">{r.model}</div>
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-200">{r.renter}</td>
                  <td className="px-3 py-3 text-xs text-slate-400">{r.start}</td>
                  <td className="px-3 py-3 text-center text-xs text-slate-300">{r.durationDays} hari</td>
                  <td className="px-3 py-3 text-right font-mono text-sm font-semibold text-white">{rupiah(r.tarif)}</td>
                  <td className="px-3 py-3 text-center">
                    <span
                      className={`chip ${r.status === 'Aktif' ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30' : 'bg-slate-500/15 text-slate-300 ring-1 ring-slate-400/20'}`}
                    >
                      {r.status === 'Aktif' ? '🟢 Aktif' : '✅ Selesai'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-10 text-center text-sm text-slate-500">Tidak ada transaksi cocok.</div>}
        </div>
      </Card>

      <AnimatePresence>
        {showForm && (
          <NewRentalModal
            availableUnits={fleet.filter((m) => m.status === 'available').map((m) => ({ id: m.device_id, model: m.model }))}
            onClose={() => setShowForm(false)}
            onCreate={(r) => {
              setRentals((prev) => [r, ...prev])
              setShowForm(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function NewRentalModal({
  availableUnits,
  onClose,
  onCreate,
}: {
  availableUnits: { id: string; model: string }[]
  onClose: () => void
  onCreate: (r: Rental) => void
}) {
  const [device, setDevice] = useState(availableUnits[0]?.id ?? '')
  const [model, setModel] = useState(availableUnits[0]?.model ?? '')
  const [renter, setRenter] = useState('')
  const [days, setDays] = useState(1)
  const ratePerDay = 85000
  const tarif = days * ratePerDay

  const submit = () => {
    if (!renter.trim() || !device) return
    const now = new Date()
    onCreate({
      id: `RNT-${2310 + Math.floor(Math.random() * 90)}`,
      device,
      model,
      renter: renter.trim(),
      start: `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      durationDays: days,
      tarif,
      status: 'Aktif',
    })
  }

  return (
    <motion.div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass w-full max-w-md p-6"
        initial={{ scale: 0.94, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Transaksi Sewa Baru</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <Field label="Unit tersedia">
            <select
              value={device}
              onChange={(e) => {
                setDevice(e.target.value)
                setModel(availableUnits.find((u) => u.id === e.target.value)?.model ?? '')
              }}
              className="input"
            >
              {availableUnits.length === 0 && <option value="">Tidak ada unit tersedia</option>}
              {availableUnits.map((u) => (
                <option key={u.id} value={u.id} className="bg-ink-850">
                  {u.id} — {u.model}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nama penyewa">
            <input value={renter} onChange={(e) => setRenter(e.target.value)} placeholder="mis. Brian Tampi" className="input" />
          </Field>
          <Field label="Durasi (hari)">
            <input type="number" min={1} max={30} value={days} onChange={(e) => setDays(Math.max(1, Number(e.target.value)))} className="input" />
          </Field>
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-sm text-slate-400">Estimasi tarif</span>
            <span className="font-mono text-lg font-bold text-white">{rupiah(tarif)}</span>
          </div>
          <button
            onClick={submit}
            disabled={!renter.trim() || !device}
            className="w-full rounded-xl bg-gradient-to-r from-brand-violet to-brand-blue py-3 text-sm font-bold text-white shadow-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Buat Transaksi
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-400">{label}</span>
      {children}
    </label>
  )
}
