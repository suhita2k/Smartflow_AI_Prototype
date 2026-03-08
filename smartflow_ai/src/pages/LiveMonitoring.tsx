import { useState, useEffect } from 'react';
import { TRAFFIC_NODES } from '../data/mockData';
import { TrafficNode } from '../types';
import { useAuth } from '../context/AuthContext';

const statusColor: Record<string, string> = {
  normal: 'border-emerald-500/40 bg-emerald-500/5',
  congested: 'border-amber-500/40 bg-amber-500/5',
  critical: 'border-red-500/40 bg-red-500/5',
  emergency: 'border-red-600/60 bg-red-600/10',
};

const dotColor: Record<string, string> = {
  normal: 'bg-emerald-400',
  congested: 'bg-amber-400',
  critical: 'bg-red-500',
  emergency: 'bg-red-500 animate-pulse',
};

const speedBar: Record<string, string> = {
  normal: 'bg-emerald-500',
  congested: 'bg-amber-500',
  critical: 'bg-red-500',
  emergency: 'bg-red-600',
};

function useRandomize(initial: TrafficNode[]) {
  const [nodes, setNodes] = useState(initial);
  useEffect(() => {
    const t = setInterval(() => {
      setNodes(prev => prev.map(n => ({
        ...n,
        vehicleCount: Math.max(20, n.vehicleCount + Math.floor((Math.random() - 0.45) * 15)),
        avgSpeed: n.status === 'emergency' ? 0 : Math.max(5, Math.min(80, n.avgSpeed + Math.floor((Math.random() - 0.5) * 5))),
      })));
    }, 2000);
    return () => clearInterval(t);
  }, []);
  return nodes;
}

export function LiveMonitoring() {
  const { hasPermission } = useAuth();
  const nodes = useRandomize(TRAFFIC_NODES);
  const [selected, setSelected] = useState<TrafficNode | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? nodes : nodes.filter(n => n.status === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Traffic Monitoring</h1>
          <p className="text-slate-400 text-sm mt-0.5">Real-time junction data · updates every 2s</p>
        </div>
        <div className="flex items-center gap-2">
          {['all', 'normal', 'congested', 'critical', 'emergency'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition capitalize ${filter === f ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Map-like grid visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(node => (
          <div
            key={node.id}
            onClick={() => setSelected(node)}
            className={`border rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:scale-[1.01] ${statusColor[node.status]} ${selected?.id === node.id ? 'ring-2 ring-cyan-400' : ''}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${dotColor[node.status]}`} />
                  <h3 className="text-white font-semibold">{node.name}</h3>
                </div>
                <p className="text-slate-500 text-xs mt-1">{node.location}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase tracking-wide border ${
                node.status === 'emergency' ? 'bg-red-600/20 text-red-300 border-red-500/40' :
                node.status === 'critical' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                node.status === 'congested' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }`}>{node.status}</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-900/40 rounded-xl p-3">
                <p className="text-2xl font-bold text-white">{node.vehicleCount}</p>
                <p className="text-slate-500 text-xs">vehicles detected</p>
              </div>
              <div className="bg-slate-900/40 rounded-xl p-3">
                <p className="text-2xl font-bold text-white">{node.avgSpeed}</p>
                <p className="text-slate-500 text-xs">km/h avg speed</p>
              </div>
            </div>

            {/* Speed bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Speed</span>
                <span>{node.avgSpeed} / 80 km/h</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${speedBar[node.status]}`}
                  style={{ width: `${(node.avgSpeed / 80) * 100}%` }}
                />
              </div>
            </div>

            {/* Signal timing */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
                <span className="text-xs text-slate-400">{node.greenTime}s</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                <span className="text-xs text-slate-400">{node.redTime}s</span>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <span className="text-slate-600 text-xs">AI signal</span>
                <span className="text-emerald-400 text-xs font-medium">active</span>
              </div>
            </div>

            {/* Admin actions */}
            {hasPermission('manage_signals') && node.status !== 'normal' && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <button className="w-full py-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg transition">
                  ⚡ Optimize Signal Timing
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">{selected.name} · Detailed View</h2>
            <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300 transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Vehicle Count', value: selected.vehicleCount.toString() },
              { label: 'Avg Speed', value: `${selected.avgSpeed} km/h` },
              { label: 'Green Time', value: `${selected.greenTime}s` },
              { label: 'Red Time', value: `${selected.redTime}s` },
            ].map(m => (
              <div key={m.label} className="bg-slate-900/60 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{m.value}</p>
                <p className="text-slate-500 text-xs mt-1">{m.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-400 bg-slate-900/40 rounded-xl p-3">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Coordinates: {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)} · CV cameras: 4 active · Last detection: &lt;1s ago</span>
          </div>
        </div>
      )}
    </div>
  );
}
