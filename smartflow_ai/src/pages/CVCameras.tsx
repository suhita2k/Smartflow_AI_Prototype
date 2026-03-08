import { useState, useEffect, useRef, useCallback } from 'react';
import { CV_CAMERAS } from '../data/mockData';
import { CVCamera, Detection } from '../types';

// ── Simulated camera feed canvas ──────────────────────────────────────────────
function CameraFeed({ camera, active }: { camera: CVCamera; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const frameRef = useRef(0);
  const detectionsRef = useRef<Detection[]>(camera.detections);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    frameRef.current++;

    if (camera.status === 'offline') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('● NO SIGNAL', W / 2, H / 2 - 10);
      ctx.font = '11px monospace';
      ctx.fillStyle = '#475569';
      ctx.fillText('Camera Offline', W / 2, H / 2 + 12);
      return;
    }
    if (camera.status === 'maintenance') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      // diagonal stripes
      ctx.fillStyle = '#1e293b';
      for (let i = -H; i < W + H; i += 20) {
        ctx.fillRect(i, 0, 10, H);
      }
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⚙ MAINTENANCE', W / 2, H / 2 - 8);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('Scheduled downtime', W / 2, H / 2 + 10);
      return;
    }

    // ── Road scene background ──
    const brightness = camera.streamBrightness;
    const bgL = Math.floor(brightness * 0.18);
    ctx.fillStyle = `rgb(${bgL}, ${bgL + 3}, ${bgL + 8})`;
    ctx.fillRect(0, 0, W, H);

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.45);
    sky.addColorStop(0, `rgba(${bgL + 20},${bgL + 30},${bgL + 60},1)`);
    sky.addColorStop(1, `rgba(${bgL + 8},${bgL + 12},${bgL + 20},1)`);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H * 0.45);

    // Road
    ctx.fillStyle = `rgb(${bgL + 15},${bgL + 15},${bgL + 17})`;
    ctx.fillRect(0, H * 0.45, W, H);

    // Road lines (animated)
    ctx.strokeStyle = `rgba(255,220,50,${0.5 + 0.2 * Math.sin(frameRef.current * 0.05)})`;
    ctx.setLineDash([20, 18]);
    ctx.lineDashOffset = -(frameRef.current * 1.5) % 38;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W / 2, H * 0.45); ctx.lineTo(W / 2, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W / 3, H * 0.45); ctx.lineTo(W / 3, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo((W * 2) / 3, H * 0.45); ctx.lineTo((W * 2) / 3, H); ctx.stroke();
    ctx.setLineDash([]);

    // Sidewalk
    ctx.fillStyle = `rgb(${bgL + 25},${bgL + 25},${bgL + 28})`;
    ctx.fillRect(0, H * 0.43, W, 8);

    // ── Animated vehicles ──
    const t = frameRef.current * 0.8;
    const cars = [
      { x: (t * 1.2) % (W + 80) - 40, y: H * 0.58, w: 56, h: 28, color: '#3b82f6', speed: 1.2 },
      { x: ((t * 0.9 + 100) % (W + 80)) - 40, y: H * 0.7, w: 64, h: 32, color: '#ef4444', speed: 0.9 },
      { x: W - ((t * 1.4 + 50) % (W + 80)), y: H * 0.82, w: 52, h: 26, color: '#22c55e', speed: 1.4 },
      { x: ((t * 0.6 + 200) % (W + 80)) - 40, y: H * 0.52, w: 80, h: 36, color: '#f59e0b', speed: 0.6 },
    ];

    // Emergency vehicle highlight
    if (camera.status === 'alert' && camera.detections.some(d => d.type === 'emergency')) {
      const pulse = Math.abs(Math.sin(frameRef.current * 0.12));
      ctx.fillStyle = `rgba(239,68,68,${pulse * 0.15})`;
      ctx.fillRect(0, 0, W, H);
    }

    cars.forEach(car => {
      ctx.save();
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(car.x + 4, car.y + car.h - 4, car.w, 6);
      // body
      ctx.fillStyle = car.color;
      ctx.beginPath();
      ctx.roundRect(car.x, car.y, car.w, car.h, 4);
      ctx.fill();
      // windows
      ctx.fillStyle = 'rgba(200,230,255,0.7)';
      ctx.fillRect(car.x + 8, car.y + 4, car.w * 0.5, car.h * 0.4);
      // wheels
      ctx.fillStyle = '#1e293b';
      ctx.beginPath(); ctx.arc(car.x + 12, car.y + car.h, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(car.x + car.w - 12, car.y + car.h, 6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    // ── Bounding box detections ──
    detectionsRef.current.forEach((det, i) => {
      const jitter = Math.sin(frameRef.current * 0.05 + i) * 2;
      const bx = det.bbox.x + jitter;
      const by = det.bbox.y + jitter;
      const bw = det.bbox.w;
      const bh = det.bbox.h;

      const colors: Record<string, string> = {
        vehicle: '#22d3ee', pedestrian: '#a78bfa', incident: '#f87171', emergency: '#fb923c',
      };
      const col = colors[det.type] || '#ffffff';

      ctx.strokeStyle = col;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, bw, bh);

      // Corner marks
      const cs = 8;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(bx, by + cs); ctx.lineTo(bx, by); ctx.lineTo(bx + cs, by);
      ctx.moveTo(bx + bw - cs, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + cs);
      ctx.moveTo(bx + bw, by + bh - cs); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw - cs, by + bh);
      ctx.moveTo(bx + cs, by + bh); ctx.lineTo(bx, by + bh); ctx.lineTo(bx, by + bh - cs);
      ctx.stroke();

      // Label pill
      const label = `${det.label} ${(det.confidence * 100).toFixed(0)}%`;
      ctx.font = 'bold 9px monospace';
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.roundRect(bx, by - 16, tw + 8, 14, 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.fillText(label, bx + 4, by - 6);
    });

    // ── HUD overlay ──
    // Top bar
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, 22);
    ctx.fillStyle = camera.status === 'alert' ? '#f87171' : '#22d3ee';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`● ${camera.status.toUpperCase()}`, 6, 14);
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';
    ctx.fillText(`${camera.resolution} · ${camera.fps}fps`, W - 6, 14);

    // Bottom stats bar
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, H - 24, W, 24);
    ctx.fillStyle = '#22d3ee';
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`🚗 ${camera.vehicleCount}   🚶 ${camera.pedestrianCount}`, 6, H - 9);
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    const now = new Date();
    ctx.fillText(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`, W - 6, H - 9);

    // Congestion bar
    const cLevel = camera.congestionLevel / 100;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(6, H - 38, W - 12, 5);
    const cColor = cLevel > 0.8 ? '#f87171' : cLevel > 0.5 ? '#f59e0b' : '#22c55e';
    ctx.fillStyle = cColor;
    ctx.fillRect(6, H - 38, (W - 12) * cLevel, 5);

    // Recording dot
    if (Math.floor(frameRef.current / 15) % 2 === 0) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(W - 14, 11, 4, 0, Math.PI * 2); ctx.fill();
    }

    // Scan line effect
    ctx.fillStyle = `rgba(255,255,255,${0.015 + 0.005 * Math.sin(frameRef.current * 0.1)})`;
    const scanY = (frameRef.current * 2) % H;
    ctx.fillRect(0, scanY, W, 2);

    if (active) {
      animRef.current = requestAnimationFrame(drawFrame);
    }
  }, [camera, active]);

  useEffect(() => {
    if (active) {
      animRef.current = requestAnimationFrame(drawFrame);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [active, drawFrame]);

  return <canvas ref={canvasRef} width={420} height={240} className="w-full h-full object-cover" />;
}

// ── Detection type badge ──────────────────────────────────────────────────────
function DetectionBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    vehicle: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    pedestrian: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    incident: 'bg-red-500/20 text-red-300 border-red-500/30',
    emergency: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  };
  const icons: Record<string, string> = { vehicle: '🚗', pedestrian: '🚶', incident: '⚠️', emergency: '🚨' };
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${styles[type] || ''}`}>
      {icons[type]} {type}
    </span>
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; dot: string; label: string }> = {
    online: { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400', label: 'Online' },
    alert: { cls: 'bg-red-500/15 text-red-400 border-red-500/30', dot: 'bg-red-400 animate-pulse', label: 'Alert' },
    maintenance: { cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dot: 'bg-amber-400', label: 'Maintenance' },
    offline: { cls: 'bg-slate-600/30 text-slate-500 border-slate-600/30', dot: 'bg-slate-500', label: 'Offline' },
  };
  const s = map[status] || map.offline;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-semibold ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function CVCameras() {
  const [cameras, setCameras] = useState<CVCamera[]>(CV_CAMERAS);
  const [selectedCam, setSelectedCam] = useState<CVCamera | null>(null);
  const [filter, setFilter] = useState<'all' | 'online' | 'alert' | 'offline' | 'maintenance'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCameras(prev =>
        prev.map(cam => {
          if (cam.status === 'offline' || cam.status === 'maintenance') return cam;
          const delta = Math.floor(Math.random() * 7) - 3;
          return {
            ...cam,
            vehicleCount: Math.max(0, cam.vehicleCount + delta),
            pedestrianCount: Math.max(0, cam.pedestrianCount + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0)),
            congestionLevel: Math.min(100, Math.max(0, cam.congestionLevel + (Math.random() * 4 - 2))),
            lastDetection: Math.random() > 0.5 ? 'just now' : cam.lastDetection,
          };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const filtered = cameras.filter(c => filter === 'all' || c.status === filter);
  const online = cameras.filter(c => c.status === 'online').length;
  const alerts = cameras.filter(c => c.status === 'alert').length;
  const offline = cameras.filter(c => c.status === 'offline' || c.status === 'maintenance').length;
  const totalVehicles = cameras.reduce((s, c) => s + c.vehicleCount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xl">📷</span>
            Computer Vision Cameras
          </h1>
          <p className="text-slate-400 text-sm mt-1">AI-powered real-time object detection & traffic analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
          </span>
          <button
            onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition text-xs font-medium"
          >
            {viewMode === 'grid'
              ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>}
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Cameras Online', value: `${online}/${cameras.length}`, icon: '🟢', color: 'emerald' },
          { label: 'Active Alerts', value: alerts, icon: '🔴', color: 'red' },
          { label: 'Offline / Maint.', value: offline, icon: '🟡', color: 'amber' },
          { label: 'Vehicles Detected', value: totalVehicles.toLocaleString(), icon: '🚗', color: 'cyan' },
        ].map(k => (
          <div key={k.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <span className="text-2xl">{k.icon}</span>
            <div>
              <p className="text-slate-400 text-xs font-medium">{k.label}</p>
              <p className="text-white text-xl font-bold">{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'online', 'alert', 'maintenance', 'offline'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition border ${filter === f
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:text-slate-200 hover:border-slate-600'}`}
          >
            {f === 'all' ? `All (${cameras.length})` :
              f === 'online' ? `Online (${online})` :
              f === 'alert' ? `Alert (${alerts})` :
              f === 'maintenance' ? `Maintenance (${cameras.filter(c => c.status === 'maintenance').length})` :
              `Offline (${cameras.filter(c => c.status === 'offline').length})`}
          </button>
        ))}
      </div>

      {/* Camera Grid / List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(cam => (
            <div
              key={cam.id}
              onClick={() => setSelectedCam(cam)}
              className={`bg-slate-900 border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group hover:scale-[1.01] hover:shadow-xl hover:shadow-black/40
                ${cam.status === 'alert' ? 'border-red-500/50 shadow-red-500/10 shadow-lg' : 'border-slate-800 hover:border-slate-700'}`}
            >
              {/* Camera Feed */}
              <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
                <CameraFeed camera={cam} active={cam.status !== 'offline' && cam.status !== 'maintenance'} />
                {/* Expand icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/20">
                  <div className="bg-black/60 rounded-full p-2">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>
                </div>
                {cam.incidentDetected && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600/90 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                    ⚠ INCIDENT
                  </div>
                )}
              </div>

              {/* Info panel */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-white font-semibold text-sm leading-tight">{cam.name}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{cam.location}</p>
                  </div>
                  <StatusPill status={cam.status} />
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Vehicles', value: cam.vehicleCount, color: 'text-cyan-400' },
                    { label: 'Pedestrians', value: cam.pedestrianCount, color: 'text-violet-400' },
                    { label: 'Detections', value: cam.detections.length, color: 'text-amber-400' },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-800/60 rounded-lg py-1.5 px-1">
                      <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-slate-500 text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Congestion bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Congestion</span>
                    <span className={cam.congestionLevel > 80 ? 'text-red-400' : cam.congestionLevel > 50 ? 'text-amber-400' : 'text-emerald-400'}>
                      {Math.round(cam.congestionLevel)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cam.congestionLevel > 80 ? 'bg-red-500' : cam.congestionLevel > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${cam.congestionLevel}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-2">
                  <span>{cam.resolution} · {cam.fps}fps</span>
                  <span>Uptime {cam.uptime}%</span>
                  <span>Last: {cam.lastDetection}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
            <span className="col-span-3">Camera</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-1 text-right">Vehicles</span>
            <span className="col-span-1 text-right">Pedestrians</span>
            <span className="col-span-2">Congestion</span>
            <span className="col-span-1 text-right">FPS</span>
            <span className="col-span-1 text-right">Uptime</span>
            <span className="col-span-1 text-right">Last Det.</span>
          </div>
          {filtered.map(cam => (
            <div
              key={cam.id}
              onClick={() => setSelectedCam(cam)}
              className={`grid grid-cols-12 gap-3 items-center bg-slate-900 border rounded-xl px-4 py-3 cursor-pointer hover:bg-slate-800/80 transition
                ${cam.status === 'alert' ? 'border-red-500/40' : 'border-slate-800 hover:border-slate-700'}`}
            >
              <div className="col-span-3">
                <p className="text-white text-sm font-medium truncate">{cam.name}</p>
                <p className="text-slate-500 text-xs truncate">{cam.location}</p>
              </div>
              <div className="col-span-2"><StatusPill status={cam.status} /></div>
              <div className="col-span-1 text-right text-cyan-400 font-semibold text-sm">{cam.vehicleCount}</div>
              <div className="col-span-1 text-right text-violet-400 font-semibold text-sm">{cam.pedestrianCount}</div>
              <div className="col-span-2">
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cam.congestionLevel > 80 ? 'bg-red-500' : cam.congestionLevel > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${cam.congestionLevel}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500">{Math.round(cam.congestionLevel)}%</span>
              </div>
              <div className="col-span-1 text-right text-slate-400 text-sm">{cam.fps}</div>
              <div className="col-span-1 text-right text-slate-400 text-sm">{cam.uptime}%</div>
              <div className="col-span-1 text-right text-slate-500 text-xs">{cam.lastDetection}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal: Camera Detail ── */}
      {selectedCam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedCam(null)}>
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <h2 className="text-white font-bold text-lg">{selectedCam.name}</h2>
                <StatusPill status={selectedCam.status} />
              </div>
              <button onClick={() => setSelectedCam(null)} className="text-slate-500 hover:text-white transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Feed - large */}
              <div className="lg:col-span-3 space-y-4">
                <div className="rounded-xl overflow-hidden bg-black border border-slate-800" style={{ aspectRatio: '16/9' }}>
                  <CameraFeed camera={selectedCam} active />
                </div>

                {/* AI Detections */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    AI Detections ({selectedCam.detections.length})
                  </h4>
                  {selectedCam.detections.length === 0 ? (
                    <p className="text-slate-500 text-sm">No active detections</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedCam.detections.map(det => (
                        <div key={det.id} className="flex items-center justify-between bg-slate-900/60 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <DetectionBadge type={det.type} />
                            <span className="text-slate-300 text-xs font-medium">{det.label}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>Conf: <span className="text-emerald-400 font-semibold">{(det.confidence * 100).toFixed(1)}%</span></span>
                            <span>BBox: [{det.bbox.x},{det.bbox.y}]</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: stats panel */}
              <div className="lg:col-span-2 space-y-4">
                {/* Camera info */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-3">
                  <h4 className="text-white font-semibold text-sm">Camera Info</h4>
                  {[
                    { label: 'ID', value: selectedCam.id.toUpperCase() },
                    { label: 'Location', value: selectedCam.location },
                    { label: 'Resolution', value: selectedCam.resolution },
                    { label: 'Frame Rate', value: `${selectedCam.fps} fps` },
                    { label: 'Uptime', value: `${selectedCam.uptime}%` },
                    { label: 'Coordinates', value: `${selectedCam.lat.toFixed(4)}, ${selectedCam.lng.toFixed(4)}` },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between text-sm">
                      <span className="text-slate-500">{row.label}</span>
                      <span className="text-slate-200 font-medium">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Live counts */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-3">
                  <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> Live Counts
                  </h4>
                  {[
                    { label: 'Vehicles', value: selectedCam.vehicleCount, color: 'text-cyan-400', bar: 'bg-cyan-500', pct: Math.min(100, (selectedCam.vehicleCount / 600) * 100) },
                    { label: 'Pedestrians', value: selectedCam.pedestrianCount, color: 'text-violet-400', bar: 'bg-violet-500', pct: Math.min(100, (selectedCam.pedestrianCount / 100) * 100) },
                    { label: 'Congestion', value: `${Math.round(selectedCam.congestionLevel)}%`, color: selectedCam.congestionLevel > 80 ? 'text-red-400' : 'text-amber-400', bar: selectedCam.congestionLevel > 80 ? 'bg-red-500' : 'bg-amber-500', pct: selectedCam.congestionLevel },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{m.label}</span>
                        <span className={`font-bold ${m.color}`}>{m.value}</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${m.bar}`} style={{ width: `${m.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Alert status */}
                {selectedCam.incidentDetected && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-xl">🚨</span>
                    <div>
                      <p className="text-red-400 font-semibold text-sm">Incident Detected</p>
                      <p className="text-red-300/70 text-xs mt-1">AI vision has flagged an active incident at this location. Emergency services may be required.</p>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="space-y-2">
                  <button className="w-full py-2 px-4 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 transition text-sm font-medium flex items-center gap-2 justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export Snapshot
                  </button>
                  <button className="w-full py-2 px-4 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 hover:bg-violet-500/25 transition text-sm font-medium flex items-center gap-2 justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    View Analytics Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
