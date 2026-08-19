import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Alert, Severity, AlertStatus } from '../utils/engine';

interface LiveAlertsTabProps {
  alerts: Alert[];
}

export const LiveAlertsTab: React.FC<LiveAlertsTabProps> = ({ alerts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filters logic
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.instance.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.alertName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.incidentId && alert.incidentId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || alert.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAlerts.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Severity badges
  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="text-red-400 bg-red-950/20 border border-red-500/20 text-[10px] font-bold px-2 py-0.5 rounded font-mono shadow-glow-red">CRITICAL</span>;
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

  // Status badges
  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'NEW':
        return <span className="text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono shadow-glow-emerald">NEW</span>;
      case 'SUPPRESSED':
        return <span className="text-slate-500 bg-[#161b25] border border-slate-850 text-[9px] font-semibold px-1.5 py-0.5 rounded font-mono opacity-80">SUPPRESSED</span>;
      case 'GROUPED':
        return <span className="text-indigo-400 bg-indigo-950/20 border border-indigo-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono shadow-glow-violet">GROUPED</span>;
      default:
        return <span className="text-red-400 bg-red-950/20 border border-red-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">BYPASSED</span>;
    }
  };

  return (
    <div className="bg-[#11151d] border border-slate-800 rounded-2xl p-6 space-y-5 animate-fade-in text-slate-300 shadow-lg font-mono">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-sans">Telemetry Alert Stream</h3>
          <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
            Real-time telemetry log filterable by severity and engine state status.
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search stream..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-300 placeholder-slate-600 w-44 font-sans"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs shadow-inner">
            <span className="text-[10px] text-slate-500 font-semibold uppercase font-sans">Severity</span>
            <select
              value={severityFilter}
              onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent focus:outline-none text-slate-350 pr-1 cursor-pointer font-bold border-none"
            >
              <option value="ALL" className="bg-[#11151d] text-slate-300">All</option>
              <option value="CRITICAL" className="bg-[#11151d] text-slate-300">Critical</option>
              <option value="HIGH" className="bg-[#11151d] text-slate-300">High</option>
              <option value="MEDIUM" className="bg-[#11151d] text-slate-300">Medium</option>
              <option value="LOW" className="bg-[#11151d] text-slate-300">Low</option>
              <option value="INFO" className="bg-[#11151d] text-slate-300">Info</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs shadow-inner">
            <span className="text-[10px] text-slate-500 font-semibold uppercase font-sans">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent focus:outline-none text-slate-355 pr-1 cursor-pointer font-bold border-none"
            >
              <option value="ALL" className="bg-[#11151d] text-slate-300">All</option>
              <option value="NEW" className="bg-[#11151d] text-slate-300">New</option>
              <option value="SUPPRESSED" className="bg-[#11151d] text-slate-300">Suppressed</option>
              <option value="GROUPED" className="bg-[#11151d] text-slate-300">Grouped</option>
              <option value="BYPASSED" className="bg-[#11151d] text-slate-300">Bypassed</option>
            </select>
          </div>

        </div>
      </div>

      {/* Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40 shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-950/85 select-none">
                <th className="py-3 px-4 w-24">Time</th>
                <th className="py-3 px-4 w-36">Service</th>
                <th className="py-3 px-4 w-32">Instance</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 w-28">Severity</th>
                <th className="py-3 px-4 w-28">Status</th>
                <th className="py-3 px-4 w-24">Incident</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/80 text-slate-350">
              {currentItems.length > 0 ? (
                currentItems.map((alert) => (
                  <tr 
                    key={alert.id} 
                    className={`hover:bg-slate-900/35 transition duration-75 ${
                      alert.status === 'SUPPRESSED' ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-[10px] text-slate-500 whitespace-nowrap">
                      {alert.timeFormatted}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-200">
                      {alert.service}
                    </td>
                    <td className="py-3 px-4 text-[10px] text-slate-500 whitespace-nowrap">
                      {alert.instance}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-bold text-slate-350 font-mono text-xs">{alert.alertName}</div>
                      <div className="text-[11px] text-slate-500 truncate w-60 mt-0.5" title={alert.message}>
                        {alert.message}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getSeverityBadge(alert.severity)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(alert.status)}
                    </td>
                    <td className="py-3 px-4 text-[10px] whitespace-nowrap">
                      {alert.incidentId ? (
                        <span className="text-cyan-400 font-bold bg-cyan-950/20 border border-cyan-800/30 px-1.5 py-0.5 rounded shadow-glow-cyan">
                          #{alert.incidentId}
                        </span>
                      ) : (
                        <span className="text-slate-700">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-650 font-semibold">
                    No matching telemetry logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-sans pt-1">
        <div>
          Showing <span className="text-slate-300 font-mono font-bold">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAlerts.length)}</span> of {filteredAlerts.length} alerts
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 rounded-lg disabled:opacity-30 disabled:hover:bg-slate-950 transition cursor-pointer"
          >
            <ChevronLeft size={13} />
          </button>
          <span className="font-mono text-slate-350 font-semibold">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 rounded-lg disabled:opacity-30 disabled:hover:bg-slate-950 transition cursor-pointer"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

    </div>
  );
};
