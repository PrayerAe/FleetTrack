import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

/**
 * Fixes the "grey map / tiles not loading" issue that happens when a Leaflet map
 * mounts inside an animating (framer-motion) or initially-collapsed container.
 * Leaflet measures the container before it reaches its final size, so we force a
 * re-measure a few times across the view transition, plus on window resize.
 */
export function MapAutoResize() {
  const map = useMap()
  useEffect(() => {
    const fix = () => map.invalidateSize({ animate: false })
    const timers = [0, 150, 350, 700].map((d) => window.setTimeout(fix, d))
    window.addEventListener('resize', fix)
    // also re-measure if the container itself changes size
    const ro = new ResizeObserver(fix)
    ro.observe(map.getContainer())
    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('resize', fix)
      ro.disconnect()
    }
  }, [map])
  return null
}
