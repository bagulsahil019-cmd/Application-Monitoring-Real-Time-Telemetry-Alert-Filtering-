# NoiseFilter: Intelligent Alert Fatigue Reducer Telemetry Proxy

NoiseFilter is a high-performance telemetry proxy middleware designed to sit between application monitoring platforms and notification routing sinks (like Slack, PagerDuty, and Discord). It acts as an **intelligent noise filter** to eliminate alert fatigue by deduplicating transient alarms, clustering similar error signatures, and maintaining critical notification bypasses.

The dashboard layout features an **AIDA64-inspired dark hardware-monitoring console** aesthetic (neon arc gauges, ECG monitor lines, and monospace diagnostics tables).

---

## 🚨 The Problem: Alert Fatigue
Modern monitoring networks bombard engineers with thousands of minor, duplicate, and repetitive alerts (e.g., a temporary 1-second CPU spike across several microservice nodes). This high-frequency noise leads to alert fatigue, causing on-call engineering teams to miss genuine, system-failing outages.

---

## 🛠️ The Solution: Core Features

1. **Real-Time Deduplication**: Suppresses repeat triggers of identical alarms based on an adjustable **automated cooldown matrix**.
2. **Incident Grouping**: Clusters similar error traces across different application instances into a single parent incident thread (`INC-XXXX`) with a detailed event sequence timeline.
3. **Critical Bypass**: Allows high-priority alerts (such as `db_timeout_aggregator` failures) to bypass cooldown limits and alert immediately.
4. **Noise Reduction Ratio**: Tracks the ratio of silenced alarms dynamically via high-contrast circular gauges and an interactive Recharts area chart comparing raw spikes against grouped notification dispatches.

---

## 🚀 Technology Stack
* **Frontend**: React 18, TypeScript, Tailwind CSS
* **Charts**: Recharts (gradient area curves)
* **Icons**: Lucide React
* **Build System**: Vite
* **Containerization**: Docker (multi-stage alpine build served via Nginx)

---

## 💻 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Docker](https://www.docker.com/) (Optional, for containerized run)

### Local Development Setup
1. Clone this repository and navigate to the project directory:
   ```bash
   cd "Intelligent Alert Fatigue Reducer"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite hot-reloading development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   👉 **http://localhost:5173/**

---

## 🐳 Running with Docker

You can build and run this application inside a lightweight Docker container (Nginx alpine):

1. **Build the image**:
   ```bash
   docker build -t noise-filter .
   ```
2. **Run the container** (mapping Nginx port 80 to host port 8080):
   ```bash
   docker run -d -p 8080:80 --name noise-filter-console noise-filter
   ```
3. **Access the console**:
   👉 **http://localhost:8080/**

---

## 📱 Sharing Across Different Networks

### 1. Same Wi-Fi Network
To share the dashboard with other devices on your local Wi-Fi, expose Vite's network host:
```bash
npm run dev -- --host
```
Open the **Network IP** (e.g. `http://192.168.1.XX:5173/`) on your secondary device.

### 2. Different Wi-Fi Network (Global Sharing via Secure Tunnel)
Expose your local development port to the public web using LocalTunnel:
```bash
npx localtunnel --port 5173
```
Copy the generated URL (e.g. `https://cool-alerts-filter.loca.lt`) and share it with your remote team.

---

## 📝 Demo: Simulating an Alert Storm
1. Toggle open the **Simulation Desk** from the top right button on the header.
2. Click **Simulate Storm** to stream **500 alerts in 100ms ticks** across payment nodes, session databases, and gateway targets.
3. Observe the **Ingested Alerts** counter rise to 700+, while the **Grouped Incident Feed** collapses them into 3-4 clean incidents, keeping **Noise Reduction at 98%+**.
