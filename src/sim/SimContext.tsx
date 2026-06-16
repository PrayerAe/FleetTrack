import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { AlertItem, LatLng, Motorcycle, Status, Telemetry } from '../types'
import { FleetEngine } from '../lib/fleetEngine'
import { firebaseConfigured, subscribeTelemetry } from '../lib/firebase'

const FLUSH_MS = 1000
const FEED_MAX = 120

/**
 * Live data context. Subscribes to real GPS telemetry in Firebase Realtime
 * Database and runs the geofence/overspeed engine in the browser. The public
 * shape is unchanged, so every module keeps working via `useSim()` — the numbers
 * now come from real devices writing JSON to Firebase.
 */
export interface SimState {
  fleet: Motorcycle[]
  alerts: AlertItem[]
  trails: Record<string, LatLng[]>
  feed: Telemetry[]
  simClock: Date
  running: boolean
  connected: boolean
  latencyMs: number
  msgPerSec: number
  totalMessages: number
  counts: Record<Status, number>
  utilization: number
  toggleRunning: () => void
  newAlertPing: AlertItem | null
}

const SimContext = createContext<SimState | null>(null)

export function SimProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<FleetEngine>()
  if (!engineRef.current) engineRef.current = new FleetEngine()
  const engine = engineRef.current

  const [fleet, setFleet] = useState<Motorcycle[]>([])
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [trails, setTrails] = useState<Record<string, LatLng[]>>({})
  const [feed, setFeed] = useState<Telemetry[]>([])
  const [simClock, setSimClock] = useState<Date>(new Date())
  const [running, setRunning] = useState(true)
  const [connected, setConnected] = useState(false)
  const [latencyMs, setLatencyMs] = useState(0)
  const [msgPerSec, setMsgPerSec] = useState(0)
  const [totalMessages, setTotalMessages] = useState(0)
  const [newAlertPing, setNewAlertPing] = useState<AlertItem | null>(null)

  const feedRef = useRef<Telemetry[]>([])
  const runningRef = useRef(running)
  runningRef.current = running
  const secCount = useRef(0)
  const latSum = useRef(0)
  const latN = useRef(0)
  const dirty = useRef(false)

  useEffect(() => {
    if (!firebaseConfigured()) {
      // No backend wired yet — show the roster (offline) and stay disconnected.
      return
    }
    const unsubscribe = subscribeTelemetry(
      (raw) => {
        const r = engine.ingest(raw)
        if (!r) return
        feedRef.current = [r.telemetry, ...feedRef.current].slice(0, FEED_MAX)
        secCount.current += 1
        const lat = Date.now() - Date.parse(r.telemetry.ts)
        if (Number.isFinite(lat) && lat >= 0 && lat < 60_000) {
          latSum.current += lat
          latN.current += 1
        }
        if (r.newAlerts.length) setNewAlertPing(r.newAlerts[0])
        dirty.current = true
      },
      (isConnected) => setConnected(isConnected),
    )
    return unsubscribe
  }, [engine])

  // Flush engine state → React once per second (coalesces bursts of packets).
  useEffect(() => {
    const handle = window.setInterval(() => {
      setMsgPerSec(secCount.current)
      setTotalMessages((n) => n + secCount.current)
      if (latN.current > 0) setLatencyMs(Math.round(latSum.current / latN.current))
      secCount.current = 0
      latSum.current = 0
      latN.current = 0

      if (!runningRef.current) return
      setSimClock(new Date())
      if (!dirty.current) return
      dirty.current = false
      // B: only surface units that have actually reported real telemetry.
      setFleet(engine.fleet().filter((m) => m.online))
      setTrails({ ...engine.trails })
      setAlerts(engine.alerts.slice())
      setFeed(feedRef.current.slice())
    }, FLUSH_MS)
    return () => window.clearInterval(handle)
  }, [engine])

  const toggleRunning = useCallback(() => setRunning((r) => !r), [])

  const counts = useMemo(() => {
    const c: Record<Status, number> = { rented: 0, available: 0, alert: 0, maintenance: 0 }
    for (const m of fleet) c[m.status]++
    return c
  }, [fleet])

  const utilization = useMemo(() => {
    if (!fleet.length) return 0
    const inUse = counts.rented + counts.alert
    return Math.round((inUse / fleet.length) * 100)
  }, [counts, fleet.length])

  const value: SimState = {
    fleet,
    alerts,
    trails,
    feed,
    simClock,
    running,
    connected,
    latencyMs,
    msgPerSec,
    totalMessages,
    counts,
    utilization,
    toggleRunning,
    newAlertPing,
  }

  return <SimContext.Provider value={value}>{children}</SimContext.Provider>
}

export function useSim(): SimState {
  const ctx = useContext(SimContext)
  if (!ctx) throw new Error('useSim must be used within SimProvider')
  return ctx
}
