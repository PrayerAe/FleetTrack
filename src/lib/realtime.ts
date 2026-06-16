import { io, type Socket } from 'socket.io-client'
import type { AlertItem, Geofence, LatLng, Motorcycle, Telemetry } from '../types'

/** Base URL of the FleetTrack cloud server (Socket.IO + REST). */
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000'

/** Raw alert as it arrives over the wire (time is an ISO string, not a Date). */
export interface WireAlert extends Omit<AlertItem, 'time'> {
  time: string
}

/** Initial state pushed by the server right after a dashboard connects. */
export interface Snapshot {
  devices: Motorcycle[]
  alerts: WireAlert[]
  trails: Record<string, LatLng[]>
  geofences: Geofence[]
  serverTs: string
}

/** Server → dashboard event map. */
export interface ServerEvents {
  snapshot: (s: Snapshot) => void
  'device:update': (m: Motorcycle) => void
  telemetry: (t: Telemetry & { rxTs: string }) => void
  alert: (a: WireAlert) => void
}

export function createSocket(): Socket<ServerEvents> {
  return io(API_URL, {
    transports: ['websocket', 'polling'],
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  })
}

/** Normalize a wire alert into the UI shape (ISO string → Date). */
export function hydrateAlert(a: WireAlert): AlertItem {
  return { ...a, time: new Date(a.time) }
}
