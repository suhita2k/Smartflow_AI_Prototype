import { ANALYTICS_DATA } from '../data/mockData';

const maxVehicles = Math.max(...ANALYTICS_DATA.map(d => d.vehicles));
const maxSpeed = 80;

export function Analytics() {
  const totalVehicles = ANALYTICS_DATA.reduce((s, d) => s + d.vehicles, 0);
  const avgSpeed = Math.round(ANALYTICS_DATA.reduce((s, d) => s + d.avgSpeed, 0) / ANALYTICS_DATA.length);
  const totalIncidents = ANALYTICS_DATA.reduce((s, d) => s + d.incidents, 0);
  const peakHour = ANALYTICS_DATA.reduce((max, d) => d.vehicles > max.vehicles ? d : max, ANALYTICS_DATA[0]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Traffic Analytics</h1>
        <p className="text-slate-400 text-sm mt-0.5">Today's data · AI-driven insights</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Vehicles Today', value: totalVehicles.toLocaleString(), icon: '🚗', color: 'from-blue-500 to-cyan-500' },
          { label: 'Average Speed', value: `${avgSpeed} km/h`, icon: '⚡', color: 'from-amber-500 to-orange-500' },
          { label: 'Total Incidents', value: totalIncidents.toString(), icon: '⚠️', color: 'from-red-500 to-rose-500' },
          { label: 'Peak Hour', value: peakHour.hour, icon: '📈', color: 'from-purple-500 to-indigo-500' },
        ].map(k => (
          <div key={k.label} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center text-xl mb-3 shadow-lg`}>
              {k.icon}
            </div>
            <p className="text-2xl font-bold text-white">{k.value}</p>
            <p className="text-slate-400 text-sm mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Vehicle count chart */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold">Vehicle Flow by Hour</h2>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-cyan-500 block"/> Vehicles</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 block"/> Incidents</span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-48">
          {ANALYTICS_DATA.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full flex flex-col items-center justify-end gap-0.5" style={{ height: '180px' }}>
                {/* Incident dot */}
                {d.incidents > 0 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mb-0.5 shadow-sm shadow-red-500/60" />
                )}
                {/* Vehicle bar */}
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-400 opacity-80 group-hover:opacity-100 transition-all duration-300 relative"
                  style={{ height: `${(d.vehicles / maxVehicles) * 160}px` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                    {d.vehicles} vehicles
                  </div>
                </div>
              </div>
              <span className="text-slate-500 text-xs">{d.hour}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Speed chart */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-5">Average Speed by Hour</h2>
          <div className="space-y-2">
            {ANALYTICS_DATA.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-slate-500 text-xs w-10 flex-shrink-0">{d.hour}</span>
                <div className="flex-1 h-2.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      d.avgSpeed > 50 ? 'bg-emerald-500' :
                      d.avgSpeed > 25 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(d.avgSpeed / maxSpeed) * 100}%` }}
                  />
                </div>
                <span className="text-slate-400 text-xs w-12 text-right flex-shrink-0">{d.avgSpeed} km/h</span>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Insights
          </h2>
          <div className="space-y-3">
            {[
              { icon: '📊', text: 'Peak congestion occurs between 08:00–09:00 and 16:00–18:00. Signal timing has been pre-optimized for tomorrow.', tag: 'Prediction', color: 'cyan' },
              { icon: '🔁', text: 'Vehicle flow is 18% higher than last Tuesday. Additional camera monitoring activated at East Corridor.', tag: 'Trend', color: 'blue' },
              { icon: '⚡', text: 'AI signal optimization reduced average wait time by 27% compared to static timing systems.', tag: 'Optimization', color: 'emerald' },
              { icon: '🚨', text: '4 incidents detected today. 2 were cleared within 8 minutes due to automated rerouting.', tag: 'Safety', color: 'amber' },
              { icon: '🌙', text: 'Off-peak hours (00:00–05:00) show 65% below average density. Signal cycles shortened to save energy.', tag: 'Efficiency', color: 'purple' },
            ].map((ins, i) => (
              <div key={i} className="flex items-start gap-3 bg-slate-900/40 rounded-xl p-3">
                <span className="text-xl flex-shrink-0">{ins.icon}</span>
                <div>
                  <span className={`text-xs font-semibold text-${ins.color}-400 uppercase tracking-wide`}>{ins.tag}</span>
                  <p className="text-slate-300 text-sm mt-0.5 leading-snug">{ins.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap-style grid */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Congestion Heatmap (Today)</h2>
        <div className="overflow-x-auto">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${ANALYTICS_DATA.length}, minmax(0, 1fr))` }}>
            {ANALYTICS_DATA.map((d, i) => {
              const intensity = d.vehicles / maxVehicles;
              return (
                <div key={i} className="space-y-1">
                  <div
                    className="h-10 rounded-md transition-all"
                    title={`${d.hour}: ${d.vehicles} vehicles`}
                    style={{
                      background: `rgba(239,68,68,${intensity * 0.85 + 0.05})`,
                    }}
                  />
                  <p className="text-slate-600 text-xs text-center">{d.hour.split(':')[0]}h</p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-2 mt-3">
            <span className="text-slate-500 text-xs">Low</span>
            <div className="flex gap-0.5">
              {[0.1, 0.3, 0.5, 0.7, 0.9].map(op => (
                <div key={op} className="w-5 h-3 rounded-sm" style={{ background: `rgba(239,68,68,${op})` }} />
              ))}
            </div>
            <span className="text-slate-500 text-xs">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
