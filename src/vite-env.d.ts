/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Firebase Realtime Database URL, e.g. https://xxx-default-rtdb.firebaseio.com */
  readonly VITE_FIREBASE_DATABASE_URL?: string
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
  /** RTDB path devices write to (default "telemetry"). */
  readonly VITE_FIREBASE_TELEMETRY_PATH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
