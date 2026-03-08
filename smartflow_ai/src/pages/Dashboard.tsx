import { useState, useEffect } from 'react';
import { TRAFFIC_NODES, ALERTS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const statCards = [
  {
    label: 'Total Vehicles',
    value: '1,701',
    change: '+12%',
    up: true,
    color: 'from-blue-500 to-cyan-500',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    label: 'Avg. Speed',
    value: '28 km/h',
    change: '-8%',
    up: false,
    color: 'from-amber-500 to-orange-500',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Active Junctions',
    value: '6 / 6',
    change: '100%',
    up: true,
    color: 'from-emerald-500 to-teal-500',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Active Alerts',
    value: '4',
    change: 'Critical',
    up: false,
    color: 'from-red-500 to-rose-500',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
];

const statusColor: Record<string, string> = {
  normal: 'bg-emerald-500',
  congested: 'bg-amber-500',
  critical: 'bg-red-500',
  emergency: 'bg-red-600 animate-pulse',
};

const statusBadge: Record<string, string> = {
  normal: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  congested: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  critical: 'bg-red-500/10 text-red-400 border-red-500/30',
  emergency: 'bg-red-600/20 text-red-300 border-red-500/50',
};

const alertStyle: Record<string, { bg: string; icon: string; dot: string }> = {
  emergency: { bg: 'border-l-red-500 bg-red-500/5', icon: 'text-red-400', dot: 'bg-red-500 animate-pulse' },
  congestion: { bg: 'border-l-amber-500 bg-amber-500/5', icon: 'text-amber-400', dot: 'bg-amber-500' },
  incident: { bg: 'border-l-orange-500 bg-orange-500/5', icon: 'text-orange-400', dot: 'bg-orange-500' },
  info: { bg: 'border-l-blue-500 bg-blue-500/5', icon: 'text-blue-400', dot: 'bg-blue-500' },
};

export function Dashboard() {
  const { hasPermission } = useAuth();
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Traffic Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Real-time urban traffic overview</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 text-sm font-mono">{liveTime.toLocaleTimeString()}</span>
          <span className="text-slate-500 text-xs">LIVE</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 hover:border-slate-600 transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}>
                {card.icon}
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${card.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {card.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-slate-400 text-sm mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Junction status */}
        <div className="xl:col-span-2 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Junction Status Overview
          </h2>
          <div className="space-y-3">
            {TRAFFIC_NODES.map(node => (
              <div key={node.id} className="flex items-center gap-4 bg-slate-900/50 rounded-xl p-3 hover:bg-slate-900/80 transition">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusColor[node.status]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">{node.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${statusBadge[node.status]}`}>{node.status}</span>
                  </div>
                  <p className="text-slate-500 text-xs truncate">{node.location}</p>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0 text-right">
                  <div>
                    <p className="text-white text-sm font-semibold">{node.vehicleCount}</p>
                    <p className="text-slate-500 text-xs">vehicles</p>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{node.avgSpeed} <span className="text-slate-500 text-xs font-normal">km/h</span></p>
                    <p className="text-slate-500 text-xs">avg speed</p>
                  </div>
                  {/* Signal indicator */}
                  <div className="flex gap-1">
                    <div className={`w-3 h-3 rounded-full ${node.status === 'emergency' ? 'bg-green-400' : 'bg-slate-700'}`} />
                    <div className={`w-3 h-3 rounded-full ${node.status === 'congested' ? 'bg-amber-400' : 'bg-slate-700'}`} />
                    <div className={`w-3 h-3 rounded-full ${node.status === 'critical' ? 'bg-red-500 animate-pulse' : node.status === 'normal' ? 'bg-slate-700' : 'bg-slate-700'}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts panel */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            Live Alerts
            <span className="ml-auto bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full border border-red-500/30">
              {ALERTS.filter(a => !a.resolved).length} active
            </span>
          </h2>
          <div className="space-y-3">
            {ALERTS.map(alert => {
              const style = alertStyle[alert.type];
              return (
                <div key={alert.id} className={`border-l-4 ${style.bg} rounded-r-xl p-3 ${alert.resolved ? 'opacity-50' : ''}`}>
                  <div className="flex items-start gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${style.dot}`} />
                    <div className="min-w-0">
                      <p className="text-slate-200 text-xs font-medium leading-snug">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-500 text-xs">{alert.location}</span>
                        <span className="text-slate-600 text-xs">·</span>
                        <span className="text-slate-500 text-xs">{alert.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  {!alert.resolved && hasPermission('resolve_alerts') && (
                    <button className="mt-2 text-xs text-slate-500 hover:text-slate-300 transition underline underline-offset-2">
                      Mark resolved
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Optimization Banner */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-purple-600/10 border border-cyan-500/20 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold">AI Optimization Active</p>
          <p className="text-slate-400 text-sm">Computer vision is processing 6 live camera feeds · Signal timing auto-adjusted 14 times today · Est. 23% congestion reduction</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-emerald-400 font-bold text-lg">23%</p>
          <p className="text-slate-500 text-xs">congestion reduced</p>
        </div>
      </div>
    </div>
  );
}
