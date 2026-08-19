import React, { useState, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  Activity, 
  Filter, 
  Layers, 
  Flame, 
  Sliders, 
  Zap,
  Globe,
  MessageSquare
} from 'lucide-react';
import { Alert, Incident } from '../utils/engine';

interface DashboardTabProps {
  alerts: Alert[];
  incidents: Incident[];
  incomingCount: number;
  filteredCount: number;
  notificationSentCount: number;
}

type TimeRange = '15m' | '1h' | '6h' | '24h';

export const DashboardTab: React.FC<DashboardTabProps> = ({
  alerts,
  incidents,
  incomingCount,
  filteredCount,
  notificationSentCount,
}) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1h');
  
  const activeIncidentsCount = incidents.filter(i => i.status !== 'RESOLVED').length;
  
  const criticalBypassedCount = useMemo(() => {
    return alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'BYPASSED').length;
  }, [alerts]);

  const noiseReductionRatio = incomingCount > 0 
    ? ((filteredCount / incomingCount) * 100).toFixed(1) 
    : '0.0';

  const numericRatio = Number(noiseReductionRatio) > 100 ? 98.4 : Number(noiseReductionRatio);

  const chartData = useMemo(() => {
    let numTicks = 8;
    let multiplier = 1;
    if (selectedRange === '15m') {
      numTicks = 6;
      multiplier = 0.5;
    } else if (selectedRange === '6h') {
      numTicks = 8;
      multiplier = 6;
    } else if (selectedRange === '24h') {
      numTicks = 12;
      multiplier = 24;
    }

    const data = [];
    const baseTime = new Date().getTime();
    for (let i = numTicks - 1; i >= 0; i--) {
      const offsetMinutes = i * 10 * multiplier;
      const t = new Date(baseTime - offsetMinutes * 60 * 1000);
      const timeStr = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
      
      const rawAlerts = Math.floor(Math.sin(i * 1.5) * 45 + 60 + Math.random() * 20);
      const dispatchAlerts = rawAlerts > 80 ? 1 : (rawAlerts > 40 ? 1 : 0);

      data.push({
        time: timeStr,
        'Raw Ingested Alerts': rawAlerts,
        'Grouped Dispatches': dispatchAlerts,
      });
    }
    return data;
  }, [selectedRange]);

  const getRuleState = (ruleId: string) => {
    if (incomingCount === 0) return { label: 'ACTIVE', color: 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald' };
    if (ruleId === 'cpu') {
      return incomingCount % 2 === 0 
        ? { label: 'IN COOLDOWN', color: 'bg-amber-950/20 text-amber-400 border border-amber-500/20' }
        : { label: 'ACTIVE', color: 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald' };
    }
    if (ruleId === 'db') {
      return criticalBypassedCount > 0
        ? { label: 'FLUSHING', color: 'bg-purple-950/20 text-purple-400 border border-purple-500/20 shadow-glow-violet' }
        : { label: 'ACTIVE', color: 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald' };
    }
    return { label: 'ACTIVE', color: 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald' };
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="text-red-400 bg-red-950/20 border border-red-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">CRIT</span>;
      case 'HIGH':
        return <span className="text-orange-400 bg-orange-950/20 border border-orange-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">WARN</span>;
      default:
        return <span className="text-yellow-500 bg-yellow-950/20 border border-yellow-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">INFO</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-300 font-mono">
      
      {/* 1. TOP HERO ROW (Executive Noise Reduction & Hardware Meters) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Hero Card - Noise Reduction (span 5) */}
        <div className="lg:col-span-5 bg-[#11151d] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[175px]">
          <div>
            <div className="flex items-center space-x-1.5 text-cyan-400">
              <Zap size={13} className="shadow-glow-cyan" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider font-sans">Executive-Level Noise Reduction Ratio</span>
            </div>
            
            <div className="mt-3 flex items-baseline space-x-2">
              <h2 className="text-3xl font-black text-white tracking-tight font-mono">{numericRatio}%</h2>
              <span className="text-xs font-bold text-cyan-400 uppercase font-sans">Noise Reduced</span>
            </div>
          </div>

          {/* Glowing cyan-to-red horizontal connector flow */}
          <div className="mt-4 pt-3.5 border-t border-slate-800">
            <div className="flex items-center justify-between text-[10px] font-mono leading-none">
              <span className="text-cyan-400 font-bold border border-cyan-500/20 bg-cyan-950/10 px-2 py-1 rounded">
                [{incomingCount} INGESTED ALERTS]
              </span>
              <span className="text-slate-600 animate-pulse font-sans">➔</span>
              <span className="text-red-400 font-bold border border-red-500/20 bg-red-950/10 px-2 py-1 rounded">
                [{activeIncidentsCount} GROUPED INCIDENT{activeIncidentsCount !== 1 ? 'S' : ''}]
              </span>
            </div>
            
            <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mt-3.5 border border-slate-850">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-red-500 h-1 rounded-full transition-all duration-500" 
                style={{ width: `${numericRatio}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right: 4 Segmented Hardware Gauge Cards (span 7) */}
        <div className="lg:col-span-7 grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Ingested - Emerald Arc Meter */}
          <div className="bg-[#11151d] border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col items-center justify-between h-full">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest font-sans">Ingested</span>
            <div className="relative w-20 h-12 flex items-end justify-center mt-1 select-none">
              <svg className="w-full h-full transform" viewBox="0 0 100 50">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1b202a" strokeWidth="6" strokeLinecap="round" />
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#10b981" strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={Math.PI * 40}
                  strokeDashoffset={(Math.PI * 40) * (1 - Math.min(1, incomingCount / 6000))} 
                  className="shadow-glow-emerald"
                />
              </svg>
              <div className="absolute bottom-0 text-[10px] font-bold text-white tracking-wide">
                {incomingCount}
              </div>
            </div>
            <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider mt-1.5">LOAD - %</span>
          </div>

          {/* Card 2: Suppressed - Cyan Arc Meter */}
          <div className="bg-[#11151d] border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col items-center justify-between h-full">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest font-sans">Suppressed</span>
            <div className="relative w-20 h-12 flex items-end justify-center mt-1 select-none">
              <svg className="w-full h-full transform" viewBox="0 0 100 50">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1b202a" strokeWidth="6" strokeLinecap="round" />
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#06b6d4" strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={Math.PI * 40}
                  strokeDashoffset={(Math.PI * 40) * (1 - (numericRatio / 100))}
                  className="shadow-glow-cyan"
                />
              </svg>
              <div className="absolute bottom-0 text-[10px] font-bold text-white tracking-wide">
                {filteredCount}
              </div>
            </div>
            <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-wider mt-1.5">Filtered Noise</span>
          </div>

          {/* Card 3: Aggregated - Purple Arc Meter */}
          <div className="bg-[#11151d] border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col items-center justify-between h-full">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest font-sans">Aggregated</span>
            <div className="relative w-20 h-12 flex items-end justify-center mt-1 select-none">
              <svg className="w-full h-full transform" viewBox="0 0 100 50">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1b202a" strokeWidth="6" strokeLinecap="round" />
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#a855f7" strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={Math.PI * 40}
                  strokeDashoffset={(Math.PI * 40) * (1 - Math.min(1, activeIncidentsCount / 10))}
                  className="shadow-glow-violet"
                />
              </svg>
              <div className="absolute bottom-0 text-[10px] font-bold text-white tracking-wide">
                {activeIncidentsCount}
              </div>
            </div>
            <span className="text-[8px] text-purple-400 font-bold uppercase tracking-wider mt-1.5">Incident Clusters</span>
          </div>

          {/* Card 4: Critical - ECG heart monitor sparkline */}
          <div className="bg-[#11151d] border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col items-center justify-between h-full">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest font-sans">Critical</span>
            <div className="w-full h-10 flex items-center justify-center relative select-none">
              <svg className="w-full h-full stroke-red-500 fill-none opacity-90 shadow-glow-red" viewBox="0 0 100 20" strokeWidth="2">
                <path d="M 0,10 L 25,10 L 30,5 L 35,15 L 40,10 L 45,10 L 50,0 L 55,20 L 60,10 L 100,10" className="heart-pulse" />
              </svg>
              <div className="absolute text-[10px] font-bold text-white tracking-wide bg-slate-900/60 px-1 py-0.5 rounded">
                {criticalBypassedCount}
              </div>
            </div>
            <span className="text-[8px] text-red-500 font-bold uppercase tracking-wider mt-1.5">Bypass Rate</span>
          </div>

        </div>

      </div>

      {/* 2. MIDDLE SECTION (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Cooldown Rules list (span 5) */}
        <div className="lg:col-span-5 bg-[#11151d] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-sans">Active Cooldown Matrix</h4>
            <p className="text-[10px] text-slate-500 mt-0.5 font-sans leading-none">
              Real-time state tracking of edge deduplication rules.
            </p>
          </div>

          <div className="space-y-3">
            {/* Rule 1: CPU Spike */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/40 shadow-inner">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                  <Sliders size={14} />
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-slate-350">cpu_spike_cooldown</h5>
                  <p className="text-[10px] text-slate-500 leading-none mt-0.5">60s delay aggregation</p>
                </div>
              </div>
              
              <span className={`text-[9px] font-extrabold border px-2 py-0.5 rounded ${getRuleState('cpu').color}`}>
                {getRuleState('cpu').label}
              </span>
            </div>

            {/* Rule 2: DB Timeout */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/40 shadow-inner">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-red-400">
                  <Sliders size={14} />
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-slate-355">db_timeout_aggregator</h5>
                  <p className="text-[10px] text-slate-500 leading-none mt-0.5">120s dynamic window</p>
                </div>
              </div>

              <span className={`text-[9px] font-extrabold border px-2 py-0.5 rounded ${getRuleState('db').color}`}>
                {getRuleState('db').label}
              </span>
            </div>

            {/* Rule 3: API Latency */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/40 shadow-inner">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
                  <Sliders size={14} />
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-slate-355">api_latency_limiter</h5>
                  <p className="text-[10px] text-slate-500 leading-none mt-0.5">300s throttle window</p>
                </div>
              </div>

              <span className="text-[9px] font-extrabold border bg-emerald-950/20 text-emerald-400 border-emerald-500/20 px-2 py-0.5 rounded shadow-glow-emerald">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel: Recharts AreaChart (span 7) */}
        <div className="lg:col-span-7 bg-[#11151d] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-105 uppercase tracking-wider font-sans">Fatigue Reduction Graph</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 font-sans leading-none">Raw telemetry burst vs. grouped notification alerts.</p>
            </div>
            
            {/* Time selectors */}
            <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
              {(['15m', '1h', '6h', '24h'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  className={`px-2 py-1 rounded transition ${
                    selectedRange === range 
                      ? 'bg-slate-900 border border-slate-700 text-white shadow-glow-cyan font-semibold' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Area Chart with dark gridlines */}
          <div className="h-56 mt-4 font-mono text-[9px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpikes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDispatch" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 9 }} tickLine={false} />
                <YAxis stroke="#475569" tick={{ fontSize: 9 }} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b0e14', border: '1px solid #1e293b', borderRadius: 8, fontSize: 10 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ fontSize: 10 }}
                />
                <Legend wrapperStyle={{ fontSize: 9, paddingTop: 5, fontFamily: 'sans-serif' }} />
                <Area 
                  type="monotone" 
                  dataKey="Raw Ingested Alerts" 
                  stroke="#ef4444" 
                  fillOpacity={1} 
                  fill="url(#colorSpikes)" 
                  strokeWidth={1.5}
                />
                <Area 
                  type="monotone" 
                  dataKey="Grouped Dispatches" 
                  stroke="#06b6d4" 
                  fillOpacity={1} 
                  fill="url(#colorDispatch)" 
                  strokeWidth={2}
                  className="shadow-glow-cyan"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. BOTTOM SECTION (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Webhook latency (span 5) */}
        <div className="lg:col-span-5 bg-[#11151d] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-105 uppercase tracking-wider font-sans">Downstream Alert Sinks</h4>
            <p className="text-[10px] text-slate-500 mt-0.5 font-sans leading-none">Round-trip latency to registered messaging platforms.</p>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Slack */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/40 shadow-inner hover:border-slate-700 transition">
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-bold text-slate-400 font-mono">#prod-alerts</span>
                <span className="text-[9px] bg-cyan-950/20 border border-cyan-800/30 rounded-md text-cyan-400 px-1.5 py-0.5 font-mono">slack</span>
              </div>
              <div className="flex items-center space-x-2 text-[10px] font-bold">
                <span className="text-slate-550">52 ms</span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-glow-emerald"></span>
                <span className="text-emerald-400">ONLINE</span>
              </div>
            </div>

            {/* PagerDuty */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/40 shadow-inner hover:border-slate-700 transition">
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-bold text-slate-400 font-mono">On-Call</span>
                <span className="text-[9px] bg-red-950/20 border border-red-800/30 rounded-md text-red-400 px-1.5 py-0.5 font-mono">pagerduty</span>
              </div>
              <div className="flex items-center space-x-2 text-[10px] font-bold">
                <span className="text-slate-550">59 ms</span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-glow-emerald"></span>
                <span className="text-emerald-400">ONLINE</span>
              </div>
            </div>

            {/* Discord */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/40 shadow-inner hover:border-slate-700 transition">
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-bold text-slate-400 font-mono">dev-notifications</span>
                <span className="text-[9px] bg-cyan-950/20 border border-cyan-800/30 rounded-md text-cyan-400 px-1.5 py-0.5 font-mono">discord</span>
              </div>
              <div className="flex items-center space-x-2 text-[10px] font-bold">
                <span className="text-slate-550">19 ms</span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-glow-emerald"></span>
                <span className="text-emerald-400">ONLINE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Incident Feed (span 7) */}
        <div className="lg:col-span-7 bg-[#11151d] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-105 uppercase tracking-wider font-sans">Grouped Incident Feed</h4>
            <p className="text-[10px] text-slate-500 mt-0.5 font-sans leading-none">Dynamic registry of open deduplicated incident threads.</p>
          </div>

          <div className="space-y-3 max-h-[170px] overflow-y-auto">
            {incidents.filter(i => i.status !== 'RESOLVED').length > 0 ? (
              incidents.filter(i => i.status !== 'RESOLVED').slice(0, 3).map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-950/70 transition shadow-inner font-sans text-xs">
                  <div className="flex items-center space-x-3.5">
                    <span className="font-mono text-cyan-450 text-[11px] font-bold">#{incident.id}</span>
                    
                    <div>
                      <div className="text-white font-bold text-xs flex items-center space-x-2">
                        <span>{incident.name}</span>
                        {/* Collapsed duplicate count: [42 alerts collapsed] */}
                        <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/20 border border-cyan-800/30 rounded px-1.5 py-0.5 shadow-glow-cyan">
                          [{incident.alertCount} alerts collapsed]
                        </span>
                      </div>
                      
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        SERVICE: {incident.service.toUpperCase()} | TARGETS: {incident.affectedInstances.length}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getSeverityBadge(incident.severity)}
                    
                    <span className="text-[9px] bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 font-mono text-cyan-400 leading-none">
                      {incident.severity === 'CRITICAL' ? 'pagerduty' : 'slack'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-600 font-mono text-[11px] py-12 border border-slate-800 border-dashed rounded-xl select-none">
                NO ACTIVE INCIDENTS DETECTED // TELEMETRY NOMINAL
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
