import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Layers, 
  Sliders, 
  BarChart3, 
  Radio
} from 'lucide-react';

import { 
  AlertEngine, 
  Alert, 
  Incident, 
  NotificationLog, 
  IncidentStatus, 
  CooldownConfig, 
  SmartRule, 
  DEFAULT_COOLDOWNS, 
  DEFAULT_RULES, 
  generateRandomAlert, 
  generateCriticalFailureAlert,
  getFormattedTime
} from './utils/engine';

import { DashboardTab } from './components/DashboardTab';
import { LiveAlertsTab } from './components/LiveAlertsTab';
import { IncidentsTab } from './components/IncidentsTab';
import { RulesTab } from './components/RulesTab';
import { AnalyticsTab } from './components/AnalyticsTab';

type Tab = 'dashboard' | 'live-alerts' | 'incidents' | 'rules' | 'analytics';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Instantiating the Alert Filtering Engine
  const engineRef = useRef<AlertEngine>(new AlertEngine());
  
  // React State containing engine state
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [incomingCount, setIncomingCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [notificationSentCount, setNotificationSentCount] = useState(0);
  
  // Cooldown and Rules Config state
  const [cooldowns, setCooldowns] = useState<CooldownConfig>(DEFAULT_COOLDOWNS);
  const [rules, setRules] = useState<SmartRule[]>(DEFAULT_RULES);

  // Initialize engine with mock data for instant visualization
  useEffect(() => {
    const engine = engineRef.current;
    engine.seedMockHistory(220); // Seeding 220 historical alerts
    
    // Initial State Pull
    syncStateWithEngine();
  }, []);

  const syncStateWithEngine = () => {
    const engine = engineRef.current;
    setAlerts([...engine.getAlerts()]);
    setIncidents([...engine.getIncidents()]);
    setIncomingCount(engine.incomingCount);
    setFilteredCount(engine.filteredCount);
    setNotificationSentCount(engine.notificationSentCount);
  };

  // Process a single raw alert payload
  const processAlert = (raw: Partial<Alert>) => {
    engineRef.current.processIncoming(raw);
    syncStateWithEngine();
  };

  // Live Background Simulator Timer (1 Alert every 4-6 seconds)
  useEffect(() => {
    if (isSimulating) return; // Pause ambient feed during high-freq storms

    const triggerAmbientAlert = () => {
      const payload = generateRandomAlert();
      processAlert(payload);
      
      // Reschedule next check
      const nextDelay = 4000 + Math.random() * 3000; // 4 to 7 seconds
      ambientTimerRef.current = setTimeout(triggerAmbientAlert, nextDelay);
    };

    const ambientTimerRef = { current: setTimeout(triggerAmbientAlert, 3000) };

    return () => {
      clearTimeout(ambientTimerRef.current);
    };
  }, [isSimulating]);

  // Control Triggers
  const handleGenerateSingleAlert = () => {
    const payload = generateRandomAlert();
    processAlert(payload);
  };

  const handleSimulateStorm = () => {
    if (isSimulating) return;
    setIsSimulating(true);

    const stormAlerts: Partial<Alert>[] = [];

    const pushTemplate = (alertName: string, service: string, message: string, severity: 'CRITICAL'|'HIGH'|'MEDIUM'|'LOW'|'INFO', count: number) => {
      for (let i = 0; i < count; i++) {
        const instanceId = `node-0${Math.floor(Math.random() * 5) + 1}`;
        stormAlerts.push({
          service,
          instance: `${service.toLowerCase().replace(/\s+/g, '-')}-${instanceId}`,
          alertName,
          message: `${message} (${instanceId})`,
          severity,
        });
      }
    };

    pushTemplate('CPU spike', 'Payment Service', 'High CPU load on transaction API', 'MEDIUM', 150);
    pushTemplate('Memory usage high', 'Authentication Service', 'Memory leak detected in Session Store', 'MEDIUM', 120);
    pushTemplate('HTTP 500 errors', 'Frontend Web App', 'Internal gateway communication failure', 'HIGH', 100);
    pushTemplate('High API latency', 'API Gateway', 'Edge response timeout latency 1920ms', 'LOW', 80);
    pushTemplate('Database connection timeout', 'Database Cluster', 'Postgres connection pool limit exhausted', 'HIGH', 50);

    const shuffledAlerts = stormAlerts.sort(() => Math.random() - 0.5);

    let batchIndex = 0;
    const batchSize = 20;

    const intervalId = setInterval(() => {
      const sliceStart = batchIndex * batchSize;
      const sliceEnd = sliceStart + batchSize;
      const batch = shuffledAlerts.slice(sliceStart, sliceEnd);

      if (batch.length === 0) {
        clearInterval(intervalId);
        setIsSimulating(false);
        return;
      }

      batch.forEach(alert => {
        engineRef.current.processIncoming(alert);
      });
      syncStateWithEngine();
      batchIndex++;
    }, 100);
  };

  const handleSimulateCritical = () => {
    const payload = generateCriticalFailureAlert();
    processAlert(payload);
  };

  const handleClearAll = () => {
    engineRef.current.clearAll();
    syncStateWithEngine();
  };

  const handleResetDemo = () => {
    const engine = engineRef.current;
    engine.seedMockHistory(220);
    setCooldowns(DEFAULT_COOLDOWNS);
    setRules(DEFAULT_RULES);
    engine.updateCooldowns(DEFAULT_COOLDOWNS);
    engine.updateRules(DEFAULT_RULES);
    syncStateWithEngine();
  };

  const handleUpdateIncidentStatus = (id: string, newStatus: IncidentStatus) => {
    const incident = engineRef.current.getIncidents().find(inc => inc.id === id);
    if (incident) {
      incident.status = newStatus;
      incident.timeline.unshift({
        time: getFormattedTime(),
        message: `Incident marked as ${newStatus} by on-call engineer`,
      });
      syncStateWithEngine();
    }
  };

  const handleApplyCooldowns = (newCooldowns: CooldownConfig) => {
    engineRef.current.updateCooldowns(newCooldowns);
    setCooldowns(newCooldowns);
  };

  const handleToggleRule = (ruleId: string) => {
    const updatedRules = rules.map(rule => {
      if (rule.id === ruleId) {
        return { ...rule, enabled: !rule.enabled };
      }
      return rule;
    });
    setRules(updatedRules);
    engineRef.current.updateRules(updatedRules);
  };

  // Determine system health state
  const systemStatus = useMemo(() => {
    const activeCritical = incidents.filter(i => i.status !== 'RESOLVED' && i.severity === 'CRITICAL');
    if (activeCritical.length > 0) return 'DEGRADED';
    return 'OPERATIONAL';
  }, [incidents]);

  return (
    <div className="flex flex-col min-h-screen bg-[#07090e] text-slate-350 antialiased pb-20 font-sans">
      
      {/* Dark Header Console */}
      <header className="border-b border-slate-800/80 bg-[#11151d]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between shadow-lg">
        
        {/* Logo */}
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="text-emerald-400 bg-emerald-950/30 p-1.5 rounded-lg border border-emerald-500/25">
            <Radio size={16} />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white font-sans">NoiseFilter</span>
            <span className="text-[10px] block text-slate-500 font-mono tracking-wider leading-none">Telemetry Proxy</span>
          </div>
        </div>

        {/* Console Navigation */}
        <nav className="hidden md:flex items-center space-x-1.5 text-xs font-semibold text-slate-400">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-1.5 py-1.5 px-3.5 rounded-lg transition ${
              activeTab === 'dashboard' 
                ? 'bg-[#1a212d] border border-slate-700 text-white shadow-glow-cyan' 
                : 'hover:text-white hover:bg-[#151a24]'
            }`}
          >
            <LayoutDashboard size={13} />
            <span>Dashboard</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('live-alerts')}
            className={`flex items-center space-x-1.5 py-1.5 px-3.5 rounded-lg transition ${
              activeTab === 'live-alerts' 
                ? 'bg-[#1a212d] border border-slate-700 text-white shadow-glow-cyan' 
                : 'hover:text-white hover:bg-[#151a24]'
            }`}
          >
            <Activity size={13} />
            <span>Live Alerts</span>
          </button>

          <button 
            onClick={() => setActiveTab('incidents')}
            className={`flex items-center space-x-1.5 py-1.5 px-3.5 rounded-lg transition ${
              activeTab === 'incidents' 
                ? 'bg-[#1a212d] border border-slate-700 text-white shadow-glow-cyan' 
                : 'hover:text-white hover:bg-[#151a24]'
            }`}
          >
            <Layers size={13} />
            <span>Incidents</span>
          </button>

          <button 
            onClick={() => setActiveTab('rules')}
            className={`flex items-center space-x-1.5 py-1.5 px-3.5 rounded-lg transition ${
              activeTab === 'rules' 
                ? 'bg-[#1a212d] border border-slate-700 text-white shadow-glow-cyan' 
                : 'hover:text-white hover:bg-[#151a24]'
            }`}
          >
            <Sliders size={13} />
            <span>Rules</span>
          </button>

          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-1.5 py-1.5 px-3.5 rounded-lg transition ${
              activeTab === 'analytics' 
                ? 'bg-[#1a212d] border border-slate-700 text-white shadow-glow-cyan' 
                : 'hover:text-white hover:bg-[#151a24]'
            }`}
          >
            <BarChart3 size={13} />
            <span>Analytics</span>
          </button>
        </nav>

        {/* Header Right */}
        <div className="flex items-center space-x-2.5 text-xs">
          
          {/* Latency Indicator */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-lg text-cyan-400 font-mono text-[10px] font-bold shadow-inner">
            <span>⚡ 2.51ms</span>
          </div>

          {/* Toggle Simulation Desk */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center space-x-1.5 transition ${
              isDrawerOpen 
                ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-400 shadow-glow-cyan' 
                : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <span>Simulation Desk</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-orange-500 animate-pulse' : 'bg-slate-500'}`}></span>
          </button>

          {/* System Status */}
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg shadow-inner">
            <span className={`w-1.5 h-1.5 rounded-full ${
              systemStatus === 'DEGRADED' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
            }`} />
            <span className="font-mono text-[10px] text-slate-500 font-bold uppercase">{systemStatus}</span>
          </div>
        </div>

      </header>

      {/* Main Spacious Workspace (Full width screen render) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        
        {activeTab === 'dashboard' && (
          <DashboardTab 
            alerts={alerts}
            incidents={incidents}
            incomingCount={incomingCount}
            filteredCount={filteredCount}
            notificationSentCount={notificationSentCount}
          />
        )}

        {activeTab === 'live-alerts' && (
          <LiveAlertsTab alerts={alerts} />
        )}

        {activeTab === 'incidents' && (
          <IncidentsTab 
            incidents={incidents} 
            onUpdateIncidentStatus={handleUpdateIncidentStatus} 
          />
        )}

        {activeTab === 'rules' && (
          <RulesTab 
            cooldowns={cooldowns}
            rules={rules}
            onApplyCooldowns={handleApplyCooldowns}
            onToggleRule={handleToggleRule}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab 
            alerts={alerts}
            incidents={incidents}
            incomingCount={incomingCount}
            filteredCount={filteredCount}
          />
        )}

      </main>

      {/* Collapsible Bottom Drawer */}
      {isDrawerOpen && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0b0e14]/95 backdrop-blur-md border-t border-slate-850 py-4 px-6 z-50 animate-slide-in shadow-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 font-sans text-xs">
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/20 border border-cyan-900/30 px-2 py-0.5 rounded">SIMULATION CONTROL DECK</span>
            <span className="text-[11px] text-slate-500">Trigger synthetic telemetry bursts to verify rules.</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={handleGenerateSingleAlert}
              disabled={isSimulating}
              className="bg-slate-950 hover:bg-[#151922] border border-slate-800 text-slate-300 font-semibold py-1.5 px-3 rounded-lg text-xs transition disabled:opacity-50"
            >
              Single Alert
            </button>
            <button 
              onClick={handleSimulateStorm}
              disabled={isSimulating}
              className="bg-cyan-700 hover:bg-cyan-600 text-white font-semibold py-1.5 px-4 rounded-lg text-xs transition disabled:opacity-50 shadow-glow-cyan"
            >
              {isSimulating ? "Streaming Storm..." : "Simulate Storm"}
            </button>
            <button 
              onClick={handleSimulateCritical}
              disabled={isSimulating}
              className="bg-red-950/20 border border-red-900/30 hover:bg-red-950/40 text-red-400 font-semibold py-1.5 px-3 rounded-lg text-xs transition disabled:opacity-50"
            >
              Critical Outage
            </button>
            
            <div className="h-4 w-[1px] bg-slate-800 mx-1"></div>

            <button 
              onClick={handleClearAll}
              className="bg-transparent hover:bg-slate-900 text-slate-550 hover:text-slate-300 py-1.5 px-2.5 rounded-lg border border-slate-850 text-[9px] uppercase font-bold transition"
            >
              Clear
            </button>
            <button 
              onClick={handleResetDemo}
              className="bg-transparent hover:bg-slate-900 text-slate-550 hover:text-slate-300 py-1.5 px-2.5 rounded-lg border border-slate-850 text-[9px] uppercase font-bold transition"
            >
              Reset
            </button>
          </div>

          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="text-[11px] text-slate-500 hover:text-slate-300 font-semibold cursor-pointer"
          >
            Hide Controls
          </button>
        </div>
      )}

      {/* Modern, Flat Footer */}
      <footer className="border-t border-slate-850 py-6 px-6 mt-8 bg-[#11151d] shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 font-sans">
          <span>© 2026 NoiseFilter Telemetry Coprocessor Middleware.</span>
          <span className="flex items-center space-x-2 mt-2 md:mt-0 font-mono text-[10px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>All downstream notification endpoints online</span>
          </span>
        </div>
      </footer>

    </div>
  );
}
