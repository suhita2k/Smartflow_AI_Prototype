import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TRAFFIC_NODES } from '../data/mockData';

const ROUTE_NODES = ['n5', 'n6', 'n1'];

type VehicleType = 'ambulance' | 'fire' | 'police';

const vehicleIcons: Record<VehicleType, string> = {
  ambulance: '🚑',
  fire: '🚒',
  police: '🚓',
};

const vehicleColors: Record<VehicleType, string> = {
  ambulance: 'from-red-500 to-rose-600',
  fire: 'from-orange-500 to-red-600',
  police: 'from-blue-500 to-indigo-600',
};

export function EmergencyCorridor() {
  const { hasPermission } = useAuth();
  const [active, setActive] = useState(true);
  const [vehicleType, setVehicleType] = useState<VehicleType>('ambulance');
  const [eta, setEta] = useState(4);
  const [progress, setProgress] = useState(35);
  const [log, setLog] = useState<string[]>([
    '14:32:01 — GREEN CORRIDOR activated for Ambulance Unit #7',
    '14:32:01 — Node "West Terminal" → signal set to GREEN (90s)',
    '14:32:03 — Node "City Square" → signal set to GREEN (60s)',
    '14:32:05 — Node "Central Junction" → signal set to GREEN (45s)',
    '14:32:10 — All cross-traffic HALTED on corridor route',
    '14:32:15 — ETA to hospital: 4 minutes',
  ]);
  const [pulseStep, setPulseStep] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t1 = setInterval(() => {
      setProgress(p => Math.min(100, p + 1));
      setEta(e => Math.max(0, e - 0.05));
    }, 1200);
    const t2 = setInterval(() => {
      setPulseStep(s => (s + 1) % ROUTE_NODES.length);
    }, 1000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, [active]);

  const triggerCorridor = () => {
    setActive(true);
    setProgress(0);
    setEta(6);
    setPulseStep(0);
    const now = new Date().toLocaleTimeString();
    setLog(prev => [
      `${now} — GREEN CORRIDOR activated for ${vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)}`,
      `${now} — All nodes on route set to GREEN`,
      `${now} — Cross-traffic HALTED`,
      `${now} — ETA calculated: 6 minutes`,
      ...prev,
    ].slice(0, 12));
  };

  const deactivate = () => {
    setActive(false);
    const now = new Date().toLocaleTimeString();
    setLog(prev => [
      `${now} — GREEN CORRIDOR DEACTIVATED`,
      `${now} — Normal signal timing restored on all nodes`,
      ...prev,
    ].slice(0, 12));
  };

  const corridorNodes = TRAFFIC_NODES.filter(n => ROUTE_NODES.includes(n.id));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Emergency Green Corridor
            {active && <span className="text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full animate-pulse">ACTIVE</span>}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">AI-powered priority routing for emergency vehicles</p>
        </div>
        {hasPermission('trigger_emergency') && (
          <div className="flex gap-3">
            {active ? (
              <button onClick={deactivate} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-xl text-sm font-semibold transition">
                Deactivate Corridor
              </button>
            ) : (
              <button onClick={triggerCorridor} className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-red-500/30 transition">
                🚨 Activate Green Corridor
              </button>
            )}
          </div>
        )}
      </div>

      {/* Active corridor banner */}
      {active && (
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600/20 via-rose-600/10 to-transparent border border-red-500/40 rounded-2xl p-5">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage:'repeating-linear-gradient(45deg, #ef4444 0, #ef4444 10px, transparent 10px, transparent 20px)'}} />
          <div className="relative flex items-center gap-4 flex-wrap">
            <div className="text-4xl">{vehicleIcons[vehicleType]}</div>
            <div className="flex-1">
              <p className="text-white font-bold text-lg">
                {vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)} Unit #7 — En Route
              </p>
              <p className="text-slate-300 text-sm">West Terminal → City Hospital via City Square & Central Junction</p>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Route Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-white">{Math.ceil(eta)}</p>
              <p className="text-slate-400 text-sm">min ETA</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Route visualization */}
        <div className="xl:col-span-2 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-5">Corridor Route Nodes</h2>
          <div className="space-y-3">
            {corridorNodes.map((node, i) => {
              const isActive = active && ROUTE_NODES.indexOf(node.id) <= Math.floor(progress / (100 / ROUTE_NODES.length));
              const isCurrent = active && pulseStep === i;
              return (
                <div key={node.id} className={`flex items-center gap-4 rounded-xl p-4 border transition-all duration-500 ${
                  isActive
                    ? 'bg-green-500/10 border-green-500/40'
                    : 'bg-slate-900/40 border-slate-700/40'
                } ${isCurrent ? 'ring-2 ring-green-400' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all duration-500 ${
                    isActive ? 'bg-green-500 text-white shadow-lg shadow-green-500/40' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">{node.name}</p>
                      {isActive && (
                        <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full font-semibold">
                          🟢 GREEN
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs">{node.location}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white text-sm font-semibold">{isActive ? '90s' : node.greenTime + 's'}</p>
                    <p className="text-slate-500 text-xs">{isActive ? 'PRIORITY GREEN' : 'normal cycle'}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 ${isActive ? 'bg-green-400 shadow-lg shadow-green-400/60' + (isCurrent ? ' animate-ping' : '') : 'bg-slate-700'}`} />
                </div>
              );
            })}
          </div>

          {/* Trigger form */}
          {hasPermission('trigger_emergency') && !active && (
            <div className="mt-5 pt-5 border-t border-slate-700">
              <h3 className="text-slate-300 text-sm font-medium mb-3">New Emergency Request</h3>
              <div className="flex gap-3 flex-wrap">
                {(['ambulance', 'fire', 'police'] as VehicleType[]).map(v => (
                  <button
                    key={v}
                    onClick={() => setVehicleType(v)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition ${
                      vehicleType === v
                        ? `bg-gradient-to-r ${vehicleColors[v]} text-white border-transparent shadow-lg`
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span>{vehicleIcons[v]}</span>
                    <span className="capitalize">{v}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={triggerCorridor}
                className="mt-3 w-full py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white rounded-xl font-semibold shadow-lg shadow-red-500/30 transition"
              >
                🚨 Activate {vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)} Corridor
              </button>
            </div>
          )}
        </div>

        {/* Activity log */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Activity Log
          </h2>
          <div className="space-y-2 font-mono text-xs">
            {log.map((entry, i) => (
              <div key={i} className={`p-2 rounded-lg leading-snug ${
                i === 0 ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'text-slate-400'
              }`}>
                {entry}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Response Time Saved', value: '3.2 min', color: 'text-emerald-400' },
          { label: 'Corridors Today', value: '7', color: 'text-cyan-400' },
          { label: 'Success Rate', value: '100%', color: 'text-emerald-400' },
          { label: 'Vehicles Rerouted', value: '214', color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
