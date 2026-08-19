import React, { useState } from 'react';
import { ShieldCheck, Sliders, Save, Info } from 'lucide-react';
import { CooldownConfig, SmartRule } from '../utils/engine';

interface RulesTabProps {
  cooldowns: CooldownConfig;
  rules: SmartRule[];
  onApplyCooldowns: (newCooldowns: CooldownConfig) => void;
  onToggleRule: (ruleId: string) => void;
}

export const RulesTab: React.FC<RulesTabProps> = ({
  cooldowns,
  rules,
  onApplyCooldowns,
  onToggleRule,
}) => {
  const [criticalCD, setCriticalCD] = useState(cooldowns.CRITICAL);
  const [highCD, setHighCD] = useState(cooldowns.HIGH);
  const [mediumCD, setMediumCD] = useState(cooldowns.MEDIUM);
  const [lowCD, setLowCD] = useState(cooldowns.LOW);
  const [infoCD, setInfoCD] = useState(cooldowns.INFO);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveCooldowns = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyCooldowns({
      CRITICAL: Number(criticalCD),
      HIGH: Number(highCD),
      MEDIUM: Number(mediumCD),
      LOW: Number(lowCD),
      INFO: Number(infoCD),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-slate-300 font-mono">
      
      {/* Left Column: Cooldown Policy table */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-[#11151d] border border-slate-800 rounded-2xl p-6 shadow-lg">
          
          <div className="flex items-center space-x-2 mb-4">
            <Sliders size={15} className="text-cyan-400 shadow-glow-cyan" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-sans">Cooldown Configuration</h3>
          </div>
          
          <p className="text-[11px] text-slate-500 mb-5 font-sans">
            Configure the suppression delay (seconds) for duplicate alerts before triggering a new notification.
          </p>

          <form onSubmit={handleSaveCooldowns} className="space-y-4">
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40 shadow-inner animate-fade-in">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-950 select-none">
                    <th className="py-2.5 px-4">Severity</th>
                    <th className="py-2.5 px-4 w-28">Cooldown (s)</th>
                    <th className="py-2.5 px-4">Policy Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/80 text-slate-350 font-mono text-[11px]">
                  
                  {/* Critical */}
                  <tr className="hover:bg-slate-900/20">
                    <td className="py-2.5 px-4 text-red-400 font-bold flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-glow-red"></span>
                      <span>CRITICAL</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <input 
                        type="number" 
                        value={criticalCD}
                        onChange={(e) => setCriticalCD(Math.max(0, Number(e.target.value)))}
                        className="w-16 bg-slate-950 border border-slate-800 text-slate-100 rounded px-2 py-0.5 text-xs text-center focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 font-sans text-[10px]">Bypass suppression filters entirely</td>
                  </tr>

                  {/* High */}
                  <tr className="hover:bg-slate-900/20">
                    <td className="py-2.5 px-4 text-orange-400 font-bold flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                      <span>HIGH</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <input 
                        type="number" 
                        value={highCD}
                        onChange={(e) => setHighCD(Math.max(0, Number(e.target.value)))}
                        className="w-16 bg-slate-950 border border-slate-800 text-slate-100 rounded px-2 py-0.5 text-xs text-center focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 font-sans text-[10px]">Consolidate logs, alert within 30s</td>
                  </tr>

                  {/* Medium */}
                  <tr className="hover:bg-slate-900/20">
                    <td className="py-2.5 px-4 text-yellow-500 font-bold flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                      <span>MEDIUM</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <input 
                        type="number" 
                        value={mediumCD}
                        onChange={(e) => setMediumCD(Math.max(0, Number(e.target.value)))}
                        className="w-16 bg-slate-950 border border-slate-800 text-slate-100 rounded px-2 py-0.5 text-xs text-center focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 font-sans text-[10px]">Deduplicate duplicate triggers</td>
                  </tr>

                  {/* Low */}
                  <tr className="hover:bg-slate-900/20">
                    <td className="py-2.5 px-4 text-sky-400 font-bold flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-glow-cyan"></span>
                      <span>LOW</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <input 
                        type="number" 
                        value={lowCD}
                        onChange={(e) => setLowCD(Math.max(0, Number(e.target.value)))}
                        className="w-16 bg-slate-950 border border-slate-800 text-slate-100 rounded px-2 py-0.5 text-xs text-center focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 font-sans text-[10px]">Silently stack in incident timeline</td>
                  </tr>

                  {/* Info */}
                  <tr className="hover:bg-slate-900/20">
                    <td className="py-2.5 px-4 text-slate-500 font-bold flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                      <span>INFO</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <input 
                        type="number" 
                        value={infoCD}
                        onChange={(e) => setInfoCD(Math.max(0, Number(e.target.value)))}
                        className="w-16 bg-slate-950 border border-slate-800 text-slate-100 rounded px-2 py-0.5 text-xs text-center focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 font-sans text-[10px]">Silent capture, no notifications</td>
                  </tr>

                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-[11px] font-sans">
              <span className="text-slate-500 flex items-center space-x-1.5">
                <Info size={12} className="text-slate-600" />
                <span>Adjust thresholds to calibrate noise tolerance</span>
              </span>
              <button 
                type="submit"
                className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-1.5 px-4 rounded-lg text-xs transition shadow-glow-cyan cursor-pointer"
              >
                Apply Rules
              </button>
            </div>

            {saveSuccess && (
              <div className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 p-2 rounded-lg text-[10px] text-center font-semibold font-sans shadow-glow-emerald">
                ✓ Cooldown policy matrices updated in engine registry
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Right Column: Smart Rules */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-[#11151d] border border-slate-800 rounded-2xl p-6 shadow-lg">
          
          <div className="flex items-center space-x-2 mb-4">
            <ShieldCheck size={15} className="text-cyan-400 shadow-glow-cyan" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-sans">Smart Heuristic Filters</h3>
          </div>
          
          <p className="text-[11px] text-slate-550 mb-5 font-sans">
            Enable or disable intelligent edge filters to escalate critical systems or suppress transient spikes.
          </p>

          <div className="space-y-3 font-sans">
            {rules.map((rule) => (
              <div 
                key={rule.id}
                onClick={() => onToggleRule(rule.id)}
                className={`border rounded-xl p-3.5 flex items-start justify-between cursor-pointer select-none transition ${
                  rule.enabled ? 'bg-slate-950/40 border-cyan-800/30' : 'border-slate-850 opacity-60 hover:opacity-85'
                }`}
              >
                <div className="space-y-1.5 pr-4">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className={`text-[8px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-md ${
                      rule.type === 'suppress' 
                        ? 'bg-orange-950/20 text-orange-400 border border-orange-500/20' 
                        : rule.type === 'bypass'
                        ? 'bg-red-950/20 text-red-405 border border-red-500/20 shadow-glow-red'
                        : 'bg-indigo-950/20 text-indigo-400 border border-indigo-500/20 shadow-glow-violet'
                    }`}>
                      {rule.type}
                    </span>
                    <h4 className="text-xs font-bold text-slate-350 font-mono">{rule.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">{rule.description}</p>
                </div>
                
                {/* Switch toggles */}
                <div className="flex-shrink-0 pt-1">
                  <div 
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
                      rule.enabled ? 'bg-cyan-650 shadow-glow-cyan' : 'bg-slate-800'
                    }`}
                  >
                    <div 
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        rule.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>

              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-[9px] text-slate-550 font-mono">
            <span>RULE_HEURISTICS: STRICT</span>
            <span>SYSTEM_POLICY_V1</span>
          </div>

        </div>
      </div>

    </div>
  );
};
