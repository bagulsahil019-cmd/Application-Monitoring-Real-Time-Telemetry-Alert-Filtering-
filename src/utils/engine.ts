// Types for Alert, Incident, and Engine configuration

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type AlertStatus = 'NEW' | 'SUPPRESSED' | 'GROUPED' | 'BYPASSED';
export type IncidentStatus = 'NEW' | 'INVESTIGATING' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface Alert {
  id: string;
  timestamp: string; // ISO string
  timeFormatted: string; // HH:MM:SS
  service: string;
  instance: string;
  alertName: string;
  message: string;
  severity: Severity;
  status: AlertStatus;
  incidentId: string | null;
}

export interface IncidentTimelineEvent {
  time: string; // HH:MM:SS
  message: string;
}

export interface Incident {
  id: string;
  name: string;
  service: string;
  severity: Severity;
  firstDetected: string;
  lastUpdated: string;
  alertCount: number;
  affectedInstances: string[];
  status: IncidentStatus;
  timeline: IncidentTimelineEvent[];
  alerts: Alert[];
}

export interface CooldownConfig {
  CRITICAL: number; // in seconds
  HIGH: number;
  MEDIUM: number;
  LOW: number;
  INFO: number;
}

export interface SmartRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'suppress' | 'incident' | 'escalate' | 'bypass';
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  timeFormatted: string;
  incidentId: string;
  incidentName: string;
  service: string;
  severity: Severity;
  channel: 'Slack' | 'PagerDuty' | 'Discord' | 'Email';
  status: string;
  isBypassed: boolean;
}

// Default Cooldown Matrix (in seconds)
export const DEFAULT_COOLDOWNS: CooldownConfig = {
  CRITICAL: 0,    // Notify immediately
  HIGH: 30,       // Group similar alerts
  MEDIUM: 120,    // Suppress duplicates
  LOW: 300,       // Aggregate
  INFO: 600,      // Suppress
};

// Default Smart Rules
export const DEFAULT_RULES: SmartRule[] = [
  {
    id: 'rule-cpu-transient',
    name: 'Suppress Transient CPU Spikes (< 5s)',
    description: 'Ignore CPU spike alerts if they last less than 5 seconds (simulated as noise).',
    enabled: true,
    type: 'suppress',
  },
  {
    id: 'rule-cpu-sustained',
    name: 'Sustained CPU Spike Alert',
    description: 'Create an incident if CPU usage remains > 90% for more than 30 seconds.',
    enabled: true,
    type: 'incident',
  },
  {
    id: 'rule-http-high-rate',
    name: 'HTTP 500 High Frequency Escalation',
    description: 'Escalate HTTP 500 error spikes (> 20 req/min) to HIGH severity incident.',
    enabled: true,
    type: 'escalate',
  },
  {
    id: 'rule-db-unreachable',
    name: 'Immediate Database Outage Notification',
    description: 'Database connection failure bypasses all filters and notifies CRITICAL immediately.',
    enabled: true,
    type: 'bypass',
  },
];

// List of possible services and instances
export const SERVICES_CONFIG = [
  { name: 'Payment Service', instances: ['payment-api-01', 'payment-api-02', 'payment-api-03', 'payment-api-04', 'payment-api-05'] },
  { name: 'Authentication Service', instances: ['auth-gateway-01', 'auth-gateway-02', 'auth-db-primary'] },
  { name: 'Frontend Web App', instances: ['web-server-01', 'web-server-02', 'web-server-03'] },
  { name: 'Database Cluster', instances: ['postgres-main-01', 'postgres-replica-01', 'redis-cache-01'] },
  { name: 'API Gateway', instances: ['gateway-edge-01', 'gateway-edge-02'] },
  { name: 'Search Service', instances: ['elasticsearch-node-01', 'elasticsearch-node-02'] },
  { name: 'Notification Delivery', instances: ['email-worker-01', 'sms-provider-01'] },
];

export const ALERT_TEMPLATES = [
  { alertName: 'CPU spike', message: 'CPU utilization exceeds threshold (94.2%)', severity: 'MEDIUM' as Severity },
  { alertName: 'Memory usage high', message: 'Memory consumption at 88.7% capacity', severity: 'MEDIUM' as Severity },
  { alertName: 'Database connection timeout', message: 'Connection timeout pool exhausted after 3000ms', severity: 'HIGH' as Severity },
  { alertName: 'HTTP 500 errors', message: 'Internal Server Error rate spike detected', severity: 'HIGH' as Severity },
  { alertName: 'High API latency', message: 'API response P99 latency is 1850ms (threshold 500ms)', severity: 'LOW' as Severity },
  { alertName: 'Disk usage warning', message: 'Disk space warning: /dev/sda1 is at 89.5% capacity', severity: 'LOW' as Severity },
  { alertName: 'Service unavailable', message: 'Failed healthcheck endpoint /healthz', severity: 'HIGH' as Severity },
  { alertName: 'Authentication failure', message: 'High volume of failed auth tokens (50/min)', severity: 'MEDIUM' as Severity },
];

// Helper to format time
export function getFormattedTime(date: Date = new Date()): string {
  return date.toTimeString().split(' ')[0];
}

// Generator functions
export function generateRandomAlert(): Partial<Alert> {
  const serviceObj = SERVICES_CONFIG[Math.floor(Math.random() * SERVICES_CONFIG.length)];
  const instance = serviceObj.instances[Math.floor(Math.random() * serviceObj.instances.length)];
  const template = ALERT_TEMPLATES[Math.floor(Math.random() * ALERT_TEMPLATES.length)];

  // Randomize transient vs sustained CPU alerts if rule engine applies
  let message = template.message;
  let alertName = template.alertName;
  let severity = template.severity;

  if (alertName === 'CPU spike') {
    const isTransient = Math.random() > 0.4;
    message = isTransient 
      ? 'Transient CPU utilization spike (92.5%) detected for 3 seconds' 
      : 'Sustained CPU utilization spike (96.8%) detected for 45 seconds';
  }

  return {
    service: serviceObj.name,
    instance,
    alertName,
    message,
    severity,
  };
}

export function generateCriticalFailureAlert(): Partial<Alert> {
  return {
    service: 'Database Cluster',
    instance: 'postgres-main-01',
    alertName: 'DATABASE CONNECTION LOST',
    message: 'CRITICAL Outage: Primary Postgres Node unreachable. Automatic failover active but failing.',
    severity: 'CRITICAL',
  };
}

// Alert Engine Processor Class
export class AlertEngine {
  private alerts: Alert[] = [];
  private incidents: Incident[] = [];
  private notifications: NotificationLog[] = [];
  private cooldowns: CooldownConfig = { ...DEFAULT_COOLDOWNS };
  private rules: SmartRule[] = [...DEFAULT_RULES];

  // Stats Counters
  public incomingCount = 0;
  public filteredCount = 0;
  public notificationSentCount = 0;

  constructor(initialAlerts?: Alert[], initialIncidents?: Incident[], initialNotifications?: NotificationLog[]) {
    if (initialAlerts) this.alerts = initialAlerts;
    if (initialIncidents) this.incidents = initialIncidents;
    if (initialNotifications) this.notifications = initialNotifications;
  }

  // Update Settings
  public updateCooldowns(newCooldowns: CooldownConfig) {
    this.cooldowns = { ...newCooldowns };
  }

  public updateRules(newRules: SmartRule[]) {
    this.rules = [...newRules];
  }

  public clearAll() {
    this.alerts = [];
    this.incidents = [];
    this.notifications = [];
    this.incomingCount = 0;
    this.filteredCount = 0;
    this.notificationSentCount = 0;
  }

  public getAlerts() { return this.alerts; }
  public getIncidents() { return this.incidents; }
  public getNotifications() { return this.notifications; }

  // Core Processing Method
  public processIncoming(rawAlert: Partial<Alert>): { alert: Alert; incident: Incident | null; notification: NotificationLog | null } {
    this.incomingCount++;
    const now = new Date();
    const alertId = `ALT-${Math.floor(100000 + Math.random() * 900000)}`;

    const alert: Alert = {
      id: alertId,
      timestamp: now.toISOString(),
      timeFormatted: getFormattedTime(now),
      service: rawAlert.service || 'Unknown Service',
      instance: rawAlert.instance || 'unknown-instance',
      alertName: rawAlert.alertName || 'Generic Alert',
      message: rawAlert.message || 'No detail message provided',
      severity: rawAlert.severity || 'MEDIUM',
      status: 'NEW',
      incidentId: null,
    };

    // 1. RULE ENGINE PRE-CHECK:
    // Check if custom rule is enabled and matches
    const isTransientCpuRule = this.rules.find(r => r.id === 'rule-cpu-transient')?.enabled;
    const isDbBypassRule = this.rules.find(r => r.id === 'rule-db-unreachable')?.enabled;
    const isEscalationRule = this.rules.find(r => r.id === 'rule-http-high-rate')?.enabled;

    // A. Suppress Transient CPU Spike (< 5 seconds)
    if (isTransientCpuRule && alert.alertName === 'CPU spike' && alert.message.includes('transient')) {
      alert.status = 'SUPPRESSED';
      this.filteredCount++;
      this.alerts.unshift(alert);
      return { alert, incident: null, notification: null };
    }

    // B. Escalate HTTP 500 alerts if rule is enabled
    if (isEscalationRule && alert.alertName === 'HTTP 500 errors' && alert.severity !== 'CRITICAL') {
      alert.severity = 'HIGH';
    }

    // 2. CRITICAL ALERT PROTECTION (BYPASS)
    const isCritical = alert.severity === 'CRITICAL';
    const isDbUnreachable = alert.alertName.includes('DATABASE');
    const triggersBypass = isCritical || (isDbBypassRule && isDbUnreachable);

    if (triggersBypass) {
      alert.status = 'BYPASSED';
      alert.severity = 'CRITICAL'; // Force CRITICAL severity
      
      // Critical bypass still groups into incidents or creates a new one
      const incident = this.groupIntoIncident(alert, now, true);
      const notification = this.createNotification(incident, true);
      this.alerts.unshift(alert);
      return { alert, incident, notification };
    }

    // 3. DEDUPLICATION FILTERING
    // Non-critical alert. Check if same service, instance, and alertName was seen within severity cooldown
    const cooldownDurationSec = this.cooldowns[alert.severity] || 0;
    const isDuplicate = this.checkIfDuplicate(alert, cooldownDurationSec, now);

    if (isDuplicate) {
      alert.status = 'SUPPRESSED';
      this.filteredCount++;
      this.alerts.unshift(alert);
      
      // Update the related incident timeline/alert count if available
      const lastIncident = this.findRecentIncidentForGroup(alert, now);
      if (lastIncident) {
        alert.incidentId = lastIncident.id;
        lastIncident.alertCount++;
        lastIncident.lastUpdated = now.toISOString();
        if (!lastIncident.affectedInstances.includes(alert.instance)) {
          lastIncident.affectedInstances.push(alert.instance);
        }
        
        // Periodic check to throttle timeline logging for duplicates
        if (lastIncident.alertCount % 10 === 0 || lastIncident.alertCount < 5) {
          lastIncident.timeline.unshift({
            time: getFormattedTime(now),
            message: `Suppressed duplicate alert: ${alert.alertName} on ${alert.instance} (${lastIncident.alertCount} events total)`,
          });
        }
      }

      return { alert, incident: lastIncident, notification: null };
    }

    // 4. SIMILARITY GROUPING & INCIDENT MANAGEMENT
    // Non-duplicate alert. Group with similar alerts if there is an active incident.
    alert.status = 'GROUPED';
    const incident = this.groupIntoIncident(alert, now, false);
    
    // Determine if we should notify.
    // If a NEW incident was created, notify immediately. If grouped to existing, the notification might be throttled/cooldown active.
    const isNewIncident = incident.alertCount === 1;
    let notification: NotificationLog | null = null;
    
    if (isNewIncident) {
      notification = this.createNotification(incident, false);
    } else {
      // Periodic update to incident timeline
      incident.timeline.unshift({
        time: getFormattedTime(now),
        message: `Similar alert grouped: ${alert.alertName} on ${alert.instance}`,
      });
    }

    this.alerts.unshift(alert);
    return { alert, incident, notification };
  }

  // Deduplication logic
  private checkIfDuplicate(alert: Alert, cooldownSeconds: number, currentTime: Date): boolean {
    if (cooldownSeconds <= 0) return false;

    // Search historical alerts in the database
    for (const hist of this.alerts) {
      if (
        hist.service === alert.service &&
        hist.instance === alert.instance &&
        hist.alertName === alert.alertName
      ) {
        const histTime = new Date(hist.timestamp);
        const diffSeconds = (currentTime.getTime() - histTime.getTime()) / 1000;
        
        if (diffSeconds < cooldownSeconds) {
          return true;
        }
      }
    }
    return false;
  }

  // Find recent incident for grouped logs
  private findRecentIncidentForGroup(alert: Alert, currentTime: Date): Incident | null {
    // Look for open incident in the same service with similar characteristics
    return this.incidents.find(inc => 
      inc.status !== 'RESOLVED' && 
      inc.service === alert.service &&
      (inc.name.toLowerCase().includes(alert.alertName.toLowerCase()) || 
       alert.alertName.toLowerCase().includes(inc.name.toLowerCase()) ||
       inc.severity === alert.severity) &&
      (currentTime.getTime() - new Date(inc.lastUpdated).getTime()) < 300000 // 5 minutes max gap
    ) || null;
  }

  // Group into incident
  private groupIntoIncident(alert: Alert, currentTime: Date, isBypassed: boolean): Incident {
    // Check if there is a matching open incident in the same service
    let existingIncident = this.findRecentIncidentForGroup(alert, currentTime);

    if (existingIncident) {
      alert.incidentId = existingIncident.id;
      existingIncident.alertCount++;
      existingIncident.lastUpdated = currentTime.toISOString();
      if (!existingIncident.affectedInstances.includes(alert.instance)) {
        existingIncident.affectedInstances.push(alert.instance);
      }
      
      // If critical, escalate incident severity to CRITICAL
      if (isBypassed && existingIncident.severity !== 'CRITICAL') {
        existingIncident.severity = 'CRITICAL';
        existingIncident.timeline.unshift({
          time: getFormattedTime(currentTime),
          message: `Incident escalated to CRITICAL: Bypassed alert ${alert.alertName} detected`,
        });
      }
      
      existingIncident.alerts.unshift(alert);
      return existingIncident;
    }

    // Create a new incident
    const incidentId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
    alert.incidentId = incidentId;

    let incidentName = `${alert.service} Alert Cluster`;
    if (alert.alertName.includes('CPU')) incidentName = `${alert.service} CPU Latency Spike`;
    else if (alert.alertName.includes('Memory')) incidentName = `${alert.service} Memory Leaking`;
    else if (alert.alertName.includes('HTTP 500')) incidentName = `${alert.service} API Failures`;
    else if (alert.alertName.includes('DATABASE')) incidentName = `Database Cluster Connection Loss`;
    else if (alert.alertName.includes('latency')) incidentName = `${alert.service} Response Latency`;

    const newIncident: Incident = {
      id: incidentId,
      name: incidentName,
      service: alert.service,
      severity: alert.severity,
      firstDetected: currentTime.toISOString(),
      lastUpdated: currentTime.toISOString(),
      alertCount: 1,
      affectedInstances: [alert.instance],
      status: 'NEW',
      timeline: [
        {
          time: getFormattedTime(currentTime),
          message: isBypassed 
            ? `Critical notification sent (bypassed noise filter)`
            : `Incident notification dispatched to routing channels`,
        },
        {
          time: getFormattedTime(currentTime),
          message: `Alert grouped into new Incident #${incidentId}`,
        },
        {
          time: getFormattedTime(currentTime),
          message: `First alert detected: ${alert.alertName} on ${alert.instance}`,
        }
      ],
      alerts: [alert],
    };

    this.incidents.unshift(newIncident);
    return newIncident;
  }

  // Create notifications routed to Slack/PagerDuty/Discord
  private createNotification(incident: Incident, isBypassed: boolean): NotificationLog {
    const now = new Date();
    const channels: ('Slack' | 'PagerDuty' | 'Discord' | 'Email')[] = ['Slack', 'PagerDuty', 'Discord'];
    
    // Choose one primary channel for display, or simulate routing to all. Let's record a Slack notification.
    const channel = isBypassed ? 'PagerDuty' : channels[Math.floor(Math.random() * channels.length)];
    
    const notification: NotificationLog = {
      id: `NTF-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: now.toISOString(),
      timeFormatted: getFormattedTime(now),
      incidentId: incident.id,
      incidentName: incident.name,
      service: incident.service,
      severity: incident.severity,
      channel,
      status: 'DELIVERED',
      isBypassed,
    };

    this.notificationSentCount++;
    this.notifications.unshift(notification);
    return notification;
  }

  // Simulate historical data to populate the dashboard instantly with realistic metrics
  public seedMockHistory(numAlerts = 200) {
    this.clearAll();
    const now = new Date();
    
    // Generate alerts backwards in time
    for (let i = numAlerts; i > 0; i--) {
      const alertTime = new Date(now.getTime() - i * 45000); // 45 seconds intervals
      const raw = generateRandomAlert();
      
      // Temporarily override engine state formatting using specific time
      const alertId = `ALT-${Math.floor(100000 + Math.random() * 900000)}`;
      const alert: Alert = {
        id: alertId,
        timestamp: alertTime.toISOString(),
        timeFormatted: getFormattedTime(alertTime),
        service: raw.service || 'Unknown Service',
        instance: raw.instance || 'unknown-instance',
        alertName: raw.alertName || 'Generic Alert',
        message: raw.message || 'No detail message provided',
        severity: raw.severity || 'MEDIUM',
        status: 'NEW',
        incidentId: null,
      };

      // Apply logic manually so we use the historical timestamp
      const cooldownSec = this.cooldowns[alert.severity];
      
      // Check duplicate
      let isDup = false;
      for (const hist of this.alerts) {
        if (
          hist.service === alert.service &&
          hist.instance === alert.instance &&
          hist.alertName === alert.alertName
        ) {
          const histT = new Date(hist.timestamp);
          const diff = (alertTime.getTime() - histT.getTime()) / 1000;
          if (diff < cooldownSec) {
            isDup = true;
            break;
          }
        }
      }

      this.incomingCount++;
      if (isDup) {
        alert.status = 'SUPPRESSED';
        this.filteredCount++;
        this.alerts.unshift(alert);
      } else {
        alert.status = 'GROUPED';
        
        // Find or create incident in history
        let extInc = this.incidents.find(inc => 
          inc.status !== 'RESOLVED' && 
          inc.service === alert.service &&
          inc.name.toLowerCase().includes(alert.alertName.toLowerCase()) &&
          (alertTime.getTime() - new Date(inc.lastUpdated).getTime()) < 300000
        );

        if (extInc) {
          alert.incidentId = extInc.id;
          extInc.alertCount++;
          extInc.lastUpdated = alertTime.toISOString();
          if (!extInc.affectedInstances.includes(alert.instance)) {
            extInc.affectedInstances.push(alert.instance);
          }
          extInc.alerts.unshift(alert);
        } else {
          const incId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
          alert.incidentId = incId;
          
          let incidentName = `${alert.service} Alert Cluster`;
          if (alert.alertName.includes('CPU')) incidentName = `${alert.service} CPU Latency Spike`;
          else if (alert.alertName.includes('Memory')) incidentName = `${alert.service} Memory Leaking`;
          else if (alert.alertName.includes('HTTP 500')) incidentName = `${alert.service} API Failures`;

          const newInc: Incident = {
            id: incId,
            name: incidentName,
            service: alert.service,
            severity: alert.severity,
            firstDetected: alertTime.toISOString(),
            lastUpdated: alertTime.toISOString(),
            alertCount: 1,
            affectedInstances: [alert.instance],
            status: Math.random() > 0.6 ? 'ACKNOWLEDGED' : (Math.random() > 0.5 ? 'INVESTIGATING' : 'NEW'),
            timeline: [
              { time: getFormattedTime(alertTime), message: `Alert grouped into Incident #${incId}` }
            ],
            alerts: [alert],
          };
          this.incidents.unshift(newInc);
          
          // Create historic notification
          const channel: 'Slack' | 'PagerDuty' | 'Discord' | 'Email' = ['Slack', 'PagerDuty', 'Discord'][Math.floor(Math.random() * 3)] as any;
          this.notificationSentCount++;
          this.notifications.unshift({
            id: `NTF-${Math.floor(10000 + Math.random() * 90000)}`,
            timestamp: alertTime.toISOString(),
            timeFormatted: getFormattedTime(alertTime),
            incidentId: incId,
            incidentName: newInc.name,
            service: newInc.service,
            severity: newInc.severity,
            channel,
            status: 'DELIVERED',
            isBypassed: false,
          });
        }
        this.alerts.unshift(alert);
      }
    }
  }
}
