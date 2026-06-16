import { useMemo, useState } from 'react'
import { CircleMarker, MapContainer, Polygon, TileLayer, Tooltip, useMapEvents } from 'react-leaflet'
import { ShieldCheck, MousePointerClick, Check, X } from 'lucide-react'
import { GEOFENCES, MANADO_CENTER } from '../../data/fleet'
import { useSim } from '../../sim/SimContext'
import { pointInPolygon } from '../../sim/geo'
import { STATUS_META } from '../../lib/ui'
import { Card, SectionTitle } from '../ui/primitives'
import { MapAutoResize } from '../ui/MapAutoResize'

function TestPointLayer({ onPick }: { onPick: (p: [number, number]) => void }) {
  useMapEvents({ click: (e) => onPick([e.latlng.lat, e.latlng.lng]) })
  return null
}

export function GeofenceManager() {
  const { fleet } = useSim()
  const [activeZones, setActiveZones] = useState<Record<number, boolean>>({ 1: true, 2: false })
  const [testPoint, setTestPoint] = useState<[number, number] | null>(null)

  const zone = GEOFENCES[0]
  const inside = useMemo(() => fleet.filter((m) => pointInPolygon([m.lng, m.lat], zone.polygon)), [fleet, zone])
  const violations = fleet.filter((m) => !pointInPolygon([m.lng, m.lat], zone.polygon) && (m.status === 'rented' || m.status === 'alert'))

  const testInside = testPoint ? pointInPolygon([testPoint[1], testPoint[0]], zone.polygon) : null
  const polyLatLng = zone.polygon.map(([lng, lat]) => [lat, lng] as [number, number])

  return (
    <div>
      <SectionTitle
        icon={<ShieldCheck className="h-5 w-5" />}
        title="Geofence Manager"
        subtitle="Zona operasional · point-in-polygon Ray Casting dijalankan server tiap paket telemetri"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* MAP */}
        <div className="glass overflow-hidden p-0 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="text-sm font-semibold text-slate-200">Peta zona & uji titik</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <MousePointerClick className="h-3.5 w-3.5" /> Klik peta untuk uji Ray Casting
            </span>
          </div>
          <div className="h-[56vh] min-h-[400px]">
            <MapContainer center={MANADO_CENTER} zoom={12} scrollWheelZoom className="h-full w-full">
              <MapAutoResize />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" subdomains="abc" maxZoom={19} attribution="&copy; OpenStreetMap contributors" />
              {activeZones[1] && (
                <Polygon positions={polyLatLng} pathOptions={{ color: '#7c3aed', weight: 2, fillColor: '#7c3aed', fillOpacity: 0.08 }} />
              )}
              {activeZones[2] && (
                <Polygon
                  positions={GEOFENCES[1].polygon.map(([lng, lat]) => [lat, lng] as [number, number])}
                  pathOptions={{ color: '#0ea5e9', weight: 2, fillColor: '#0ea5e9', fillOpacity: 0.08 }}
                />
              )}
              {/* vertices */}
              {polyLatLng.slice(0, -1).map((p, i) => (
                <CircleMarker key={i} center={p} radius={5} pathOptions={{ color: '#a78bfa', fillColor: '#7c3aed', fillOpacity: 1, weight: 2 }}>
                  <Tooltip>{`V${i + 1}: ${p[0].toFixed(4)}, ${p[1].toFixed(4)}`}</Tooltip>
                </CircleMarker>
              ))}
              {/* units */}
              {fleet.map((m) => {
                const isIn = pointInPolygon([m.lng, m.lat], zone.polygon)
                return (
                  <CircleMarker
                    key={m.device_id}
                    center={[m.lat, m.lng]}
                    radius={6}
                    pathOptions={{ color: isIn ? STATUS_META[m.status].hex : '#f43f5e', fillColor: isIn ? STATUS_META[m.status].hex : '#f43f5e', fillOpacity: 0.85, weight: 2 }}
                  >
                    <Tooltip>{`${m.device_id} — ${isIn ? 'di dalam zona' : 'DI LUAR ZONA'}`}</Tooltip>
                  </CircleMarker>
                )
              })}
              {testPoint && (
                <CircleMarker center={testPoint} radius={8} pathOptions={{ color: testInside ? '#22c55e' : '#f43f5e', fillColor: testInside ? '#22c55e' : '#f43f5e', fillOpacity: 0.9, weight: 3 }}>
                  <Tooltip permanent>{testInside ? '✓ di dalam' : '✗ di luar'}</Tooltip>
                </CircleMarker>
              )}
              <TestPointLayer onPick={setTestPoint} />
            </MapContainer>
          </div>
        </div>

        {/* SIDE */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <div className="grid grid-cols-3 gap-2 text-center">
              <Mini label="Unit di dalam" value={`${inside.length}/${fleet.length}`} tone="text-emerald-300" />
              <Mini label="Pelanggaran" value={violations.length} tone="text-rose-300" />
              <Mini label="Verteks" value={zone.polygon.length - 1} tone="text-violet-300" />
            </div>
          </Card>

          {testPoint && (
            <Card>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-200">Hasil uji titik</span>
                <button onClick={() => setTestPoint(null)} className="rounded-md p-1 text-slate-400 hover:bg-white/10">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className={`mt-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${testInside ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
                {testInside ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                {testInside ? 'Titik DI DALAM zona operasional' : 'Titik DI LUAR zona operasional'}
              </div>
              <div className="mt-2 font-mono text-[11px] text-slate-400">
                lat {testPoint[0].toFixed(5)} · lng {testPoint[1].toFixed(5)}
              </div>
            </Card>
          )}

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-200">Daftar Zona</h3>
            <div className="space-y-2">
              {GEOFENCES.map((g) => (
                <div key={g.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{g.name}</div>
                    <div className="text-[11px] text-slate-400">{g.polygon.length - 1} verteks · Ray Casting</div>
                  </div>
                  <button
                    onClick={() => setActiveZones((s) => ({ ...s, [g.id]: !s[g.id] }))}
                    className={`relative h-6 w-11 rounded-full transition ${activeZones[g.id] ? 'bg-emerald-500/80' : 'bg-white/10'}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${activeZones[g.id] ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-200">Algoritma Ray Casting (point-in-polygon)</h3>
        <pre className="overflow-x-auto rounded-xl border border-white/10 bg-ink-950/80 p-4 font-mono text-[12.5px] leading-relaxed text-slate-300">
{`fungsi titikDalamPoligon(titik, poligon):
    persilangan = 0
    untuk setiap sisi (a, b) pada poligon:
        jika (a.y > titik.y) != (b.y > titik.y):
            x_potong = (b.x - a.x) * (titik.y - a.y) / (b.y - a.y) + a.x
            jika titik.x < x_potong:
                persilangan += 1
    kembalikan (persilangan ganjil)   # ganjil = di dalam zona`}
        </pre>
      </Card>
    </div>
  )
}

function Mini({ label, value, tone }: { label: string; value: React.ReactNode; tone: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] py-3">
      <div className={`text-2xl font-extrabold tabular-nums ${tone}`}>{value}</div>
      <div className="mt-0.5 text-[11px] text-slate-400">{label}</div>
    </div>
  )
}
