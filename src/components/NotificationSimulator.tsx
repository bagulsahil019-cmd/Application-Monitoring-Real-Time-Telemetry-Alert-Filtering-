import React from 'react';
import { 
  Slack, 
  ShieldAlert, 
  Mail,
  MessageSquareCode,
  BellRing
} from 'lucide-react';
import { NotificationLog } from '../utils/engine';

interface NotificationSimulatorProps {
  notifications: NotificationLog[];
  filteredCount: number;
}

export const NotificationSimulator: React.FC<NotificationSimulatorProps> = ({
  notifications,
  filteredCount,
}) => {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'Slack':
        return <Slack size={10} className="text-pink-400" />;
      case 'PagerDuty':
        return <ShieldAlert size={10} className="text-red-405" />;
      case 'Discord':
        return <MessageSquareCode size={10} className="text-indigo-400" />;
      default:
        return <Mail size={10} className="text-slate-450" />;
    }
  };

  return (
    <div className="min-card p-4 flex flex-col h-full space-y-4 text-slate-200">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
            <BellRing size={13} className="text-emerald-500" />
            <span>Router Console</span>
          </h4>
          
          <div className="flex items-center space-x-1.5 bg-[#0e0f11] border border-[#1b1c1e] px-2 py-0.5 rounded text-[10px]">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            <span className="text-slate-400 font-bold font-mono text-[9px]">ACTIVE</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 mt-1 leading-normal font-sans">
          Log of incident signals routed downstream to external webhooks.
        </p>
      </div>

      {/* Integration Statuses (Simple Dot Indicators) */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-[#0c0d0f] p-2.5 rounded-lg border border-[#1b1c1e]">
        {/* Slack */}
        <div className="flex items-center justify-between border-b border-[#1b1c1e]/60 pb-1.5">
          <div className="flex items-center space-x-1 text-slate-450">
            <Slack size={10} className="text-pink-400" />
            <span>Slack</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            <span className="text-slate-550 font-bold text-[9px]">OK</span>
          </div>
        </div>
        
        {/* PagerDuty */}
        <div className="flex items-center justify-between border-b border-[#1b1c1e]/60 pb-1.5">
          <div className="flex items-center space-x-1 text-slate-455">
            <ShieldAlert size={10} className="text-red-400" />
            <span>PagerDuty</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            <span className="text-slate-550 font-bold text-[9px]">OK</span>
          </div>
        </div>

        {/* Discord */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-1 text-slate-455">
            <MessageSquareCode size={10} className="text-indigo-400" />
            <span>Discord</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            <span className="text-slate-550 font-bold text-[9px]">OK</span>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-1 text-slate-455">
            <Mail size={10} className="text-sky-400" />
            <span>Email</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            <span className="text-slate-550 font-bold text-[9px]">OK</span>
          </div>
        </div>
      </div>

      {/* Flat logging feed (Monospace terminal logs) */}
      <div className="bg-[#0c0d0f] border border-[#1b1c1e] rounded-lg p-3 flex-1 min-h-[260px] max-h-[440px] overflow-y-auto space-y-2.5 font-mono text-[10px] text-slate-400">
        {notifications.length > 0 ? (
          notifications.map((log) => (
            <div 
              key={log.id} 
              className={`p-2.5 rounded border transition ${
                log.isBypassed 
                  ? 'border-red-500/20 bg-red-950/10 text-red-300' 
                  : 'border-[#1b1c1e] bg-[#111215] text-slate-350'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] text-slate-550">{log.timeFormatted}</span>
                {/* Monospace lowercase label tag for sinks */}
                <span className="font-mono text-[9px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-450 border border-[#1b1c1e] flex items-center space-x-1 leading-none">
                  {getChannelIcon(log.channel)}
                  <span>{log.channel.toLowerCase()}</span>
                </span>
              </div>
              
              {log.isBypassed && (
                <div className="text-[8px] text-red-400 font-extrabold uppercase mb-1 tracking-wider">
                  ⚠️ CRITICAL BYPASS
                </div>
              )}

              {/* Fixed INC_ INC-XXXX prefix bug */}
              <div className="font-bold text-slate-300">
                {log.incidentId} / {log.incidentName.toUpperCase()}
              </div>
              <div className="text-[8px] text-slate-500 mt-1 font-sans">
                BUS: {log.service} | STATUS: DELIVERED
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-center text-slate-650 text-[9px] py-20 font-sans">
            Awaiting router alerts...
          </div>
        )}
      </div>

    </div>
  );
};
