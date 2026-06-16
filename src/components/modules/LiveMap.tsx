import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Map as MapIcon, Search, Crosshair, Battery, Satellite, Layers, Tag as TagIcon, Maximize2, Minimize2, MapPin } from 'lucide-react'
import { MANADO_CENTER } from '../../data/fleet'
import { useSim } from '../../sim/SimContext'
import { STATUS_META, batteryColor } from '../../lib/ui'
import { BASEMAPS, DEFAULT_BASEMAP, getBasemap } from '../../lib/basemaps'
import { LiveBadge, SectionTitle, StatusBadge } from '../ui/primitives'
import { MapAutoResize } from '../ui/MapAutoResize'
import type { Motorcycle, Status } from '../../types'

const iconCache: Record<string, L.DivIcon> = {}
function vehicleIcon(status: Status, selected: boolean): L.DivIcon {
  const key = `${status}-${selected ? 's' : 'n'}`
  if (iconCache[key]) return iconCache[key]
  const hex = STATUS_META[status].hex
  const pulse = status === 'alert' ? `<span class="gps-dot" style="color:${hex};position:absolute;inset:0;border-radius:9999px"></span>` : ''
  const ring = selected ? `box-shadow:0 0 0 4px ${hex}55, 0 0 14px ${hex};` : `box-shadow:0 0 10px ${hex}aa;`
  const html = `<div style="position:relative;width:22px;height:22px;display:grid;place-items:center">
      ${pulse}
      <span style="width:15px;height:15px;border-radius:9999px;background:${hex};border:3px solid #fff;${ring}"></span>
    </div>`
  iconCache[key] = L.divIcon({ html, className: 'fleet-marker', iconSize: [22, 22], iconAnchor: [11, 11] })
  return iconCache[key]
}

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo(target, Math.max(map.getZoom(), 15), { duration: 0.8 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.[0], target?.[1]])
  return null
}

export function LiveMap() {
  const { fleet, trails, counts } = useSim()
  const [selected, setSelected] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Status | 'all'>('all')
  const [basemap, setBasemap] = useState<string>(DEFAULT_BASEMAP)
  const [showLabels, setShowLabels] = useState(true)
  const [expanded, setExpanded] = useState(false)

  // Close fullscreen map with Escape
  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded])

  const selectedUnit = fleet.find((m) => m.device_id === selected) ?? null
  const flyTarget = selectedUnit ? ([selectedUnit.lat, selectedUnit.lng] as [number, number]) : null
  const bm = getBasemap(basemap)

  const filtered = fleet.filter((m) => {
    const okF = filter === 'all' || m.status === filter
    const okQ = !query || m.device_id.toLowerCase().includes(query.toLowerCase()) || m.model.toLowerCase().includes(query.toLowerCase())
    return okF && okQ
  })

  return (
    <div>
      <SectionTitle
        icon={<MapIcon className="h-5 w-5" />}
        title="Live Map Tracking"
        subtitle="Posisi seluruh unit di OpenStreetMap · update real-time < 3 dtk"
        right={<LiveBadge />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* MAP */}
        <div
          className={clsx(
            'glass relative overflow-hidden p-0',
            expanded ? 'fixed inset-0 z-[1200] rounded-none' : 'lg:col-span-3',
          )}
        >
          <div className={clsx('w-full', expanded ? 'h-full' : 'h-[64vh] min-h-[460px]')}>
            <MapContainer center={MANADO_CENTER} zoom={13} scrollWheelZoom className="h-full w-full" zoomControl>
              <MapAutoResize />
              <TileLayer
                key={bm.id}
                attribution={bm.attribution}
                url={bm.url}
                subdomains={bm.subdomains ?? 'abc'}
                maxZoom={bm.maxZoom ?? 19}
              />

              {/* Citra satelit tidak punya label — tambahkan overlay nama jalan & tempat. */}
              {bm.id === 'satellite' && (
                <>
                  <TileLayer
                    key="sat-roads"
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
                    attribution="&copy; Esri — Streets"
                    maxZoom={19}
                  />
                  <TileLayer
                    key="sat-places"
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                    attribution="&copy; Esri — Places"
                    maxZoom={19}
                  />
                </>
              )}

              {fleet
                .filter((m) => (m.status === 'rented' || m.status === 'alert') && trails[m.device_id]?.length > 1)
                .map((m) => (
                  <Polyline
                    key={`t-${m.device_id}`}
                    positions={trails[m.device_id]}
                    pathOptions={{ color: STATUS_META[m.status].hex, weight: 3.5, opacity: 0.6 }}
                  />
                ))}

              {fleet.map((m) => (
                <Marker
                  key={m.device_id}
                  position={[m.lat, m.lng]}
                  icon={vehicleIcon(m.status, m.device_id === selected)}
                  eventHandlers={{ click: () => setSelected(m.device_id) }}
                >
                  {showLabels && (
                    <Tooltip permanent direction="top" offset={[0, -12]} className="vehicle-label">
                      <div>
                        <span style={{ color: STATUS_META[m.status].hex }}>●</span> {m.plat} · {m.spd.toFixed(0)} km/h
                      </div>
                      <div style={{ fontSize: '9px', fontWeight: 500, opacity: 0.85 }}>{m.street}</div>
                    </Tooltip>
                  )}
                  <Popup>
                    <PopupBody m={m} />
                  </Popup>
                </Marker>
              ))}

              <FlyTo target={flyTarget} />
            </MapContainer>
          </div>

          {/* legend overlay */}
          <div className="pointer-events-none absolute left-3 top-3 z-[500] flex flex-wrap gap-1.5">
            {(['rented', 'available', 'alert', 'maintenance'] as Status[]).map((s) => (
              <span key={s} className="pointer-events-auto chip border border-white/10 bg-ink-900/85 text-slate-200 backdrop-blur">
                <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />
                {STATUS_META[s].label} · {counts[s]}
              </span>
            ))}
          </div>

          {/* basemap switcher + label toggle + fullscreen */}
          <div className="absolute right-3 top-3 z-[500] flex flex-wrap items-center justify-end gap-2">
            <button
              onClick={() => setExpanded((v) => !v)}
              className={`chip border backdrop-blur transition ${expanded ? 'border-brand-cyan/40 bg-brand-cyan/20 text-cyan-200' : 'border-white/10 bg-ink-900/85 text-slate-300 hover:text-white'}`}
              title={expanded ? 'Kecilkan peta (Esc)' : 'Perbesar peta layar penuh'}
            >
              {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              {expanded ? 'Kecilkan' : 'Perbesar'}
            </button>
            <button
              onClick={() => setShowLabels((v) => !v)}
              className={`chip border backdrop-blur transition ${showLabels ? 'border-brand-violet/40 bg-brand-violet/20 text-violet-200' : 'border-white/10 bg-ink-900/85 text-slate-400'}`}
              title="Tampilkan/sembunyikan label kecepatan"
            >
              <TagIcon className="h-3.5 w-3.5" /> Label
            </button>
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-ink-900/85 p-1 backdrop-blur">
              <Layers className="ml-1 h-3.5 w-3.5 text-slate-400" />
              {BASEMAPS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBasemap(b.id)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                    basemap === b.id ? 'bg-gradient-to-r from-brand-violet to-brand-cyan text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* UNIT LIST */}
        <div className="glass flex max-h-[62vh] min-h-[420px] flex-col p-3 lg:col-span-1">
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari unit / model…"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-violet/50 focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
            />
          </div>
          <div className="mb-2 flex flex-wrap gap-1">
            {(['all', 'rented', 'available', 'alert', 'maintenance'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-2 py-1 text-[11px] font-semibold capitalize transition ${
                  filter === f ? 'bg-white/15 text-white ring-1 ring-white/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'Semua' : STATUS_META[f].label}
              </button>
            ))}
          </div>
          <div className="-mr-1 space-y-1.5 overflow-y-auto pr-1">
            {filtered.map((m) => (
              <button
                key={m.device_id}
                onClick={() => setSelected(m.device_id)}
                className={`w-full rounded-xl border p-2.5 text-left transition ${
                  selected === m.device_id
                    ? 'border-brand-violet/40 bg-brand-violet/10'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-white">{m.device_id}</span>
                  <StatusBadge status={m.status} />
                </div>
                <div className="mt-1 truncate text-[11px] text-slate-400">{m.model}</div>
                <div className="mt-1 flex items-center gap-1 truncate text-[11px] text-slate-500">
                  <MapPin className="h-3 w-3 shrink-0" /> {m.street} · {m.area}
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-300">
                  <span className="font-mono tabular-nums">{m.spd.toFixed(0)} km/h</span>
                  <span className="flex items-center gap-1" style={{ color: batteryColor(m.bat) }} title="Baterai perangkat tracker">
                    <Battery className="h-3 w-3" /> {m.bat.toFixed(0)}%
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Satellite className="h-3 w-3" /> {m.sat}
                  </span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <div className="py-8 text-center text-sm text-slate-500">Tidak ada unit cocok.</div>}
          </div>
          {selectedUnit && (
            <button
              onClick={() => setSelected(null)}
              className="mt-2 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
            >
              <Crosshair className="h-3.5 w-3.5" /> Reset fokus
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function PopupBody({ m }: { m: Motorcycle }) {
  return (
    <div className="space-y-1.5 text-slate-200">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-sm font-bold text-white">{m.device_id}</span>
        <StatusBadge status={m.status} />
      </div>
      <div className="text-xs text-slate-300">{m.model} · {m.plat}</div>
      <div className="flex items-center gap-1 text-[11px] text-slate-400">
        <MapPin className="h-3 w-3 shrink-0" /> {m.street} · {m.area}
      </div>
      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
        <PopupStat label="km/h" value={m.spd.toFixed(0)} />
        <PopupStat label="baterai" value={`${m.bat.toFixed(0)}%`} />
        <PopupStat label="satelit" value={`${m.sat}`} />
      </div>
      {m.renter && <div className="text-[11px] text-slate-400">Penyewa: {m.renter}</div>}
      <div className="font-mono text-[10px] text-slate-500">{m.lat.toFixed(5)}, {m.lng.toFixed(5)}</div>
    </div>
  )
}

function PopupStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 py-1">
      <div className="font-mono text-sm font-bold text-white">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-slate-400">{label}</div>
    </div>
  )
}
