import clsx from 'clsx'
import { useState } from 'react'
import { Menu, PanelLeft, Pause, Play, Wifi, WifiOff, Activity, Gauge as GaugeIcon, Clock, Sun, Moon } from 'lucide-react'
import { useSim } from '../../sim/SimContext'
import { fmtTime } from '../../lib/ui'
import { applyTheme, getTheme, type Theme } from '../../lib/theme'
import type { NavItem } from '../../nav'

export function TopBar({
  item,
  onMenu,
  onToggleCollapse,
  collapsed,
}: {
  item: NavItem
  onMenu: () => void
  onToggleCollapse: () => void
  collapsed: boolean
}) {
  const { running, toggleRunning, connected, latencyMs, msgPerSec, simClock } = useSim()
  const [theme, setTheme] = useState<Theme>(getTheme())
  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    setTheme(next)
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-ink-950/70 px-4 py-3 backdrop-blur-xl sm:px-6">
      {/* mobile: open drawer */}
      <button className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden" onClick={onMenu}>
        <Menu className="h-5 w-5" />
      </button>
      {/* desktop: collapse / expand sidebar */}
      <button
        className="hidden rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white lg:inline-flex"
        onClick={onToggleCollapse}
        title={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
      >
        <PanelLeft className="h-5 w-5" />
      </button>

      <div className="min-w-0">
        <h2 className="truncate text-[15px] font-bold text-white sm:text-base">{item.label}</h2>
        <p className="hidden truncate text-xs text-slate-400 sm:block">{item.short}</p>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* metrics — hidden on small screens */}
        <div className="hidden items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 xl:flex">
          <Metric icon={<Activity className="h-3.5 w-3.5" />} label="msg/s" value={msgPerSec} tone="cyan" />
          <span className="h-4 w-px bg-white/10" />
          <Metric icon={<GaugeIcon className="h-3.5 w-3.5" />} label="latensi" value={`${(latencyMs / 1000).toFixed(1)}s`} tone="violet" />
          <span className="h-4 w-px bg-white/10" />
          <Metric icon={<Clock className="h-3.5 w-3.5" />} label="WITA" value={fmtTime(simClock)} tone="slate" />
        </div>

        {/* connection */}
        <span
          className={clsx(
            'hidden items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold sm:flex',
            connected
              ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
              : 'border-slate-500/30 bg-slate-500/10 text-slate-400',
          )}
        >
          {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {connected ? 'Socket.IO' : 'Terputus'}
        </span>

        {/* theme toggle */}
        <button
          onClick={toggleTheme}
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
          title={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* play / pause */}
        <button
          onClick={toggleRunning}
          className={clsx(
            'grid h-9 w-9 place-items-center rounded-lg border transition',
            running
              ? 'border-rose-400/30 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25'
              : 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25',
          )}
          title={running ? 'Jeda pembaruan langsung' : 'Lanjutkan pembaruan langsung'}
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      </div>
    </header>
  )
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: React.ReactNode; tone: string }) {
  const toneCls: Record<string, string> = {
    cyan: 'text-cyan-300',
    violet: 'text-violet-300',
    slate: 'text-slate-300',
  }
  return (
    <div className="flex items-center gap-1.5">
      <span className={toneCls[tone]}>{icon}</span>
      <span className="font-mono text-xs font-semibold tabular-nums text-white">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-slate-500">{label}</span>
    </div>
  )
}
