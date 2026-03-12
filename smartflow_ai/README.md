# 🚦 SmartFlow AI — Intelligent Traffic Optimization Platform

<div align="center">

![SmartFlow AI](https://img.shields.io/badge/SmartFlow-AI-cyan?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIj48cGF0aCBkPSJNOSAyMGwtNS40NDctMi43MjRBMSAxIDAgMDEzIDE2LjM4MlY1LjYxOGExIDEgMCAwMTEuNDQ3LS44OTRMOSA3bTAgMTNsNi0zbS02IDNWN202IDEwbDQuNTUzIDIuMjc2QTEgMSAwIDAwMjEgMTguMzgyVjcuNjE4YTEgMSAwIDAwLS41NTMtLjg5NEwxNSA0bTAgMTNWNG0wIDBMOSA3Ii8+PC9zdmc+)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=for-the-badge&logo=tailwindcss)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=for-the-badge&logo=leaflet)

**AI-powered urban traffic management system with real-time monitoring, computer vision, emergency response, and smart analytics.**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Role-Based Authentication](#-role-based-authentication)
- [Pages & Modules](#-pages--modules)
  - [Dashboard](#-dashboard)
  - [Live Monitoring](#-live-monitoring)
  - [Emergency Green Corridor](#-emergency-green-corridor)
  - [Analytics](#-analytics)
  - [CV Cameras](#-computer-vision-cameras)
  - [Live Map](#-live-traffic-map)
  - [User Management](#-user-management)
  - [Settings](#-settings)
  - [Create Account](#-create-account)
- [Data & Types](#-data--types)
- [Permissions Matrix](#-permissions-matrix)
- [Demo Credentials](#-demo-credentials)

---

## 🌐 Overview

**SmartFlow AI** is a full-featured intelligent traffic optimization platform built as a single-page React application. It simulates a real-world urban traffic management system that leverages:

- 🤖 **Artificial Intelligence** — Auto-optimization of signal timings, predictive congestion modeling, and AI-generated insights
- 👁️ **Computer Vision** — Simulated live camera feeds with bounding-box detections for vehicles, pedestrians, incidents, and emergency vehicles
- 📊 **Real-Time Analytics** — Live updating charts, heatmaps, and KPI dashboards with hourly and per-junction breakdown
- 🚨 **Emergency Response** — One-click Green Corridor activation with animated vehicle routing and real-time ETA countdown
- 🗺️ **Interactive Maps** — Leaflet-powered live traffic map with junction markers, camera overlays, coverage zones, and emergency corridors
- 🔐 **Role-Based Access Control** — Admin / Operator / Viewer roles with scoped permissions and a full account management lifecycle

---

## ✨ Features

### Core Platform Features

| Feature | Description |
|---|---|
| 🔐 **RBAC Authentication** | Login, logout, register with 3 role tiers and granular permission checking |
| 📊 **Smart Dashboard** | Live KPI cards, junction status table, alerts feed, auto-updating stats |
| 🗺️ **Live Traffic Map** | Leaflet map with dark/satellite/streets tiles, junction & camera markers, emergency route polyline |
| 📷 **CV Camera System** | 8 cameras with animated canvas feeds, AI detection overlays, and HUD readouts |
| 🚨 **Emergency Corridor** | Green corridor activation, animated vehicle tracking, ETA countdown, activity log |
| 📈 **Analytics Engine** | Hourly bar/horizontal charts, AI insights, congestion heatmap, speed analytics |
| 👥 **User Management** | Full CRUD for users, role assignment, status management (active/pending/suspended) |
| ⚙️ **Settings Panel** | 9 sections covering theme, notifications, monitoring, cameras, maps, security, system, profile, and about |
| 📝 **Account Registration** | 4-step wizard with role selection, password strength, personal details, and review |

### Technical Highlights

- ⚡ Real-time data simulation with `setInterval` auto-refresh
- 🎨 Fully dark-themed UI built with Tailwind CSS 4
- 🗺️ React-Leaflet with custom SVG markers and animated polylines
- 🖼️ HTML5 Canvas for live camera feed simulation
- 📱 Responsive layout with collapsible sidebar
- 🔒 Context-based auth with in-memory state management
- 🎯 TypeScript throughout with strict type definitions

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2.3 | UI framework with hooks |
| **TypeScript** | 5.9.3 | Static typing |
| **Vite** | 7.2.4 | Build tool & dev server |
| **Tailwind CSS** | 4.1.17 | Utility-first styling |
| **Leaflet** | 1.9.4 | Interactive mapping |
| **React-Leaflet** | 5.0.0 | React bindings for Leaflet |
| **clsx** | 2.1.1 | Conditional class names |
| **tailwind-merge** | 3.4.0 | Tailwind class merging |
| **vite-plugin-singlefile** | 2.3.0 | Single-file bundle output |

---

## 📁 Project Structure

```
smartflow-ai/
├── index.html                    # App entry point (Leaflet CSS CDN, viewport meta)
├── package.json                  # Dependencies & scripts
├── vite.config.ts                # Vite + React + Tailwind + singlefile config
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # This file
│
└── src/
    ├── main.tsx                  # React DOM root render
    ├── App.tsx                   # Root component — routing shell + header
    ├── index.css                 # Global styles + Tailwind directives
    │
    ├── types/
    │   └── index.ts              # All TypeScript interfaces & type aliases
    │
    ├── data/
    │   └── mockData.ts           # Static seed data (users, nodes, cameras, alerts, analytics)
    │
    ├── context/
    │   └── AuthContext.tsx       # Auth state, login/logout/register/updateUser/deleteUser
    │
    ├── utils/
    │   └── cn.ts                 # clsx + tailwind-merge utility helper
    │
    ├── components/
    │   ├── LoginPage.tsx         # Login form + quick-login buttons + create account link
    │   └── Sidebar.tsx           # Collapsible sidebar nav with RBAC-filtered items
    │
    └── pages/
        ├── Dashboard.tsx         # KPI cards, junction table, alerts, AI banner
        ├── LiveMonitoring.tsx    # Auto-refresh junction cards, filters, signal optimizer
        ├── EmergencyCorridor.tsx # Green corridor control, animated route, activity log
        ├── Analytics.tsx         # Charts, AI insights, heatmap, speed analysis
        ├── CVCameras.tsx         # Canvas camera feeds, AI detections, grid/list view
        ├── LiveMap.tsx           # Leaflet map, layer toggles, side panel, emergency vehicle
        ├── UserManagement.tsx    # User CRUD, edit/delete modals, status management
        ├── Settings.tsx          # 9-section settings with save/reset + toast notifications
        └── CreateAccount.tsx     # 4-step registration wizard with role selection
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20.x
- **npm** ≥ 10.x

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/smartflow-ai.git
cd smartflow-ai

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

### Build for Production

```bash
npm run build
```

The output is a **single self-contained `dist/index.html`** file (via `vite-plugin-singlefile`) — no server needed, just open the file in a browser.

### Preview Production Build

```bash
npm run preview
```

---

## 🔐 Role-Based Authentication

SmartFlow AI implements a **3-tier Role-Based Access Control (RBAC)** system with scoped permissions enforced throughout the UI.

### Roles

| Role | Badge | Description |
|---|---|---|
| 👑 **Admin** | Purple | Full system access — manages users, signals, corridors, and system settings |
| 🔧 **Operator** | Blue | Operational access — monitors traffic, triggers emergency corridors, resolves alerts |
| 👁️ **Viewer** | Emerald | Read-only — views dashboard and analytics reports |

### Account Lifecycle

```
Registration → Pending Approval → Active (Admin approves)
                                → Suspended (Admin suspends)
                                → Inactive (Admin deactivates)
```

New accounts registered via the Create Account wizard are assigned **`pending`** status and cannot log in until an Admin approves them via the User Management panel.

### Permission System

Permissions are stored as string arrays per role in `ROLE_PERMISSIONS` and checked via `hasPermission()` from `AuthContext`:

```typescript
const { hasPermission } = useAuth();
if (hasPermission('manage_users')) { /* show admin controls */ }
```

---

## 📄 Pages & Modules

---

### 📊 Dashboard

**Route:** `/dashboard` — Accessible to all roles

The central command view of the platform.

**Components:**
- **Live Clock** — Updates every second with current date/time
- **4 KPI Cards** — Total vehicles, Average speed, Active junctions, Active alerts (color-coded)
- **Junction Status Table** — Real-time status, signal indicators, vehicle counts, speeds, and actions per junction
- **Alerts Feed** — Right panel with color-coded severity (emergency/congestion/incident/info)
- **AI Optimization Banner** — Shows 23% congestion reduction with a gradient highlight

---

### 🗺️ Live Monitoring

**Route:** `/monitoring` — Accessible to all roles

Real-time per-junction traffic monitoring with auto-refresh.

**Features:**
- **Auto-refresh every 2 seconds** — Vehicle counts and speeds randomize realistically
- **Status Filters** — All / Normal / Congested / Critical / Emergency
- **Junction Cards** — Each shows: status badge, vehicle count, average speed bar, green/red signal timing, CV camera status
- **Expand Panel** — Click any card to see coordinates and additional metadata
- **Signal Optimizer** — Admin/Operator button to trigger AI optimization on a junction

---

### 🚨 Emergency Green Corridor

**Route:** `/emergency` — Accessible to all roles (trigger requires operator/admin)

Emergency vehicle routing system for ambulances, fire trucks, and police.

**Features:**
- **Vehicle Type Selector** — 🚑 Ambulance / 🚒 Fire Engine / 🚓 Police
- **Corridor Activation** — One-click activation with route `West Terminal → City Sq → Central → City Hospital`
- **Animated Route** — Glowing progress bar with animated vehicle dot traveling the route
- **ETA Countdown** — Live countdown timer in MM:SS
- **Activity Log** — Timestamped log of corridor events (activated, nodes cleared, completed)
- **Stats Strip** — Response time saved, corridors today, success rate

---

### 📈 Analytics

**Route:** `/analytics` — Requires `view_analytics` permission (Admin + Operator)

Comprehensive traffic data analysis and AI insights.

**Components:**
- **Hourly Vehicle Flow** — Vertical bar chart with hover tooltips showing vehicles/speed/incidents per 2-hour block
- **Average Speed Chart** — Horizontal bar chart color-coded green/yellow/red by speed range
- **AI Insights Panel** — 4 auto-generated insights with trend indicators (↑↓) and priority levels
- **Congestion Heatmap** — 6×6 grid of junction × time-slot cells, color intensity = congestion level
- **Analytics KPI Row** — Total vehicles, average speed, total incidents, identified peak hour

---

### 📷 Computer Vision Cameras

**Route:** `/cameras` — Accessible to all roles

Live simulated camera feeds with AI object detection overlays.

**8 Cameras across 6 junctions:**

| Camera | Location | Status |
|---|---|---|
| CAM-001 | Main St & 5th Ave | 🟢 Online |
| CAM-002 | Park Blvd & Oak Rd | 🟢 Online |
| CAM-003 | Highway 12 & River Dr | 🔴 Alert (Incident) |
| CAM-004 | Bridge Ave & Dock St | 🟢 Online |
| CAM-005 | Terminal Rd & Freight Blvd | 🔴 Alert (Emergency) |
| CAM-006 | City Sq & Commerce Ave | 🟢 Online |
| CAM-007 | Market Lane & 3rd St | 🟡 Maintenance |
| CAM-008 | Harbor Dr & Quay Rd | ⚫ Offline |

**Canvas Feed Features:**
- Animated vehicle sprites (cars, trucks, buses) with wheels and shadows
- Moving road scene with lane markings
- AI bounding boxes with confidence scores and color-coded detection types
- HUD overlay: resolution, FPS, REC dot, congestion %, timestamp
- Status overlays: no-signal screen (offline), striped pattern (maintenance), red pulse flash (alert)

**UI Controls:**
- Grid / List view toggle
- Filter tabs: All / Online / Alert / Maintenance / Offline
- Click-to-expand modal with full-size feed, detection table, camera specs, and action buttons

---

### 🗺️ Live Traffic Map

**Route:** `/livemap` — Accessible to all roles

Interactive Leaflet map with real-time traffic data overlays.

**Map Styles:**
- 🌑 Dark (CartoDB Dark Matter) — Default
- 🛰️ Satellite (ESRI World Imagery)
- 🗺️ Streets (OpenStreetMap Standard)

**5 Toggleable Layers:**

| Layer | Description |
|---|---|
| 🔵 Traffic Junctions | SVG markers color-coded by status, pulsing rings for critical/emergency |
| 📷 CV Cameras | Camera-icon SVG markers with alert pulse badge |
| ⭕ Coverage Radius | Dashed circles showing each node's monitored area |
| 🔴 Emergency Corridor | Dual-layer polyline (glow + dashed) for active ambulance route |
| 🚑 Emergency Vehicle | Animated marker travelling the corridor in real time |

**Side Panel:**
- Network stats (active nodes, online cameras, active alerts)
- Selected junction/camera detail card
- Live alerts feed
- Emergency corridor progress bar

---

### 👥 User Management

**Route:** `/users` — Requires `manage_users` permission (Admin only)

Full user CRUD with role and status management.

**Features:**
- **Stats Bar** — Total / Active / Pending / Suspended count + breakdown by role
- **Grid & List Views** — Card grid or full table with all user metadata
- **Search & Filters** — Search by name/email/department; filter by role and status
- **Pending Approval Banner** — Quick-review shortcut for pending accounts
- **Edit Modal** — Name, department, phone, role picker, status picker (4 states), bio
- **Delete Modal** — Confirmation dialog with red warning UI
- **Status Actions** — Approve pending → active, Suspend active, Reactivate suspended
- **Permissions Matrix** — Table at the bottom showing all role capabilities
- **Toast Notifications** — Auto-dismiss after 3.5s

---

### ⚙️ Settings

**Route:** `/settings` — Accessible to all roles (System section Admin-only)

9-section settings panel with save/reset controls and toast feedback.

| Section | Key Settings |
|---|---|
| 🏠 **General** | Theme (Dark/Darker/Midnight), 5 accent colors, compact mode, animations, language, timezone, date format |
| 🔔 **Notifications** | Email/Push/SMS toggles, alert types, sound selector, volume slider, quiet hours |
| 🚦 **Traffic Monitoring** | Refresh rate, AI auto-optimize, thresholds (congestion/speed/count), data retention |
| 📷 **CV Cameras & AI** | Resolution, quality, night vision, detection sensitivity, confidence threshold, face blur |
| 🗺️ **Map & Display** | Default map style, zoom level, marker clustering, layer visibility toggles |
| 🔒 **Security & Access** | 2FA, session timeout, IP whitelist, max login attempts, active sessions panel |
| ⚙️ **System & Advanced** | Maintenance mode, API rate limit, log level, backup controls, system health panel (Admin) |
| 👤 **My Profile** | Avatar, name/email/phone/department/bio, password change with strength meter |
| ℹ️ **About & Updates** | Version info, module versions, tech stack, support links |

---

### 📝 Create Account

**Route:** Accessible from Login page (no auth required)

4-step registration wizard for new users.

**Step 1 — Account Info:**
- Full name, email
- Password + Confirm password with show/hide toggles
- Live password strength meter (5 bars: Too Weak → Weak → Fair → Good → Strong)
- Per-requirement checklist: 8+ chars, uppercase, lowercase, number, symbol

**Step 2 — Role & Access:**
- Rich role selector cards with descriptions and permission pill badges
- Approval requirement notice

**Step 3 — Personal Details:**
- Department (9 options), phone, bio with character count

**Step 4 — Review & Confirm:**
- Full account summary
- Permission list
- Legal notice

**Success Screen:**
- Animated checkmark
- Account summary (name, email, role, department)
- "Pending Approval" status notice
- Back to Sign In

---

## 📦 Data & Types

### Core Type Definitions (`src/types/index.ts`)

```typescript
type Role = 'admin' | 'operator' | 'viewer';
type AccountStatus = 'active' | 'pending' | 'suspended' | 'inactive';
type CameraStatus = 'online' | 'offline' | 'maintenance' | 'alert';
type DetectionType = 'vehicle' | 'pedestrian' | 'incident' | 'emergency';

interface User { id, name, email, role, avatar, status, department, phone, createdAt, lastLogin, bio, permissions }
interface TrafficNode { id, name, location, status, vehicleCount, avgSpeed, greenTime, redTime, lat, lng }
interface CVCamera { id, name, nodeId, location, lat, lng, status, fps, resolution, vehicleCount, pedestrianCount, incidentDetected, lastDetection, uptime, detections, streamBrightness, congestionLevel }
interface Detection { id, type, confidence, bbox, label, timestamp }
interface Alert { id, type, message, location, timestamp, resolved }
interface AnalyticsData { hour, vehicles, avgSpeed, incidents }
interface EmergencyVehicle { id, type, route, eta, status, corridorNodes }
```

### Mock Data (`src/data/mockData.ts`)

| Export | Count | Description |
|---|---|---|
| `CV_CAMERAS` | 8 | Cameras with locations, detections, status |
| `USERS` | 3 | Seed users (admin, operator, viewer) |
| `CREDENTIALS` | 3 | Email → password mapping |
| `TRAFFIC_NODES` | 6 | Junctions with geo-coordinates and traffic data |
| `ALERTS` | 5 | Sample alerts (emergency, congestion, incident, info) |
| `ANALYTICS_DATA` | 12 | Hourly traffic data (00:00–22:00) |
| `EMERGENCY_VEHICLES` | 1 | Active ambulance corridor |
| `ROLE_PERMISSIONS` | 3 | Permission arrays per role |

---

## 🔑 Permissions Matrix

| Permission | 👑 Admin | 🔧 Operator | 👁️ Viewer |
|---|:---:|:---:|:---:|
| `view_dashboard` | ✅ | ✅ | ✅ |
| `view_analytics` | ✅ | ✅ | ✅ |
| `manage_signals` | ✅ | ✅ | ❌ |
| `trigger_emergency` | ✅ | ✅ | ❌ |
| `resolve_alerts` | ✅ | ✅ | ❌ |
| `manage_users` | ✅ | ❌ | ❌ |

---

## 🧪 Demo Credentials

Use these credentials on the login screen, or click the **Quick Login** buttons for one-click access:

| Role | Email | Password | Access Level |
|---|---|---|---|
| 👑 **Admin** | `admin@smartflow.ai` | `admin123` | Full access |
| 🔧 **Operator** | `operator@smartflow.ai` | `op123` | Operational access |
| 👁️ **Viewer** | `viewer@smartflow.ai` | `view123` | Read-only access |

> ⚠️ **Note:** Accounts registered via Create Account will have `pending` status and cannot log in until approved by an Admin via **User Management → Approve**.

---

## 🏗️ Architecture Notes

### Authentication Flow

```
LoginPage → AuthContext.login()
         → Checks credentials map
         → Finds user in users array
         → Validates status (not suspended/inactive)
         → Sets current user in context
         → AppShell renders with role-scoped sidebar & pages
```

### Real-Time Simulation

```
useEffect + setInterval → Updates TrafficNode vehicle counts & speeds
                        → Randomizes within realistic bounds
                        → Triggers re-render every 2 seconds
```

### Canvas Camera Rendering

```
useRef (canvas element) → requestAnimationFrame loop
                        → Draws road background + lane markings
                        → Draws animated vehicle sprites
                        → Overlays AI bounding boxes from Detection[]
                        → Renders HUD text (FPS, resolution, timestamp)
```

### Map Architecture

```
MapContainer (Leaflet)
├── TileLayer (switchable: dark/satellite/streets)
├── Layer: Junction Markers (DivIcon SVG + Popup)
├── Layer: Camera Markers (DivIcon SVG + Popup)
├── Layer: Coverage Circles (Circle component)
├── Layer: Emergency Polyline (Polyline x2 — glow + dashed)
└── Layer: Emergency Vehicle Marker (animated DivIcon, position interpolated)
```

---

## 📄 License

This project is built for demonstration and educational purposes.

---

<div align="center">

Built with ❤️ using **React 19 · TypeScript · Vite · Tailwind CSS · Leaflet**

**SmartFlow AI** — *Optimizing Urban Mobility Through Intelligence*

</div>
