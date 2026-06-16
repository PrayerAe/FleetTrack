import type { LatLng } from '../types'

/**
 * Ray Casting point-in-polygon test (§5.3 of the spec).
 * @param point [lng, lat]
 * @param polygon array of [lng, lat] vertices
 */
export function pointInPolygon(point: [number, number], polygon: number[][]): boolean {
  const [x, y] = point
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [ax, ay] = polygon[i]
    const [bx, by] = polygon[j]
    if (ay > y !== by > y) {
      const xCross = ((bx - ax) * (y - ay)) / (by - ay) + ax
      if (x < xCross) inside = !inside
    }
  }
  return inside
}

const R = 6371000 // earth radius (m)
const toRad = (d: number) => (d * Math.PI) / 180
const toDeg = (r: number) => (r * 180) / Math.PI

/** Haversine distance in meters between two [lat,lng] points. */
export function haversine(a: LatLng, b: LatLng): number {
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Initial bearing (degrees, 0=N) from a to b. */
export function bearing(a: LatLng, b: LatLng): number {
  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])
  const dLng = toRad(b[1] - a[1])
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

/** Linear interpolation between two [lat,lng] points (t in 0..1). */
export function lerpLatLng(a: LatLng, b: LatLng, t: number): LatLng {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}

/** Total length (m) of a polyline path. */
export function pathLength(path: LatLng[]): number {
  let total = 0
  for (let i = 1; i < path.length; i++) total += haversine(path[i - 1], path[i])
  return total
}

/** Polygon centroid as [lat,lng] from a [lng,lat] ring. */
export function polygonCentroid(polygon: number[][]): LatLng {
  let lat = 0
  let lng = 0
  for (const [x, y] of polygon) {
    lng += x
    lat += y
  }
  return [lat / polygon.length, lng / polygon.length]
}

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
