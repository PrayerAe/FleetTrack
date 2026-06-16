// Geospatial helpers — server-side mirror of the dashboard's src/sim/geo.ts.
// Ray-Casting geofence + Haversine distance + initial bearing (§III-F of the spec).

/**
 * Ray-Casting (even–odd) point-in-polygon test.
 * @param {[number, number]} point   [lng, lat]
 * @param {number[][]} polygon       array of [lng, lat] vertices
 */
export function pointInPolygon(point, polygon) {
  const [x, y] = point
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [ax, ay] = polygon[i]
    const [bx, by] = polygon[j]
    if ((ay > y) !== (by > y)) {
      const xCross = ((bx - ax) * (y - ay)) / (by - ay) + ax
      if (x < xCross) inside = !inside
    }
  }
  return inside
}

const R = 6371000 // earth radius (m)
const toRad = (d) => (d * Math.PI) / 180
const toDeg = (r) => (r * 180) / Math.PI

/** Haversine distance in meters between two [lat, lng] points. */
export function haversine(a, b) {
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Initial bearing (degrees, 0 = N) from a to b. */
export function bearing(a, b) {
  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])
  const dLng = toRad(b[1] - a[1])
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
