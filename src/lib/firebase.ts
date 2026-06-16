import { getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getDatabase,
  onChildAdded,
  onChildChanged,
  onValue,
  ref,
  type Database,
} from 'firebase/database'

/** Public Firebase web config — safe to ship in the client bundle. */
function firebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }
}

/** RTDB path that devices write telemetry to (one child per device id). */
export const TELEMETRY_PATH = (import.meta.env.VITE_FIREBASE_TELEMETRY_PATH as string | undefined) ?? 'telemetry'

/** True once a Realtime Database URL is configured via env. */
export function firebaseConfigured(): boolean {
  return !!import.meta.env.VITE_FIREBASE_DATABASE_URL
}

let app: FirebaseApp | null = null
let db: Database | null = null
function getDb(): Database {
  if (!app) app = getApps()[0] ?? initializeApp(firebaseConfig())
  if (!db) db = getDatabase(app)
  return db
}

/**
 * Subscribe to live telemetry. `onPacket` fires once per device whenever its
 * record under `/telemetry/{id}` is added or changed; the device id is injected
 * from the key. `onConnected` tracks the RTDB connection state.
 */
export function subscribeTelemetry(
  onPacket: (raw: Record<string, unknown> & { id: string }) => void,
  onConnected: (connected: boolean) => void,
): () => void {
  const database = getDb()
  const tRef = ref(database, TELEMETRY_PATH)

  const handle = (snap: { key: string | null; val: () => unknown }) => {
    const v = snap.val()
    if (v && typeof v === 'object' && snap.key) onPacket({ id: snap.key, ...(v as Record<string, unknown>) })
  }

  const offAdded = onChildAdded(tRef, handle)
  const offChanged = onChildChanged(tRef, handle)
  const offConn = onValue(ref(database, '.info/connected'), (s) => onConnected(!!s.val()))

  return () => {
    offAdded()
    offChanged()
    offConn()
  }
}
