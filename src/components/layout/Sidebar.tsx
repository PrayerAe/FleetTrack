import clsx from 'clsx'
import { motion } from 'framer-motion'
import { Bike, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { NAV, type ViewId } from '../../nav'
import { useSim } from '../../sim/SimContext'

export function Sidebar({
  active,
  onSelect,
  mobileOpen,
  onClose,
  collapsed,
  onToggleCollapse,
}: {
  active: ViewId
  onSelect: (v: ViewId) => void
  mobileOpen: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}) {
  const { counts, alerts } = useSim()
  const liveAlerts = alerts.filter((a) => a.live).length
  const groups = Array.from(new Set(NAV.map((n) => n.group)))

  return (
    <>
      {/* mobile backdrop */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-white/10 bg-ink-900/80 backdrop-blur-2xl transition-all duration-300 lg:translate-x-0',
          collapsed ? 'lg:w-[84px]' : 'lg:w-[270px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* brand */}
        <div className={clsx('flex items-center gap-3 px-5 pb-4 pt-6', collapsed && 'lg:flex-col lg:gap-3 lg:px-2')}>
          <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-violet via-brand-blue to-brand-cyan shadow-glow">
            <Bike className="h-6 w-6 text-white" />
          </div>
          <div className={clsx('leading-tight', collapsed && 'lg:hidden')}>
            <div className="text-[15px] font-extrabold tracking-tight text-white">
              FleetTrack <span className="gradient-text">Manado</span>
            </div>
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">Smart Fleet IoT</div>
          </div>
          {/* mobile close */}
          <button className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-white/10 lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
          {/* desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            className={clsx(
              'hidden rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white lg:inline-flex',
              !collapsed && 'lg:ml-auto',
            )}
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </div>

        {/* nav */}
        <nav className={clsx('flex-1 space-y-5 overflow-y-auto px-3 py-2', collapsed && 'lg:space-y-2 lg:px-2')}>
          {groups.map((g, gi) => (
            <div key={g}>
              {/* group label (expanded) / divider (collapsed desktop) */}
              <div className={clsx('mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500', collapsed && 'lg:hidden')}>
                {g}
              </div>
              {collapsed && gi > 0 && <div className="mx-auto mb-2 hidden h-px w-7 bg-white/10 lg:block" />}
              <div className="space-y-1">
                {NAV.filter((n) => n.group === g).map((item) => {
                  const isActive = active === item.id
                  const Icon = item.icon
                  const showBadge = item.id === 'alerts' && counts.alert > 0
                  return (
                    <button
                      key={item.id}
                      title={collapsed ? item.label : undefined}
                      onClick={() => {
                        onSelect(item.id)
                        onClose()
                      }}
                      className={clsx(
                        'nav-item w-full text-left',
                        collapsed && 'lg:justify-center lg:px-0',
                        isActive && 'nav-item-active',
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="navGlow"
                          className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-brand-violet to-brand-cyan"
                        />
                      )}
                      <span className="relative shrink-0">
                        <Icon className="h-[18px] w-[18px]" />
                        {/* collapsed alert dot (desktop only) */}
                        {showBadge && (
                          <span
                            className={clsx(
                              'absolute -right-1 -top-1 hidden h-2 w-2 rounded-full bg-rose-400 ring-2 ring-ink-900',
                              collapsed && 'lg:block',
                            )}
                          />
                        )}
                      </span>
                      <span className={clsx('flex-1 truncate', collapsed && 'lg:hidden')}>{item.label}</span>
                      {showBadge && (
                        <span
                          className={clsx(
                            'rounded-full bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300 ring-1 ring-rose-400/30',
                            collapsed && 'lg:hidden',
                          )}
                        >
                          {counts.alert + (liveAlerts > 0 ? 0 : 0)}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* footer (hidden when collapsed on desktop) */}
        <div className={clsx('space-y-3 border-t border-white/10 p-4', collapsed && 'lg:hidden')}>
          <div className="flex items-center gap-1.5">
            {['SDG 8', 'SDG 9', 'SDG 11'].map((s) => (
              <span key={s} className="rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
                {s}
              </span>
            ))}
          </div>
          <div className="text-[10px] leading-relaxed text-slate-500">
            Live IoT Telemetry · iCAST 2026
            <br />
            ESP32 · GPS NEO-6M · Hall Effect · MQTT
          </div>
        </div>
      </aside>
    </>
  )
}
