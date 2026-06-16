/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the FleetTrack cloud server (Socket.IO + REST). */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
