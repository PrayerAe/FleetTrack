import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Siren, X } from 'lucide-react'
import { useSim } from '../../sim/SimContext'
import { SEVERITY_META } from '../../lib/ui'
import type { AlertItem } from '../../types'

export function AlertToaster({ onOpen }: { onOpen: () => void }) {
  const { newAlertPing } = useSim()
  const [toasts, setToasts] = useState<AlertItem[]>([])
  const lastId = useRef<string | null>(null)

  useEffect(() => {
    if (!newAlertPing || newAlertPing.id === lastId.current) return
    lastId.current = newAlertPing.id
    const toast = newAlertPing
    setToasts((prev) => [toast, ...prev].slice(0, 3))
    const handle = window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id))
    }, 5200)
    return () => window.clearTimeout(handle)
  }, [newAlertPing])

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(92vw,360px)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((a) => (
          <motion.button
            key={a.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={() => {
              onOpen()
              setToasts((prev) => prev.filter((t) => t.id !== a.id))
            }}
            className="pointer-events-auto flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-ink-850/95 p-3.5 text-left shadow-2xl backdrop-blur-xl"
          >
            <span
              className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl"
              style={{ background: `${SEVERITY_META[a.severity].hex}22`, color: SEVERITY_META[a.severity].hex }}
            >
              <Siren className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{a.type}</span>
                <span className="chip" style={{ background: `${SEVERITY_META[a.severity].hex}22`, color: SEVERITY_META[a.severity].hex }}>
                  {a.severity}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">
                <span className="font-mono text-slate-300">{a.device_id}</span> · {a.detail}
              </p>
            </div>
            <X className="h-4 w-4 shrink-0 text-slate-500" />
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
