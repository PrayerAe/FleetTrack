import { useState } from 'react'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { SimProvider, useSim } from './sim/SimContext'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'
import { NAV, type ViewId } from './nav'
import { Overview } from './components/modules/Overview'
import { LiveMap } from './components/modules/LiveMap'
import { SpeedMonitor } from './components/modules/SpeedMonitor'
import { GeofenceManager } from './components/modules/GeofenceManager'
import { FleetOverview } from './components/modules/FleetOverview'
import { AlertPanel } from './components/modules/AlertPanel'
import { RentalManagement } from './components/modules/RentalManagement'
import { Analytics } from './components/modules/Analytics'
import { ResearchFindings } from './components/modules/ResearchFindings'
import { TelemetryConsole } from './components/modules/TelemetryConsole'
import { AlertToaster } from './components/layout/AlertToaster'

export default function App() {
  return (
    <SimProvider>
      <Shell />
    </SimProvider>
  )
}

function Shell() {
  const [active, setActive] = useState<ViewId>('overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ft.sidebar.collapsed') === '1'
    } catch {
      return false
    }
  })
  const toggleCollapsed = () =>
    setCollapsed((c) => {
      const next = !c
      try {
        localStorage.setItem('ft.sidebar.collapsed', next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  const item = NAV.find((n) => n.id === active)!

  return (
    <div className="min-h-screen">
      <Sidebar
        active={active}
        onSelect={setActive}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
      />
      <div className={clsx('transition-[padding] duration-300', collapsed ? 'lg:pl-[84px]' : 'lg:pl-[270px]')}>
        <TopBar item={item} onMenu={() => setMobileOpen(true)} onToggleCollapse={toggleCollapsed} collapsed={collapsed} />
        <main className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <View active={active} onNavigate={setActive} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <AlertToaster onOpen={() => setActive('alerts')} />
    </div>
  )
}

function View({ active, onNavigate }: { active: ViewId; onNavigate: (v: ViewId) => void }) {
  switch (active) {
    case 'overview':
      return <Overview onNavigate={onNavigate} />
    case 'map':
      return <LiveMap />
    case 'speed':
      return <SpeedMonitor />
    case 'geofence':
      return <GeofenceManager />
    case 'fleet':
      return <FleetOverview />
    case 'alerts':
      return <AlertPanel />
    case 'rentals':
      return <RentalManagement />
    case 'analytics':
      return <Analytics />
    case 'research':
      return <ResearchFindings />
    case 'telemetry':
      return <TelemetryConsole />
    default:
      return null
  }
}
