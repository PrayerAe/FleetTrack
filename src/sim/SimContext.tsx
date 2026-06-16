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
import { createSocket, hydrateAlert, type Snapshot } from '../lib/realtime'

const FLUSH_MS = 1000 // UI refresh cadence (server pushes per packet)
const FEED_MAX = 120
const TRAIL_MAX = 40

/**
 * Live data context. Subscribes to the FleetTrack cloud server over Socket.IO and
 * exposes real telemetry to the dashboard. The public shape is unchanged from the
 * previous in-browser engine, so every module keeps working via `useSim()` — the
 * difference is that the numbers now come from real GPS devices, not a simulator.
 */
export interface SimState {
  fleet: Motorcycle[]
  alerts: AlertItem[]
  trails: Record<string, LatLng[]>
  feed: Telemetry[]
  simClock: Date
  running: boolean
  connected: boolean
  // live metrics
  latencyMs: number
  msgPerSec: number
  totalMessages: number
  counts: Record<Status, number>
  utilization: number
  // controls
  toggleRunning: () => void
  newAlertPing: AlertItem | null
}

const SimContext = createContext<SimState | null>(null)

const haversine = (a: LatLng, b: LatLng) => {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function SimProvider({ children }: { children: ReactNode }) {
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

  // Buffers updated by socket events; flushed to React state on an interval so a
  // burst of packets becomes one render per FLUSH_MS instead of dozens.
  const devicesRef = useRef<Map<string, Motorcycle>>(new Map())
  const trailsRef = useRef<Record<string, LatLng[]>>({})
  const feedRef = useRef<Telemetry[]>([])
  const runningRef = useRef(running)
  runningRef.current = running

  const secCount = useRef(0)
  const latSum = useRef(0)
  const latN = useRef(0)
  const dirty = useRef(false)

  useEffect(() => {
    const socket = createSocket()

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('snapshot', (snap: Snapshot) => {
      devicesRef.current = new Map(snap.devices.map((d) => [d.device_id, d]))
      trailsRef.current = { ...snap.trails }
      setAlerts(snap.alerts.map(hydrateAlert))
      dirty.current = true
    })

    socket.on('device:update', (m) => {
      const prev = devicesRef.current.get(m.device_id)
      devicesRef.current.set(m.device_id, m)
      // Extend the trail for in-use units that actually moved.
      if (m.status === 'rented' || m.status === 'alert') {
        const trail = trailsRef.current[m.device_id] ?? []
        const last = trail[trail.length - 1]
        const pos: LatLng = [m.lat, m.lng]
        if (!prev || !last || haversine(last, pos) > 4) {
          const next = [...trail, pos]
          if (next.length > TRAIL_MAX) next.shift()
          trailsRef.current[m.device_id] = next
        }
      }
      dirty.current = true
    })

    socket.on('telemetry', (t) => {
      feedRef.current = [t, ...feedRef.current].slice(0, FEED_MAX)
      secCount.current += 1
      const lat = Date.now() - Date.parse(t.ts)
      if (Number.isFinite(lat) && lat >= 0 && lat < 60_000) {
        latSum.current += lat
        latN.current += 1
      }
      dirty.current = true
    })

    socket.on('alert', (a) => {
      const alert = hydrateAlert(a)
      setAlerts((prev) => [alert, ...prev].slice(0, 60))
      setNewAlertPing(alert)
    })

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
    }
  }, [])

  // Flush buffers → React state once per second; also computes msg/s and latency.
  useEffect(() => {
    const handle = window.setInterval(() => {
      setMsgPerSec(secCount.current)
      setTotalMessages((n) => n + secCount.current)
      if (latN.current > 0) setLatencyMs(Math.round(latSum.current / latN.current))
      secCount.current = 0
      latSum.current = 0
      latN.current = 0

      if (!runningRef.current) return // paused: freeze the UI
      setSimClock(new Date())
      if (!dirty.current) return
      dirty.current = false
      setFleet([...devicesRef.current.values()])
      setTrails({ ...trailsRef.current })
      setFeed(feedRef.current.slice())
    }, FLUSH_MS)
    return () => window.clearInterval(handle)
  }, [])

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
