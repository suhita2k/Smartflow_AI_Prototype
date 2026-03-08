import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TRAFFIC_NODES, CV_CAMERAS, ALERTS } from '../data/mockData';
import { TrafficNode, CVCamera } from '../types';

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Custom SVG Icons ──────────────────────────────────────────────────────────
function makeJunctionIcon(status: string, vehicleCount: number) {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    normal: { bg: '#22c55e', border: '#16a34a', text: '#fff' },
    congested: { bg: '#f59e0b', border: '#d97706', text: '#fff' },
    critical: { bg: '#ef4444', border: '#dc2626', text: '#fff' },
    emergency: { bg: '#a855f7', border: '#9333ea', text: '#fff' },
  };
  const c = colors[status] || colors.normal;
  const pulse = status === 'emergency' || status === 'critical';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="52" height="62" viewBox="0 0 52 62">
      ${pulse ? `<circle cx="26" cy="26" r="24" fill="${c.bg}" opacity="0.25"><animate attributeName="r" values="22;28;22" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite"/></circle>` : ''}
      <circle cx="26" cy="26" r="20" fill="${c.bg}" stroke="${c.border}" stroke-width="2.5"/>
      <circle cx="26" cy="26" r="14" fill="rgba(0,0,0,0.2)"/>
      <text x="26" y="22" text-anchor="middle" fill="${c.text}" font-size="8" font-weight="bold" font-family="monospace">TF</text>
      <text x="26" y="33" text-anchor="middle" fill="${c.text}" font-size="7" font-family="monospace">${vehicleCount}</text>
      <polygon points="26,50 18,40 34,40" fill="${c.bg}" stroke="${c.border}" stroke-width="1.5"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [52, 62],
    iconAnchor: [26, 56],
    popupAnchor: [0, -56],
  });
}

function makeCameraIcon(status: string) {
  const colors: Record<string, string> = {
    online: '#22d3ee', alert: '#f87171', maintenance: '#fbbf24', offline: '#64748b',
  };
  const col = colors[status] || '#64748b';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="15" fill="#0f172a" stroke="${col}" stroke-width="2"/>
      <rect x="8" y="12" width="14" height="10" rx="2" fill="${col}" opacity="0.9"/>
      <polygon points="22,13 30,10 30,24 22,21" fill="${col}" opacity="0.7"/>
      <circle cx="18" cy="17" r="3" fill="#0f172a" opacity="0.6"/>
      ${status === 'alert' ? `<circle cx="28" cy="8" r="5" fill="#ef4444"><animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite"/></circle>` : ''}
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function makeEmergencyIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="58" viewBox="0 0 48 58">
      <circle cx="24" cy="24" r="22" fill="#ef4444" opacity="0.2"><animate attributeName="r" values="20;28;20" dur="1s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.25;0;0.25" dur="1s" repeatCount="indefinite"/></circle>
      <circle cx="24" cy="24" r="18" fill="#ef4444" stroke="#dc2626" stroke-width="2.5"/>
      <text x="24" y="20" text-anchor="middle" fill="white" font-size="12">🚑</text>
      <text x="24" y="33" text-anchor="middle" fill="white" font-size="7" font-weight="bold" font-family="monospace">EMRG</text>
      <polygon points="24,48 16,38 32,38" fill="#ef4444" stroke="#dc2626" stroke-width="1.5"/>
    </svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [48, 58], iconAnchor: [24, 52], popupAnchor: [0, -52] });
}

// ── Map auto-fit ──────────────────────────────────────────────────────────────
function MapAutoFit({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, bounds]);
  return null;
}

// ── Animated emergency vehicle marker ─────────────────────────────────────────
function EmergencyVehicleMarker({ progress }: { progress: number }) {
  const route: [number, number][] = [
    [40.7128, -74.018],
    [40.7178, -74.008],
    [40.7128, -74.006],
  ];
  const idx = Math.min(Math.floor(progress * (route.length - 1)), route.length - 2);
  const t = (progress * (route.length - 1)) - idx;
  const lat = route[idx][0] + (route[idx + 1][0] - route[idx][0]) * t;
  const lng = route[idx][1] + (route[idx + 1][1] - route[idx][1]) * t;
  return <Marker position={[lat, lng]} icon={makeEmergencyIcon()} />;
}

// ── Layer toggle button ────────────────────────────────────────────────────────
function LayerBtn({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition ${active
        ? `bg-${color}-500/20 text-${color}-300 border-${color}-500/40`
        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-600'}`}
    >
      <span className={`w-2 h-2 rounded-full ${active ? `bg-${color}-400` : 'bg-slate-600'}`} />
      {label}
    </button>
  );
}

// ── Status legend item ────────────────────────────────────────────────────────
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
      {label}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function LiveMap() {
  const [nodes, setNodes] = useState<TrafficNode[]>(TRAFFIC_NODES);
  const [cameras] = useState<CVCamera[]>(CV_CAMERAS);
  const [selectedNode, setSelectedNode] = useState<TrafficNode | null>(null);
  const [selectedCam, setSelectedCam] = useState<CVCamera | null>(null);
  const [emergencyProgress, setEmergencyProgress] = useState(0);
  const [showJunctions, setShowJunctions] = useState(true);
  const [showCameras, setShowCameras] = useState(true);
  const [showRadius, setShowRadius] = useState(true);
  const [showCorridors, setShowCorridors] = useState(true);
  const [showEmergency, setShowEmergency] = useState(true);
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'streets'>('dark');

  // Live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prev =>
        prev.map(n => ({
          ...n,
          vehicleCount: Math.max(0, n.vehicleCount + Math.floor(Math.random() * 11) - 5),
          avgSpeed: Math.max(0, n.avgSpeed + (Math.random() * 4 - 2)),
        }))
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Animate emergency vehicle
  useEffect(() => {
    const interval = setInterval(() => {
      setEmergencyProgress(p => (p >= 1 ? 0 : p + 0.008));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Tile URLs
  const tiles: Record<string, { url: string; attr: string }> = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attr: '© OpenStreetMap contributors © CARTO',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attr: '© Esri, Maxar, Earthstar Geographics',
    },
    streets: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attr: '© OpenStreetMap contributors © CARTO',
    },
  };

  const statusColors: Record<string, string> = {
    normal: '#22c55e', congested: '#f59e0b', critical: '#ef4444', emergency: '#a855f7',
  };

  const allLatLngs = nodes.map(n => [n.lat, n.lng] as [number, number]);
  const bounds = L.latLngBounds(allLatLngs).pad(0.05);

  // Emergency corridor route
  const corridorRoute: [number, number][] = [
    [40.7128, -74.018],
    [40.7178, -74.008],
    [40.7128, -74.006],
  ];

  const stats = {
    normal: nodes.filter(n => n.status === 'normal').length,
    congested: nodes.filter(n => n.status === 'congested').length,
    critical: nodes.filter(n => n.status === 'critical').length,
    emergency: nodes.filter(n => n.status === 'emergency').length,
    totalVehicles: nodes.reduce((s, n) => s + n.vehicleCount, 0),
    avgSpeed: Math.round(nodes.reduce((s, n) => s + n.avgSpeed, 0) / nodes.length),
    camerasOnline: cameras.filter(c => c.status === 'online' || c.status === 'alert').length,
  };

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 3.5rem)' }}>
      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 bg-slate-900/95 border-b border-slate-800 px-6 py-3 flex items-center gap-4 flex-wrap backdrop-blur">
        <div className="flex items-center gap-2 mr-2">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Layers:</span>
        </div>
        <LayerBtn label="Junctions" active={showJunctions} onClick={() => setShowJunctions(v => !v)} color="cyan" />
        <LayerBtn label="CV Cameras" active={showCameras} onClick={() => setShowCameras(v => !v)} color="violet" />
        <LayerBtn label="Coverage Radius" active={showRadius} onClick={() => setShowRadius(v => !v)} color="blue" />
        <LayerBtn label="Emergency Corridor" active={showCorridors} onClick={() => setShowCorridors(v => !v)} color="red" />
        <LayerBtn label="Live Vehicle" active={showEmergency} onClick={() => setShowEmergency(v => !v)} color="orange" />

        <div className="ml-auto flex items-center gap-2">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Style:</span>
          {(['dark', 'satellite', 'streets'] as const).map(s => (
            <button
              key={s}
              onClick={() => setMapStyle(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition capitalize ${mapStyle === s
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content: map + side panel ── */}
      <div className="flex-1 flex min-h-0">
        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[40.7128, -74.008]}
            zoom={14}
            style={{ height: '100%', width: '100%', background: '#0f172a' }}
            zoomControl={false}
          >
            <TileLayer url={tiles[mapStyle].url} attribution={tiles[mapStyle].attr} />
            <MapAutoFit bounds={bounds} />

            {/* Coverage radius circles */}
            {showRadius && nodes.map(node => (
              <Circle
                key={`r-${node.id}`}
                center={[node.lat, node.lng]}
                radius={300}
                pathOptions={{
                  color: statusColors[node.status],
                  fillColor: statusColors[node.status],
                  fillOpacity: 0.07,
                  weight: 1,
                  dashArray: '4 4',
                }}
              />
            ))}

            {/* Emergency corridor polyline */}
            {showCorridors && (
              <>
                <Polyline
                  positions={corridorRoute}
                  pathOptions={{ color: '#ef4444', weight: 5, opacity: 0.25, dashArray: undefined }}
                />
                <Polyline
                  positions={corridorRoute}
                  pathOptions={{ color: '#f87171', weight: 2.5, opacity: 0.9, dashArray: '10 6' }}
                />
              </>
            )}

            {/* Junction markers */}
            {showJunctions && nodes.map(node => (
              <Marker
                key={node.id}
                position={[node.lat, node.lng]}
                icon={makeJunctionIcon(node.status, node.vehicleCount)}
                eventHandlers={{ click: () => { setSelectedNode(node); setSelectedCam(null); } }}
              >
                <Popup className="smartflow-popup" closeButton={false}>
                  <div className="bg-slate-900 text-white rounded-xl p-4 min-w-[220px] border border-slate-700 shadow-xl">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-sm">{node.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        node.status === 'normal' ? 'bg-emerald-500/20 text-emerald-300' :
                        node.status === 'congested' ? 'bg-amber-500/20 text-amber-300' :
                        node.status === 'critical' ? 'bg-red-500/20 text-red-300' :
                        'bg-purple-500/20 text-purple-300'}`}>
                        {node.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mb-3">{node.location}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-800 rounded-lg p-2 text-center">
                        <p className="text-cyan-400 font-bold text-base">{node.vehicleCount}</p>
                        <p className="text-slate-500">Vehicles</p>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-2 text-center">
                        <p className="text-emerald-400 font-bold text-base">{Math.round(node.avgSpeed)}</p>
                        <p className="text-slate-500">km/h avg</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 text-xs text-slate-500">
                      <span>🟢 {node.greenTime}s</span>
                      <span>🔴 {node.redTime}s</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Camera markers */}
            {showCameras && cameras.map(cam => (
              <Marker
                key={cam.id}
                position={[cam.lat, cam.lng]}
                icon={makeCameraIcon(cam.status)}
                eventHandlers={{ click: () => { setSelectedCam(cam); setSelectedNode(null); } }}
              >
                <Popup className="smartflow-popup" closeButton={false}>
                  <div className="bg-slate-900 text-white rounded-xl p-4 min-w-[200px] border border-slate-700 shadow-xl">
                    <h3 className="font-bold text-sm mb-1">{cam.name}</h3>
                    <p className="text-slate-400 text-xs mb-3">{cam.location}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-800 rounded-lg p-2 text-center">
                        <p className="text-cyan-400 font-bold text-base">{cam.vehicleCount}</p>
                        <p className="text-slate-500">Vehicles</p>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-2 text-center">
                        <p className="text-violet-400 font-bold text-base">{cam.pedestrianCount}</p>
                        <p className="text-slate-500">Pedestrians</p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs">
                      <div className="flex justify-between mb-1 text-slate-400">
                        <span>Congestion</span>
                        <span className={cam.congestionLevel > 70 ? 'text-red-400' : 'text-amber-400'}>{Math.round(cam.congestionLevel)}%</span>
                      </div>
                      <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${cam.congestionLevel > 70 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${cam.congestionLevel}%` }} />
                      </div>
                    </div>
                    {cam.incidentDetected && (
                      <div className="mt-2 text-xs bg-red-500/15 text-red-300 px-2 py-1 rounded-lg">⚠ Incident Detected</div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Animated emergency vehicle */}
            {showEmergency && <EmergencyVehicleMarker progress={emergencyProgress} />}
          </MapContainer>

          {/* Map overlay: legend */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl p-3 space-y-2">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Legend</p>
            <LegendItem color="#22c55e" label="Normal flow" />
            <LegendItem color="#f59e0b" label="Congested" />
            <LegendItem color="#ef4444" label="Critical" />
            <LegendItem color="#a855f7" label="Emergency" />
            <div className="border-t border-slate-700 pt-2 mt-2 space-y-2">
              <LegendItem color="#22d3ee" label="CV Camera (online)" />
              <LegendItem color="#f87171" label="CV Camera (alert)" />
              <LegendItem color="#fbbf24" label="Camera (maint.)" />
              <LegendItem color="#64748b" label="Camera (offline)" />
            </div>
            <div className="border-t border-slate-700 pt-2 mt-2 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-6 h-0.5 bg-red-400 inline-block" style={{ borderTop: '2px dashed #f87171' }} />
                Emergency corridor
              </div>
            </div>
          </div>

          {/* Live indicator */}
          <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-slate-300 font-semibold">LIVE</span>
          </div>
        </div>

        {/* ── Side Panel ── */}
        <div className="w-80 flex-shrink-0 bg-slate-900 border-l border-slate-800 overflow-y-auto flex flex-col">
          {/* Stats header */}
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Network Overview
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Total Vehicles', value: stats.totalVehicles.toLocaleString(), color: 'text-cyan-400' },
                { label: 'Avg Speed', value: `${stats.avgSpeed} km/h`, color: 'text-emerald-400' },
                { label: 'CV Cameras', value: `${stats.camerasOnline}/${cameras.length}`, color: 'text-violet-400' },
                { label: 'Junctions', value: nodes.length, color: 'text-amber-400' },
              ].map(s => (
                <div key={s.label} className="bg-slate-800/60 rounded-xl p-3 text-center">
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-slate-500 text-xs">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Status breakdown */}
            <div className="mt-3 space-y-1.5">
              {[
                { label: 'Normal', count: stats.normal, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
                { label: 'Congested', count: stats.congested, color: 'bg-amber-500', textColor: 'text-amber-400' },
                { label: 'Critical', count: stats.critical, color: 'bg-red-500', textColor: 'text-red-400' },
                { label: 'Emergency', count: stats.emergency, color: 'bg-purple-500', textColor: 'text-purple-400' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 text-xs">
                  <span className={`w-2 h-2 rounded-full ${s.color} flex-shrink-0`} />
                  <span className="text-slate-400 flex-1">{s.label}</span>
                  <span className={`font-bold ${s.textColor}`}>{s.count}</span>
                  <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full`} style={{ width: `${(s.count / nodes.length) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected node detail */}
          {selectedNode && (
            <div className="p-4 border-b border-slate-800 bg-slate-800/30">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-white font-bold text-sm">{selectedNode.name}</h3>
                <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-slate-400 text-xs mb-3">{selectedNode.location}</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: 'Vehicles', value: selectedNode.vehicleCount, color: 'text-cyan-400' },
                  { label: 'Avg Speed', value: `${Math.round(selectedNode.avgSpeed)} km/h`, color: 'text-emerald-400' },
                  { label: 'Green Time', value: `${selectedNode.greenTime}s`, color: 'text-emerald-300' },
                  { label: 'Red Time', value: `${selectedNode.redTime}s`, color: 'text-red-400' },
                ].map(m => (
                  <div key={m.label} className="bg-slate-800 rounded-lg p-2 text-center">
                    <p className={`font-bold ${m.color} text-sm`}>{m.value}</p>
                    <p className="text-slate-500 text-xs">{m.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                  selectedNode.status === 'normal' ? 'bg-emerald-500/15 text-emerald-300' :
                  selectedNode.status === 'congested' ? 'bg-amber-500/15 text-amber-300' :
                  selectedNode.status === 'critical' ? 'bg-red-500/15 text-red-300' :
                  'bg-purple-500/15 text-purple-300'}`}>
                  {selectedNode.status.toUpperCase()}
                </span>
                <span className="text-xs px-2 py-1 rounded-lg bg-slate-800 text-slate-400">
                  {selectedNode.lat.toFixed(4)}, {selectedNode.lng.toFixed(4)}
                </span>
              </div>
            </div>
          )}

          {/* Selected camera detail */}
          {selectedCam && (
            <div className="p-4 border-b border-slate-800 bg-violet-900/10">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-white font-bold text-sm">{selectedCam.name}</h3>
                <button onClick={() => setSelectedCam(null)} className="text-slate-500 hover:text-white transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-slate-400 text-xs mb-3">{selectedCam.location}</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: 'Vehicles', value: selectedCam.vehicleCount, color: 'text-cyan-400' },
                  { label: 'Pedestrians', value: selectedCam.pedestrianCount, color: 'text-violet-400' },
                  { label: 'Detections', value: selectedCam.detections.length, color: 'text-amber-400' },
                  { label: 'Congestion', value: `${Math.round(selectedCam.congestionLevel)}%`, color: selectedCam.congestionLevel > 70 ? 'text-red-400' : 'text-amber-400' },
                ].map(m => (
                  <div key={m.label} className="bg-slate-800 rounded-lg p-2 text-center">
                    <p className={`font-bold ${m.color} text-sm`}>{m.value}</p>
                    <p className="text-slate-500 text-xs">{m.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                  selectedCam.status === 'online' ? 'bg-emerald-500/15 text-emerald-300' :
                  selectedCam.status === 'alert' ? 'bg-red-500/15 text-red-300' :
                  selectedCam.status === 'maintenance' ? 'bg-amber-500/15 text-amber-300' :
                  'bg-slate-700 text-slate-400'}`}>
                  {selectedCam.status.toUpperCase()}
                </span>
                <span className="text-xs px-2 py-1 rounded-lg bg-slate-800 text-slate-400">{selectedCam.resolution} · {selectedCam.fps}fps</span>
                {selectedCam.incidentDetected && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-red-500/15 text-red-300 animate-pulse">⚠ INCIDENT</span>
                )}
              </div>
            </div>
          )}

          {/* Active Alerts */}
          <div className="p-4 flex-1">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Active Alerts
            </h3>
            <div className="space-y-2">
              {ALERTS.filter(a => !a.resolved).map(alert => (
                <div key={alert.id} className={`rounded-xl p-3 border text-xs ${
                  alert.type === 'emergency' ? 'bg-red-500/10 border-red-500/25 text-red-300' :
                  alert.type === 'congestion' ? 'bg-amber-500/10 border-amber-500/25 text-amber-300' :
                  alert.type === 'incident' ? 'bg-orange-500/10 border-orange-500/25 text-orange-300' :
                  'bg-blue-500/10 border-blue-500/25 text-blue-300'}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-semibold">
                      {alert.type === 'emergency' ? '🚨' : alert.type === 'congestion' ? '🚦' : alert.type === 'incident' ? '⚠️' : 'ℹ️'} {alert.location}
                    </span>
                    <span className="text-slate-500 flex-shrink-0">{alert.timestamp}</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">{alert.message}</p>
                </div>
              ))}
            </div>

            {/* Emergency corridor info */}
            <div className="mt-4 bg-red-500/10 border border-red-500/25 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-red-300 text-xs font-bold">EMERGENCY CORRIDOR ACTIVE</span>
              </div>
              <p className="text-slate-400 text-xs">🚑 Ambulance en route</p>
              <p className="text-slate-400 text-xs mt-0.5">West Terminal → City Square → Central Junction</p>
              <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full transition-all duration-150" style={{ width: `${emergencyProgress * 100}%` }} />
              </div>
              <p className="text-slate-500 text-xs mt-1">Progress: {Math.round(emergencyProgress * 100)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaflet popup styling */}
      <style>{`
        .leaflet-popup-content-wrapper { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-popup-tip-container { display: none; }
        .leaflet-container { background: #0f172a; }
      `}</style>
    </div>
  );
}
