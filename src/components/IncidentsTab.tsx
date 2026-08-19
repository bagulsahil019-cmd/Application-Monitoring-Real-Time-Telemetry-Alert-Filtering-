import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Server, 
  Clock, 
  Layers
} from 'lucide-react';
import { Incident, IncidentStatus, Severity } from '../utils/engine';

interface IncidentsTabProps {
  incidents: Incident[];
  onUpdateIncidentStatus: (id: string, status: IncidentStatus) => void;
}

export const IncidentsTab: React.FC<IncidentsTabProps> = ({ 
  incidents, 
  onUpdateIncidentStatus 
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="text-red-405 bg-red-950/20 border border-red-500/20 text-[10px] font-bold px-2 py-0.5 rounded font-mono shadow-glow-red">CRITICAL</span>;
      case 'HIGH':
        return <span className="text-orange-400 bg-orange-950/20 border border-orange-500/20 text-[10px] font-bold px-2 py-0.5 rounded font-mono">HIGH</span>;
      case 'MEDIUM':
        return <span className="text-yellow-500 bg-yellow-950/20 border border-yellow-500/20 text-[10px] font-bold px-2 py-0.5 rounded font-mono">MEDIUM</span>;
      case 'LOW':
        return <span className="text-sky-400 bg-sky-950/20 border border-sky-500/20 text-[10px] font-bold px-2 py-0.5 rounded font-mono">LOW</span>;
      default:
        return <span className="text-slate-400 bg-slate-900 border border-slate-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">INFO</span>;
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'NEW':
        return 'text-red-400 border-red-500/20 bg-red-950/15 shadow-glow-red';
      case 'INVESTIGATING':
        return 'text-yellow-500 border-yellow-500/20 bg-yellow-950/15';
      case 'ACKNOWLEDGED':
        return 'text-sky-400 border-sky-500/20 bg-sky-950/15';
      case 'RESOLVED':
        return 'text-emerald-400 border-emerald-500/20 bg-emerald-950/15 shadow-glow-emerald';
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toTimeString().split(' ')[0]}`;
  };

  return (
    <div className="space-y-4 animate-fade-in text-slate-300 font-mono">
      
      {/* Overview Container */}
      <div className="bg-[#11151d] border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-sans">Incident Grouping Console</h3>
        <p className="text-[11px] text-slate-500 mt-1 font-sans">
          Review aggregated operational logs representing consolidated, actionable incident profiles.
        </p>
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {incidents.length > 0 ? (
          incidents.map((incident) => {
            const isExpanded = expandedId === incident.id;
            
            return (
              <div 
                key={incident.id} 
                className={`bg-[#11151d] border rounded-2xl overflow-hidden transition duration-150 shadow-md ${
                  isExpanded ? 'border-cyan-500/40 shadow-glow-cyan' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header Row */}
                <div 
                  onClick={() => toggleExpand(incident.id)}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none animate-fade-in"
                >
                  <div className="flex items-center space-x-3.5">
                    
                    {/* Status dot */}
                    <span className={`w-2 h-2 rounded-full ${incident.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />

                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-xs font-mono font-bold text-cyan-400">#{incident.id}</span>
                        <h4 className="text-sm font-bold text-white font-sans">{incident.name}</h4>
                        {getSeverityBadge(incident.severity)}
                      </div>
                      
                      <div className="flex items-center space-x-3 text-[10px] text-slate-500 mt-1.5 font-mono">
                        <span className="flex items-center space-x-1">
                          <Server size={11} className="text-slate-600" />
                          <span className="font-semibold text-slate-400">{incident.service}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock size={11} className="text-slate-600" />
                          <span>Updated {formatDate(incident.lastUpdated)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-400 flex items-center space-x-1.5 shadow-inner">
                        <Layers size={11} className="text-slate-550" />
                        <span className="font-bold">{incident.alertCount} events</span>
                      </span>
                    </div>

                    {/* Status selector */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <select
                        value={incident.status}
                        onChange={(e) => onUpdateIncidentStatus(incident.id, e.target.value as IncidentStatus)}
                        className={`text-[10px] font-bold border rounded-lg py-1 px-2.5 focus:outline-none cursor-pointer font-sans ${getStatusColor(incident.status)}`}
                      >
                        <option value="NEW" className="bg-[#11151d] text-slate-300">NEW</option>
                        <option value="INVESTIGATING" className="bg-[#11151d] text-slate-300">INVESTIGATING</option>
                        <option value="ACKNOWLEDGED" className="bg-[#11151d] text-slate-300">ACKED</option>
                        <option value="RESOLVED" className="bg-[#11151d] text-slate-300">RESOLVED</option>
                      </select>
                    </div>

                    <div className="text-slate-500 hidden md:block">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Pane */}
                {isExpanded && (
                  <div className="border-t border-slate-800 bg-slate-950/45 p-5 space-y-5">
                    
                    <div className="bg-[#161a22] border border-slate-800 rounded-xl p-3.5 text-[11px] text-slate-400 leading-relaxed font-sans">
                      🚀 <strong className="text-cyan-400">{incident.alertCount} redundant alerts</strong> consolidated under Incident #{incident.id}, reducing developer notification spam.
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Left: Grouped targets list */}
                      <div className="space-y-2">
                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
                          <Server size={11} className="text-cyan-400" />
                          <span>Grouped Nodes ({incident.alerts.length})</span>
                        </h5>
                        
                        <div className="border border-slate-800 bg-slate-950 rounded-xl overflow-hidden max-h-56 overflow-y-auto shadow-inner">
                          <table className="w-full text-left text-[10px] border-collapse font-mono">
                            <thead>
                              <tr className="border-b border-slate-800 text-[9px] text-slate-500 bg-[#0c0f16] select-none">
                                <th className="py-2.5 px-3">TIME</th>
                                <th className="py-2.5 px-3">NODE</th>
                                <th className="py-2.5 px-3">PAYLOAD</th>
                                <th className="py-2.5 px-3">STATUS</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-850/80 text-slate-400">
                              {incident.alerts.map((alt) => (
                                <tr key={alt.id} className="hover:bg-slate-900/30 transition">
                                  <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{alt.timeFormatted}</td>
                                  <td className="py-2 px-3 font-semibold text-slate-300 whitespace-nowrap">{alt.instance}</td>
                                  <td className="py-2 px-3 text-[9px] truncate max-w-[120px] text-slate-400">{alt.alertName}: {alt.message}</td>
                                  <td className="py-2 px-3 whitespace-nowrap">
                                    <span className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850 text-slate-450 uppercase font-semibold">
                                      {alt.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right: History Timeline */}
                      <div className="space-y-2">
                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
                          <Clock size={11} className="text-slate-500" />
                          <span>Routing Timeline Sequence</span>
                        </h5>

                        <div className="border border-slate-800 bg-slate-950 rounded-xl p-3.5 max-h-56 overflow-y-auto relative space-y-3 font-mono text-[10px] shadow-inner">
                          <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-slate-850"></div>
                          
                          {incident.timeline.map((event, idx) => (
                            <div key={idx} className="flex items-start space-x-3 relative z-10">
                              <span className="text-slate-500 pt-0.5 w-12 text-right">{event.time}</span>
                              <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-glow-cyan" />
                              </div>
                              <span className="text-slate-400 flex-1 leading-normal font-sans">{event.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Metadata line */}
                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono pt-1">
                      <span>Targets: {incident.affectedInstances.join(', ')}</span>
                      <span>UUID: {incident.id}-{incident.service.replace(/\s+/g, '-').toLowerCase()}</span>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-[#11151d] border border-slate-800 rounded-2xl p-8 text-center text-slate-500 font-mono text-xs shadow-lg">
            No incidents compiled. Run telemetry simulation.
          </div>
        )}
      </div>
    </div>
  );
};
