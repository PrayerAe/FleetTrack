// Operational geofences (Kota Manado). Polygons are [lng, lat] rings (GeoJSON).
// Mirrors src/data/fleet.ts so the dashboard and server agree on zone geometry.

export const MANADO_CENTER = [1.4748, 124.8421] // [lat, lng]

export const ZONE_POLYGON = [
  [124.825, 1.518],
  [124.865, 1.521],
  [124.888, 1.496],
  [124.87, 1.46],
  [124.825, 1.438],
  [124.805, 1.452],
  [124.806, 1.49],
  [124.825, 1.518],
]

export const GEOFENCES = [
  { id: 1, name: 'Zona Operasional Manado', polygon: ZONE_POLYGON, active: true },
  {
    id: 2,
    name: 'Zona Bandara Sam Ratulangi',
    polygon: [
      [124.91, 1.56],
      [124.94, 1.562],
      [124.95, 1.54],
      [124.93, 1.528],
      [124.908, 1.54],
      [124.91, 1.56],
    ],
    active: false,
  },
]

/** The active zone telemetry is tested against (falls back to the first). */
export function activeZone() {
  return GEOFENCES.find((g) => g.active) ?? GEOFENCES[0]
}
