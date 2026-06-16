export interface Basemap {
  id: string
  name: string
  url: string
  attribution: string
  subdomains?: string
  maxZoom?: number
}

/**
 * Beberapa sumber tile. Default = OpenStreetMap standar karena paling andal
 * (server CARTO kerap diblokir ISP/ad-blocker sehingga peta tampil kosong).
 */
export const BASEMAPS: Basemap[] = [
  {
    id: 'street',
    name: 'Jalan',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: 'abc',
    maxZoom: 19,
  },
  {
    id: 'dark',
    name: 'Gelap',
    url: 'https://{s}.basemap.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20,
  },
  {
    id: 'satellite',
    name: 'Satelit',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri World Imagery',
    maxZoom: 19,
  },
]

export const DEFAULT_BASEMAP = 'street'

export function getBasemap(id: string): Basemap {
  return BASEMAPS.find((b) => b.id === id) ?? BASEMAPS[0]
}
