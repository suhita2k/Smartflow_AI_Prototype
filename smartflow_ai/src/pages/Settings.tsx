import { useState, useEffect, ReactElement } from 'react';
import { useAuth } from '../context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SettingSection {
  id: string;
  label: string;
  icon: ReactElement;
  adminOnly?: boolean;
}

type ThemeOption = 'dark' | 'darker' | 'midnight';
type AccentColor = 'cyan' | 'blue' | 'emerald' | 'violet' | 'orange';
type MapDefault = 'dark' | 'satellite' | 'streets';
type AlertSound = 'chime' | 'beep' | 'siren' | 'none';
type RefreshRate = 2 | 5 | 10 | 30;

interface GeneralSettings {
  theme: ThemeOption;
  accentColor: AccentColor;
  language: string;
  timezone: string;
  dateFormat: string;
  sidebarCollapsed: boolean;
  compactMode: boolean;
  animationsEnabled: boolean;
}

interface NotificationSettings {
  emailAlerts: boolean;
  pushAlerts: boolean;
  smsAlerts: boolean;
  emergencyAlerts: boolean;
  congestionAlerts: boolean;
  incidentAlerts: boolean;
  systemAlerts: boolean;
  alertSound: AlertSound;
  alertVolume: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  alertEmail: string;
  alertPhone: string;
}

interface MonitoringSettings {
  refreshRate: RefreshRate;
  autoOptimize: boolean;
  congestionThreshold: number;
  speedThreshold: number;
  heatmapEnabled: boolean;
  predictiveMode: boolean;
  dataRetentionDays: number;
  vehicleCountAlert: number;
}

interface CameraSettings {
  defaultResolution: string;
  detectionSensitivity: number;
  aiConfidenceThreshold: number;
  recordOnIncident: boolean;
  streamQuality: 'low' | 'medium' | 'high' | 'ultra';
  nightVisionAuto: boolean;
  overlayEnabled: boolean;
  faceBlurEnabled: boolean;
  vehicleTracking: boolean;
  pedestrianTracking: boolean;
  incidentAutoAlert: boolean;
  storageLimit: number;
}

interface MapSettings {
  defaultView: MapDefault;
  defaultZoom: number;
  showTrafficLayer: boolean;
  showCameraLayer: boolean;
  showCoverageLayer: boolean;
  clusterMarkers: boolean;
  showEmergencyRoute: boolean;
  autoCenter: boolean;
  trafficHeatmap: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  loginNotification: boolean;
  ipWhitelist: string;
  auditLog: boolean;
  passwordExpiry: number;
  maxLoginAttempts: number;
}

interface SystemSettings {
  maintenanceMode: boolean;
  apiRateLimit: number;
  backupEnabled: boolean;
  backupFrequency: 'hourly' | 'daily' | 'weekly';
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  analyticsEnabled: boolean;
  crashReporting: boolean;
  autoUpdates: boolean;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    info: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
  };
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md animate-fade-in shadow-2xl ${colors[type]}`}>
      <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs font-bold">{icons[type]}</span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 text-xs">✕</button>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange, disabled = false }: { enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
        enabled ? 'bg-cyan-500' : 'bg-slate-700'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-5' : ''}`} />
    </button>
  );
}

// ─── Slider ───────────────────────────────────────────────────────────────────
function Slider({ value, min, max, step = 1, onChange, unit = '' }: {
  value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div className="flex items-center gap-3 w-full">
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-cyan-400 bg-slate-700"
      />
      <span className="text-cyan-400 text-sm font-mono w-16 text-right">{value}{unit}</span>
    </div>
  );
}

// ─── SelectBox ────────────────────────────────────────────────────────────────
function SelectBox({ value, options, onChange }: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 w-full"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ─── SettingRow ───────────────────────────────────────────────────────────────
function SettingRow({ label, description, children, badge }: {
  label: string; description?: string; children: React.ReactNode; badge?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-slate-800/60 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-slate-200 text-sm font-medium">{label}</span>
          {badge && <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">{badge}</span>}
        </div>
        {description && <p className="text-slate-500 text-xs mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0 flex items-center">{children}</div>
    </div>
  );
}

// ─── SectionCard ─────────────────────────────────────────────────────────────
function SectionCard({ title, icon, children }: { title: string; icon: ReactElement; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          {icon}
        </div>
        <h3 className="text-white font-semibold text-base">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Accent Picker ────────────────────────────────────────────────────────────
const ACCENTS: { value: AccentColor; color: string }[] = [
  { value: 'cyan', color: 'bg-cyan-400' },
  { value: 'blue', color: 'bg-blue-500' },
  { value: 'emerald', color: 'bg-emerald-400' },
  { value: 'violet', color: 'bg-violet-500' },
  { value: 'orange', color: 'bg-orange-400' },
];

// ─── Sections config ──────────────────────────────────────────────────────────
const SECTIONS: SettingSection[] = [
  { id: 'general', label: 'General', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
  )},
  { id: 'notifications', label: 'Notifications', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
  )},
  { id: 'monitoring', label: 'Traffic Monitoring', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
  )},
  { id: 'cameras', label: 'CV Cameras & AI', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
  )},
  { id: 'map', label: 'Map & Display', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  )},
  { id: 'security', label: 'Security & Access', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
  )},
  { id: 'system', label: 'System & Advanced', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/></svg>
  ), adminOnly: true },
  { id: 'profile', label: 'My Profile', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
  )},
  { id: 'about', label: 'About & Updates', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  )},
];

// ─── Main Settings Page ───────────────────────────────────────────────────────
export function Settings() {
  const { user, hasPermission } = useAuth();
  const [activeSection, setActiveSection] = useState('general');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [unsaved, setUnsaved] = useState(false);

  // ── State blocks ────────────────────────────────────────────────────────────
  const [general, setGeneral] = useState<GeneralSettings>({
    theme: 'dark', accentColor: 'cyan', language: 'en', timezone: 'UTC+0',
    dateFormat: 'DD/MM/YYYY', sidebarCollapsed: false, compactMode: false, animationsEnabled: true,
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailAlerts: true, pushAlerts: true, smsAlerts: false,
    emergencyAlerts: true, congestionAlerts: true, incidentAlerts: true, systemAlerts: false,
    alertSound: 'chime', alertVolume: 70, quietHoursEnabled: false,
    quietHoursStart: '22:00', quietHoursEnd: '07:00',
    alertEmail: user?.email || '', alertPhone: '',
  });

  const [monitoring, setMonitoring] = useState<MonitoringSettings>({
    refreshRate: 5, autoOptimize: true, congestionThreshold: 70, speedThreshold: 20,
    heatmapEnabled: true, predictiveMode: true, dataRetentionDays: 90, vehicleCountAlert: 200,
  });

  const [cameras, setCameras] = useState<CameraSettings>({
    defaultResolution: '1080p', detectionSensitivity: 80, aiConfidenceThreshold: 75,
    recordOnIncident: true, streamQuality: 'high', nightVisionAuto: true,
    overlayEnabled: true, faceBlurEnabled: true, vehicleTracking: true,
    pedestrianTracking: true, incidentAutoAlert: true, storageLimit: 500,
  });

  const [mapSettings, setMapSettings] = useState<MapSettings>({
    defaultView: 'dark', defaultZoom: 13, showTrafficLayer: true,
    showCameraLayer: true, showCoverageLayer: false, clusterMarkers: true,
    showEmergencyRoute: true, autoCenter: true, trafficHeatmap: false,
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false, sessionTimeout: 60, loginNotification: true,
    ipWhitelist: '', auditLog: true, passwordExpiry: 90, maxLoginAttempts: 5,
  });

  const [system, setSystem] = useState<SystemSettings>({
    maintenanceMode: false, apiRateLimit: 1000, backupEnabled: true,
    backupFrequency: 'daily', logLevel: 'info', analyticsEnabled: true,
    crashReporting: true, autoUpdates: true,
  });

  const [profile, setProfile] = useState({
    name: user?.name || '', email: user?.email || '',
    currentPassword: '', newPassword: '', confirmPassword: '',
    bio: '', department: 'Traffic Management', phone: '',
  });

  // ── helpers ─────────────────────────────────────────────────────────────────
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setUnsaved(false);
  };

  const markDirty = () => setUnsaved(true);
  const setG = <K extends keyof GeneralSettings>(k: K, v: GeneralSettings[K]) => { setGeneral(p => ({ ...p, [k]: v })); markDirty(); };
  const setN = <K extends keyof NotificationSettings>(k: K, v: NotificationSettings[K]) => { setNotifications(p => ({ ...p, [k]: v })); markDirty(); };
  const setM = <K extends keyof MonitoringSettings>(k: K, v: MonitoringSettings[K]) => { setMonitoring(p => ({ ...p, [k]: v })); markDirty(); };
  const setC = <K extends keyof CameraSettings>(k: K, v: CameraSettings[K]) => { setCameras(p => ({ ...p, [k]: v })); markDirty(); };
  const setMap = <K extends keyof MapSettings>(k: K, v: MapSettings[K]) => { setMapSettings(p => ({ ...p, [k]: v })); markDirty(); };
  const setSec = <K extends keyof SecuritySettings>(k: K, v: SecuritySettings[K]) => { setSecurity(p => ({ ...p, [k]: v })); markDirty(); };
  const setSys = <K extends keyof SystemSettings>(k: K, v: SystemSettings[K]) => { setSystem(p => ({ ...p, [k]: v })); markDirty(); };
  const setP = <K extends keyof typeof profile>(k: K, v: string) => { setProfile(p => ({ ...p, [k]: v })); markDirty(); };

  const handleSave = () => {
    if (activeSection === 'profile') {
      if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
        showToast('Passwords do not match!', 'error'); return;
      }
      if (profile.newPassword && profile.newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error'); return;
      }
    }
    showToast('Settings saved successfully!', 'success');
  };

  const handleReset = () => {
    showToast('Section reset to defaults', 'info');
    setUnsaved(false);
  };

  const visibleSections = SECTIONS.filter(s => !s.adminOnly || hasPermission('manage_users'));

  // ── Renders ─────────────────────────────────────────────────────────────────
  const renderGeneral = () => (
    <>
      <SectionCard title="Appearance" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>}>
        <SettingRow label="Theme" description="Choose the dashboard color scheme">
          <SelectBox value={general.theme} onChange={v => setG('theme', v as ThemeOption)} options={[
            { value: 'dark', label: 'Dark' }, { value: 'darker', label: 'Darker' }, { value: 'midnight', label: 'Midnight' }
          ]} />
        </SettingRow>
        <SettingRow label="Accent Color" description="Primary highlight color used across the UI">
          <div className="flex items-center gap-2">
            {ACCENTS.map(a => (
              <button key={a.value} onClick={() => setG('accentColor', a.value)}
                className={`w-6 h-6 rounded-full ${a.color} transition-all ${general.accentColor === a.value ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-60 hover:opacity-100'}`}
              />
            ))}
          </div>
        </SettingRow>
        <SettingRow label="Compact Mode" description="Reduce spacing for denser information display">
          <Toggle enabled={general.compactMode} onChange={v => setG('compactMode', v)} />
        </SettingRow>
        <SettingRow label="Animations" description="Enable UI transition animations">
          <Toggle enabled={general.animationsEnabled} onChange={v => setG('animationsEnabled', v)} />
        </SettingRow>
        <SettingRow label="Sidebar Collapsed by Default" description="Start with sidebar in collapsed state">
          <Toggle enabled={general.sidebarCollapsed} onChange={v => setG('sidebarCollapsed', v)} />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Localization" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}>
        <SettingRow label="Language" description="Interface display language">
          <SelectBox value={general.language} onChange={v => setG('language', v)} options={[
            { value: 'en', label: '🇺🇸 English' }, { value: 'ar', label: '🇸🇦 Arabic' },
            { value: 'fr', label: '🇫🇷 French' }, { value: 'de', label: '🇩🇪 German' },
            { value: 'es', label: '🇪🇸 Spanish' }, { value: 'zh', label: '🇨🇳 Chinese' },
          ]} />
        </SettingRow>
        <SettingRow label="Timezone" description="Used for timestamps and scheduling">
          <SelectBox value={general.timezone} onChange={v => setG('timezone', v)} options={[
            { value: 'UTC+0', label: 'UTC+0 (London)' }, { value: 'UTC+1', label: 'UTC+1 (Paris)' },
            { value: 'UTC+2', label: 'UTC+2 (Cairo)' }, { value: 'UTC+3', label: 'UTC+3 (Riyadh)' },
            { value: 'UTC+5', label: 'UTC+5 (Karachi)' }, { value: 'UTC+8', label: 'UTC+8 (Beijing)' },
            { value: 'UTC-5', label: 'UTC-5 (New York)' }, { value: 'UTC-8', label: 'UTC-8 (LA)' },
          ]} />
        </SettingRow>
        <SettingRow label="Date Format" description="How dates are displayed across the platform">
          <SelectBox value={general.dateFormat} onChange={v => setG('dateFormat', v)} options={[
            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' }, { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
          ]} />
        </SettingRow>
      </SectionCard>
    </>
  );

  const renderNotifications = () => (
    <>
      <SectionCard title="Alert Channels" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}>
        <SettingRow label="Email Alerts" description="Receive alerts via email">
          <Toggle enabled={notifications.emailAlerts} onChange={v => setN('emailAlerts', v)} />
        </SettingRow>
        <SettingRow label="Push Notifications" description="Browser push notifications for real-time alerts">
          <Toggle enabled={notifications.pushAlerts} onChange={v => setN('pushAlerts', v)} />
        </SettingRow>
        <SettingRow label="SMS Alerts" description="Receive critical alerts via SMS">
          <Toggle enabled={notifications.smsAlerts} onChange={v => setN('smsAlerts', v)} />
        </SettingRow>
        <SettingRow label="Alert Email Address" description="Email for alert notifications">
          <input type="email" value={notifications.alertEmail} onChange={e => setN('alertEmail', e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 w-52" />
        </SettingRow>
        <SettingRow label="Alert Phone Number" description="Phone number for SMS alerts">
          <input type="tel" value={notifications.alertPhone} onChange={e => setN('alertPhone', e.target.value)}
            placeholder="+1 234 567 8900"
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 w-52 placeholder:text-slate-600" />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Alert Types" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}>
        <SettingRow label="Emergency Alerts" description="Ambulance corridors, fire incidents" badge="Critical">
          <Toggle enabled={notifications.emergencyAlerts} onChange={v => setN('emergencyAlerts', v)} />
        </SettingRow>
        <SettingRow label="Congestion Alerts" description="When traffic exceeds threshold">
          <Toggle enabled={notifications.congestionAlerts} onChange={v => setN('congestionAlerts', v)} />
        </SettingRow>
        <SettingRow label="Incident Alerts" description="Accidents, road blockages detected by CV">
          <Toggle enabled={notifications.incidentAlerts} onChange={v => setN('incidentAlerts', v)} />
        </SettingRow>
        <SettingRow label="System Alerts" description="Platform health, camera offline, server issues">
          <Toggle enabled={notifications.systemAlerts} onChange={v => setN('systemAlerts', v)} />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Sound & Quiet Hours" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0a3 3 0 100-6 3 3 0 000 6z"/></svg>}>
        <SettingRow label="Alert Sound" description="Sound played when an alert arrives">
          <SelectBox value={notifications.alertSound} onChange={v => setN('alertSound', v as AlertSound)} options={[
            { value: 'chime', label: '🔔 Chime' }, { value: 'beep', label: '📢 Beep' },
            { value: 'siren', label: '🚨 Siren' }, { value: 'none', label: '🔇 Silent' },
          ]} />
        </SettingRow>
        <SettingRow label="Alert Volume" description="Volume level for notification sounds">
          <div className="w-52"><Slider value={notifications.alertVolume} min={0} max={100} unit="%" onChange={v => setN('alertVolume', v)} /></div>
        </SettingRow>
        <SettingRow label="Quiet Hours" description="Suppress non-critical alerts during these hours">
          <Toggle enabled={notifications.quietHoursEnabled} onChange={v => setN('quietHoursEnabled', v)} />
        </SettingRow>
        {notifications.quietHoursEnabled && (
          <SettingRow label="Quiet Period" description="Start and end time for quiet hours">
            <div className="flex items-center gap-2">
              <input type="time" value={notifications.quietHoursStart} onChange={e => setN('quietHoursStart', e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500" />
              <span className="text-slate-500 text-sm">to</span>
              <input type="time" value={notifications.quietHoursEnd} onChange={e => setN('quietHoursEnd', e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500" />
            </div>
          </SettingRow>
        )}
      </SectionCard>
    </>
  );

  const renderMonitoring = () => (
    <>
      <SectionCard title="Real-Time Updates" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}>
        <SettingRow label="Data Refresh Rate" description="How often the dashboard fetches new traffic data">
          <SelectBox value={String(monitoring.refreshRate)} onChange={v => setM('refreshRate', Number(v) as RefreshRate)} options={[
            { value: '2', label: 'Every 2 seconds' }, { value: '5', label: 'Every 5 seconds' },
            { value: '10', label: 'Every 10 seconds' }, { value: '30', label: 'Every 30 seconds' },
          ]} />
        </SettingRow>
        <SettingRow label="Auto-Optimize Signals" description="Automatically adjust signal timing based on AI recommendations" badge="AI">
          <Toggle enabled={monitoring.autoOptimize} onChange={v => setM('autoOptimize', v)} />
        </SettingRow>
        <SettingRow label="Predictive Mode" description="Use AI to forecast traffic patterns and pre-adjust signals" badge="AI">
          <Toggle enabled={monitoring.predictiveMode} onChange={v => setM('predictiveMode', v)} />
        </SettingRow>
        <SettingRow label="Heatmap Overlay" description="Display live congestion heatmap on monitoring view">
          <Toggle enabled={monitoring.heatmapEnabled} onChange={v => setM('heatmapEnabled', v)} />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Alert Thresholds" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}>
        <SettingRow label="Congestion Threshold" description="Trigger congestion alert when traffic density exceeds this percentage">
          <div className="w-52"><Slider value={monitoring.congestionThreshold} min={10} max={100} unit="%" onChange={v => setM('congestionThreshold', v)} /></div>
        </SettingRow>
        <SettingRow label="Speed Threshold" description="Alert when average speed drops below this value (km/h)">
          <div className="w-52"><Slider value={monitoring.speedThreshold} min={5} max={80} unit=" km/h" onChange={v => setM('speedThreshold', v)} /></div>
        </SettingRow>
        <SettingRow label="Vehicle Count Alert" description="Alert when junction vehicle count exceeds this value">
          <div className="w-52"><Slider value={monitoring.vehicleCountAlert} min={50} max={500} step={10} unit=" v" onChange={v => setM('vehicleCountAlert', v)} /></div>
        </SettingRow>
        <SettingRow label="Data Retention" description="How long historical traffic data is stored">
          <SelectBox value={String(monitoring.dataRetentionDays)} onChange={v => setM('dataRetentionDays', Number(v))} options={[
            { value: '7', label: '7 days' }, { value: '30', label: '30 days' },
            { value: '90', label: '90 days' }, { value: '180', label: '6 months' }, { value: '365', label: '1 year' },
          ]} />
        </SettingRow>
      </SectionCard>
    </>
  );

  const renderCameras = () => (
    <>
      <SectionCard title="Stream Settings" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>}>
        <SettingRow label="Default Resolution" description="Video resolution for camera streams">
          <SelectBox value={cameras.defaultResolution} onChange={v => setC('defaultResolution', v)} options={[
            { value: '480p', label: '480p SD' }, { value: '720p', label: '720p HD' },
            { value: '1080p', label: '1080p Full HD' }, { value: '4k', label: '4K Ultra HD' },
          ]} />
        </SettingRow>
        <SettingRow label="Stream Quality" description="Bandwidth vs quality tradeoff for live feeds">
          <SelectBox value={cameras.streamQuality} onChange={v => setC('streamQuality', v as CameraSettings['streamQuality'])} options={[
            { value: 'low', label: 'Low (save bandwidth)' }, { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' }, { value: 'ultra', label: 'Ultra (max quality)' },
          ]} />
        </SettingRow>
        <SettingRow label="Night Vision Auto-Switch" description="Automatically switch to IR mode in low-light conditions">
          <Toggle enabled={cameras.nightVisionAuto} onChange={v => setC('nightVisionAuto', v)} />
        </SettingRow>
        <SettingRow label="HUD Overlay" description="Show detection bounding boxes and stats on video feed">
          <Toggle enabled={cameras.overlayEnabled} onChange={v => setC('overlayEnabled', v)} />
        </SettingRow>
        <SettingRow label="Storage Limit per Camera" description="Maximum storage allocated per camera (GB)">
          <div className="w-52"><Slider value={cameras.storageLimit} min={50} max={2000} step={50} unit="GB" onChange={v => setC('storageLimit', v)} /></div>
        </SettingRow>
      </SectionCard>

      <SectionCard title="AI Detection Settings" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2m-3 0a2 2 0 01-4 0m4 0a2 2 0 00-4 0"/></svg>}>
        <SettingRow label="Detection Sensitivity" description="How sensitive the AI is to detecting objects (higher = more detections)">
          <div className="w-52"><Slider value={cameras.detectionSensitivity} min={10} max={100} unit="%" onChange={v => setC('detectionSensitivity', v)} /></div>
        </SettingRow>
        <SettingRow label="Confidence Threshold" description="Minimum AI confidence score to report a detection">
          <div className="w-52"><Slider value={cameras.aiConfidenceThreshold} min={30} max={99} unit="%" onChange={v => setC('aiConfidenceThreshold', v)} /></div>
        </SettingRow>
        <SettingRow label="Vehicle Tracking" description="Track and count vehicles across frame" badge="AI">
          <Toggle enabled={cameras.vehicleTracking} onChange={v => setC('vehicleTracking', v)} />
        </SettingRow>
        <SettingRow label="Pedestrian Tracking" description="Detect and track pedestrians at junctions" badge="AI">
          <Toggle enabled={cameras.pedestrianTracking} onChange={v => setC('pedestrianTracking', v)} />
        </SettingRow>
        <SettingRow label="Incident Auto-Alert" description="Automatically raise alert when incident is detected">
          <Toggle enabled={cameras.incidentAutoAlert} onChange={v => setC('incidentAutoAlert', v)} />
        </SettingRow>
        <SettingRow label="Record on Incident" description="Automatically save clip when an incident is detected">
          <Toggle enabled={cameras.recordOnIncident} onChange={v => setC('recordOnIncident', v)} />
        </SettingRow>
        <SettingRow label="Face Blur (Privacy)" description="Automatically blur pedestrian faces in footage" badge="Privacy">
          <Toggle enabled={cameras.faceBlurEnabled} onChange={v => setC('faceBlurEnabled', v)} />
        </SettingRow>
      </SectionCard>
    </>
  );

  const renderMap = () => (
    <>
      <SectionCard title="Map Defaults" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>}>
        <SettingRow label="Default Map Style" description="Map tile style when Live Map is first opened">
          <SelectBox value={mapSettings.defaultView} onChange={v => setMap('defaultView', v as MapDefault)} options={[
            { value: 'dark', label: '🌑 Dark' }, { value: 'satellite', label: '🛰️ Satellite' }, { value: 'streets', label: '🗺️ Streets' },
          ]} />
        </SettingRow>
        <SettingRow label="Default Zoom Level" description="Initial zoom when map loads">
          <div className="w-52"><Slider value={mapSettings.defaultZoom} min={8} max={18} onChange={v => setMap('defaultZoom', v)} /></div>
        </SettingRow>
        <SettingRow label="Auto-Center on Alert" description="Automatically pan map to alert location">
          <Toggle enabled={mapSettings.autoCenter} onChange={v => setMap('autoCenter', v)} />
        </SettingRow>
        <SettingRow label="Cluster Markers" description="Group nearby markers to reduce clutter at low zoom">
          <Toggle enabled={mapSettings.clusterMarkers} onChange={v => setMap('clusterMarkers', v)} />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Default Layers" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>}>
        <SettingRow label="Traffic Junctions Layer" description="Show junction nodes on the map by default">
          <Toggle enabled={mapSettings.showTrafficLayer} onChange={v => setMap('showTrafficLayer', v)} />
        </SettingRow>
        <SettingRow label="CV Camera Layer" description="Show camera markers on the map by default">
          <Toggle enabled={mapSettings.showCameraLayer} onChange={v => setMap('showCameraLayer', v)} />
        </SettingRow>
        <SettingRow label="Coverage Radius Layer" description="Display camera and sensor coverage circles">
          <Toggle enabled={mapSettings.showCoverageLayer} onChange={v => setMap('showCoverageLayer', v)} />
        </SettingRow>
        <SettingRow label="Emergency Route Layer" description="Show active emergency corridors by default">
          <Toggle enabled={mapSettings.showEmergencyRoute} onChange={v => setMap('showEmergencyRoute', v)} />
        </SettingRow>
        <SettingRow label="Traffic Heatmap" description="Overlay a real-time traffic density heatmap">
          <Toggle enabled={mapSettings.trafficHeatmap} onChange={v => setMap('trafficHeatmap', v)} />
        </SettingRow>
      </SectionCard>
    </>
  );

  const renderSecurity = () => (
    <>
      <SectionCard title="Authentication" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>}>
        <SettingRow label="Two-Factor Authentication" description="Require 2FA code on login" badge="Recommended">
          <Toggle enabled={security.twoFactorEnabled} onChange={v => setSec('twoFactorEnabled', v)} />
        </SettingRow>
        <SettingRow label="Session Timeout" description="Automatically log out after inactivity (minutes)">
          <SelectBox value={String(security.sessionTimeout)} onChange={v => setSec('sessionTimeout', Number(v))} options={[
            { value: '15', label: '15 minutes' }, { value: '30', label: '30 minutes' },
            { value: '60', label: '1 hour' }, { value: '240', label: '4 hours' }, { value: '0', label: 'Never' },
          ]} />
        </SettingRow>
        <SettingRow label="Login Notifications" description="Email notification on each new login">
          <Toggle enabled={security.loginNotification} onChange={v => setSec('loginNotification', v)} />
        </SettingRow>
        <SettingRow label="Max Login Attempts" description="Lock account after this many failed attempts">
          <SelectBox value={String(security.maxLoginAttempts)} onChange={v => setSec('maxLoginAttempts', Number(v))} options={[
            { value: '3', label: '3 attempts' }, { value: '5', label: '5 attempts' },
            { value: '10', label: '10 attempts' }, { value: '0', label: 'Unlimited' },
          ]} />
        </SettingRow>
        <SettingRow label="Password Expiry" description="Force password reset after this many days">
          <SelectBox value={String(security.passwordExpiry)} onChange={v => setSec('passwordExpiry', Number(v))} options={[
            { value: '30', label: '30 days' }, { value: '60', label: '60 days' },
            { value: '90', label: '90 days' }, { value: '180', label: '180 days' }, { value: '0', label: 'Never' },
          ]} />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Access Control" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>}>
        <SettingRow label="Audit Log" description="Record all user actions for compliance and review">
          <Toggle enabled={security.auditLog} onChange={v => setSec('auditLog', v)} />
        </SettingRow>
        <SettingRow label="IP Whitelist" description="Comma-separated IPs allowed to access the platform (blank = all)">
          <input type="text" value={security.ipWhitelist} onChange={e => setSec('ipWhitelist', e.target.value)}
            placeholder="e.g. 192.168.1.0/24, 10.0.0.1"
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 w-64 placeholder:text-slate-600" />
        </SettingRow>
      </SectionCard>

      {/* Active Sessions */}
      <SectionCard title="Active Sessions" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2"/></svg>}>
        {[
          { device: 'Chrome — Windows 11', location: 'London, UK', time: 'Current session', current: true },
          { device: 'Firefox — macOS', location: 'Manchester, UK', time: '2 hours ago', current: false },
          { device: 'SmartFlow Mobile App', location: 'London, UK', time: '1 day ago', current: false },
        ].map((s, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-slate-800/60 last:border-0">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${s.current ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              <div>
                <p className="text-slate-200 text-sm">{s.device}</p>
                <p className="text-slate-500 text-xs">{s.location} · {s.time}</p>
              </div>
            </div>
            {!s.current && (
              <button onClick={() => showToast('Session revoked', 'info')}
                className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-2.5 py-1 rounded-lg hover:bg-red-500/10 transition">
                Revoke
              </button>
            )}
            {s.current && <span className="text-xs text-emerald-400 font-medium">● Current</span>}
          </div>
        ))}
        <button onClick={() => showToast('All other sessions signed out', 'success')}
          className="mt-3 text-sm text-red-400 hover:text-red-300 transition">
          Sign out all other sessions →
        </button>
      </SectionCard>
    </>
  );

  const renderSystem = () => (
    <>
      <SectionCard title="Platform Configuration" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/></svg>}>
        <SettingRow label="Maintenance Mode" description="Take the platform offline for maintenance — all users will see a maintenance screen" badge="Danger">
          <Toggle enabled={system.maintenanceMode} onChange={v => setSys('maintenanceMode', v)} />
        </SettingRow>
        <SettingRow label="API Rate Limit" description="Maximum API requests per minute per user">
          <div className="w-52"><Slider value={system.apiRateLimit} min={100} max={5000} step={100} unit="/min" onChange={v => setSys('apiRateLimit', v)} /></div>
        </SettingRow>
        <SettingRow label="Log Level" description="Verbosity of system logs">
          <SelectBox value={system.logLevel} onChange={v => setSys('logLevel', v as SystemSettings['logLevel'])} options={[
            { value: 'error', label: 'Error only' }, { value: 'warn', label: 'Warnings' },
            { value: 'info', label: 'Info' }, { value: 'debug', label: 'Debug (verbose)' },
          ]} />
        </SettingRow>
        <SettingRow label="Auto-Updates" description="Automatically install platform updates">
          <Toggle enabled={system.autoUpdates} onChange={v => setSys('autoUpdates', v)} />
        </SettingRow>
        <SettingRow label="Analytics Collection" description="Help improve SmartFlow by sharing anonymized usage data">
          <Toggle enabled={system.analyticsEnabled} onChange={v => setSys('analyticsEnabled', v)} />
        </SettingRow>
        <SettingRow label="Crash Reporting" description="Automatically report errors to the development team">
          <Toggle enabled={system.crashReporting} onChange={v => setSys('crashReporting', v)} />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Backup & Recovery" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/></svg>}>
        <SettingRow label="Automatic Backups" description="Regularly backup platform data and configuration">
          <Toggle enabled={system.backupEnabled} onChange={v => setSys('backupEnabled', v)} />
        </SettingRow>
        <SettingRow label="Backup Frequency" description="How often to perform automatic backups">
          <SelectBox value={system.backupFrequency} onChange={v => setSys('backupFrequency', v as SystemSettings['backupFrequency'])} options={[
            { value: 'hourly', label: 'Hourly' }, { value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' },
          ]} />
        </SettingRow>
        <div className="flex items-center gap-3 pt-3">
          <button onClick={() => showToast('Backup initiated — this may take a few minutes', 'info')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm rounded-xl transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Download Backup
          </button>
          <button onClick={() => showToast('Backup created successfully', 'success')}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm rounded-xl transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Backup Now
          </button>
        </div>
      </SectionCard>

      {/* System Health */}
      <SectionCard title="System Health" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}>
        {[
          { label: 'API Server', status: 'online', value: '12ms latency', color: 'emerald' },
          { label: 'AI Engine', status: 'online', value: '98.3% accuracy', color: 'emerald' },
          { label: 'Camera Network', status: 'degraded', value: '1 offline', color: 'yellow' },
          { label: 'Database', status: 'online', value: '2.1GB used', color: 'emerald' },
          { label: 'Backup Service', status: 'online', value: 'Last: 2h ago', color: 'emerald' },
        ].map((s, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-slate-800/60 last:border-0">
            <span className="text-slate-300 text-sm">{s.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs">{s.value}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                s.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>{s.status}</span>
            </div>
          </div>
        ))}
      </SectionCard>
    </>
  );

  const renderProfile = () => (
    <>
      {/* Avatar & Identity */}
      <SectionCard title="Profile Information" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}>
        <div className="flex items-center gap-5 mb-6 pb-5 border-b border-slate-800">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user?.avatar}
            </div>
            <button onClick={() => showToast('Avatar upload coming soon', 'info')}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500 transition">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </button>
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{user?.name}</p>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <span className={`inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full border font-medium ${
              user?.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
              user?.role === 'operator' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
              'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}>{user?.role}</span>
          </div>
        </div>
        <SettingRow label="Full Name">
          <input type="text" value={profile.name} onChange={e => setP('name', e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 w-56" />
        </SettingRow>
        <SettingRow label="Email Address">
          <input type="email" value={profile.email} onChange={e => setP('email', e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 w-56" />
        </SettingRow>
        <SettingRow label="Phone Number">
          <input type="tel" value={profile.phone} onChange={e => setP('phone', e.target.value)}
            placeholder="+44 7700 900123"
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 w-56 placeholder:text-slate-600" />
        </SettingRow>
        <SettingRow label="Department">
          <SelectBox value={profile.department} onChange={v => setP('department', v)} options={[
            { value: 'Traffic Management', label: 'Traffic Management' },
            { value: 'Operations', label: 'Operations' },
            { value: 'Engineering', label: 'Engineering' },
            { value: 'Emergency Services', label: 'Emergency Services' },
            { value: 'Analytics', label: 'Analytics & Data' },
            { value: 'Administration', label: 'Administration' },
          ]} />
        </SettingRow>
        <SettingRow label="Bio" description="Brief description shown on your profile">
          <textarea value={profile.bio} onChange={e => setP('bio', e.target.value)}
            rows={3} placeholder="Tell your team about yourself..."
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 w-64 resize-none placeholder:text-slate-600" />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Change Password" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>}>
        <SettingRow label="Current Password">
          <input type="password" value={profile.currentPassword} onChange={e => setP('currentPassword', e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 w-56" />
        </SettingRow>
        <SettingRow label="New Password">
          <input type="password" value={profile.newPassword} onChange={e => setP('newPassword', e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 w-56" />
        </SettingRow>
        <SettingRow label="Confirm New Password">
          <input type="password" value={profile.confirmPassword} onChange={e => setP('confirmPassword', e.target.value)}
            className={`bg-slate-800 border text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none w-56 ${
              profile.confirmPassword && profile.newPassword !== profile.confirmPassword
                ? 'border-red-500 focus:border-red-400' : 'border-slate-700 focus:border-cyan-500'
            }`} />
        </SettingRow>
        {profile.newPassword && (
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-slate-500 text-xs">Password strength:</span>
              <span className={`text-xs font-medium ${
                profile.newPassword.length < 6 ? 'text-red-400' :
                profile.newPassword.length < 10 ? 'text-yellow-400' : 'text-emerald-400'
              }`}>
                {profile.newPassword.length < 6 ? 'Weak' : profile.newPassword.length < 10 ? 'Medium' : 'Strong'}
              </span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full ${
                  i === 1 && profile.newPassword.length >= 1 ? 'bg-red-400' : ''
                }${i === 1 && profile.newPassword.length >= 6 ? ' !bg-yellow-400' : ''}
                ${i === 2 && profile.newPassword.length >= 6 ? 'bg-yellow-400' : i === 2 ? 'bg-slate-700' : ''}
                ${i === 3 && profile.newPassword.length >= 10 ? 'bg-emerald-400' : i === 3 ? 'bg-slate-700' : ''}
                ${i === 1 && profile.newPassword.length === 0 ? 'bg-slate-700' : ''}
                `} />
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </>
  );

  const renderAbout = () => (
    <>
      {/* App Info */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 border border-cyan-500/20 rounded-2xl p-8 mb-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
        </div>
        <h2 className="text-white text-2xl font-bold">SmartFlow AI</h2>
        <p className="text-cyan-400 mt-1 font-medium">Intelligent Traffic Optimization Platform</p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <span className="text-slate-500 text-sm">Version 3.7.2</span>
          <span className="text-slate-700">·</span>
          <span className="text-slate-500 text-sm">Build 20240315</span>
          <span className="text-slate-700">·</span>
          <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span> Up to date
          </span>
        </div>
      </div>

      <SectionCard title="Platform Modules" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>}>
        {[
          { name: 'AI Traffic Engine', version: '2.4.1', status: 'active' },
          { name: 'Computer Vision Module', version: '1.9.0', status: 'active' },
          { name: 'Emergency Corridor System', version: '3.1.2', status: 'active' },
          { name: 'Real-time Analytics', version: '2.2.0', status: 'active' },
          { name: 'Live Map Integration', version: '1.5.3', status: 'active' },
          { name: 'Notification Engine', version: '1.2.1', status: 'active' },
        ].map((m, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-slate-800/60 last:border-0">
            <div>
              <p className="text-slate-200 text-sm">{m.name}</p>
              <p className="text-slate-500 text-xs">v{m.version}</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">{m.status}</span>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Technology Stack" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>}>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Frontend', value: 'React 18 + TypeScript' },
            { label: 'Styling', value: 'Tailwind CSS 3' },
            { label: 'Maps', value: 'Leaflet + React-Leaflet' },
            { label: 'AI Engine', value: 'Computer Vision v2' },
            { label: 'Real-time', value: 'WebSocket streams' },
            { label: 'Build Tool', value: 'Vite 5' },
          ].map((t, i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-slate-500 text-xs">{t.label}</p>
              <p className="text-slate-200 text-sm font-medium mt-0.5">{t.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Support & Resources" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>}>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '📚 Documentation', desc: 'Full API & user guide' },
            { label: '🐛 Report a Bug', desc: 'Help us improve' },
            { label: '💬 Community Forum', desc: 'Ask & share with users' },
            { label: '📞 Contact Support', desc: 'Priority enterprise help' },
          ].map((r, i) => (
            <button key={i} onClick={() => showToast(`Opening ${r.label}...`, 'info')}
              className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-3 text-left transition">
              <p className="text-slate-200 text-sm font-medium">{r.label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{r.desc}</p>
            </button>
          ))}
        </div>
      </SectionCard>
    </>
  );

  const renderContent = () => {
    if (activeSection === 'general') return renderGeneral();
    if (activeSection === 'notifications') return renderNotifications();
    if (activeSection === 'monitoring') return renderMonitoring();
    if (activeSection === 'cameras') return renderCameras();
    if (activeSection === 'map') return renderMap();
    if (activeSection === 'security') return renderSecurity();
    if (activeSection === 'system') return renderSystem();
    if (activeSection === 'profile') return renderProfile();
    if (activeSection === 'about') return renderAbout();
    return null;
  };

  return (
    <div className="flex h-full min-h-screen bg-slate-950">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Left Settings Nav */}
      <div className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-900/50 p-4">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest px-2 mb-3">Settings</p>
        <nav className="space-y-1">
          {visibleSections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${activeSection === s.id
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
            >
              <span className={activeSection === s.id ? 'text-cyan-400' : 'text-slate-500'}>{s.icon}</span>
              {s.label}
              {s.adminOnly && (
                <span className="ml-auto text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">Admin</span>
              )}
            </button>
          ))}
        </nav>

        {/* Quick account actions */}
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-1">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest px-2 mb-3">Quick Actions</p>
          <button onClick={() => showToast('Exporting settings...', 'info')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export Settings
          </button>
          <button onClick={() => showToast('Settings imported', 'success')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12"/></svg>
            Import Settings
          </button>
          <button onClick={() => { handleReset(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-slate-800 bg-slate-900/30 sticky top-0 z-10 backdrop-blur">
          <div>
            <h2 className="text-white font-semibold text-lg">
              {visibleSections.find(s => s.id === activeSection)?.label}
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {activeSection === 'general' && 'Customize appearance, language and localization'}
              {activeSection === 'notifications' && 'Manage how and when you receive alerts'}
              {activeSection === 'monitoring' && 'Configure real-time traffic data and thresholds'}
              {activeSection === 'cameras' && 'AI detection parameters and camera stream settings'}
              {activeSection === 'map' && 'Default map style, zoom, and visible layers'}
              {activeSection === 'security' && 'Authentication, sessions, and access control'}
              {activeSection === 'system' && 'Advanced platform configuration and system health'}
              {activeSection === 'profile' && 'Your personal information and password'}
              {activeSection === 'about' && 'Platform version, modules, and support resources'}
            </p>
          </div>
          {activeSection !== 'about' && (
            <div className="flex items-center gap-3">
              {unsaved && (
                <span className="text-amber-400 text-xs flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  Unsaved changes
                </span>
              )}
              <button onClick={handleReset}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition">
                Reset
              </button>
              <button onClick={handleSave}
                className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Scrollable settings content */}
        <div className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
