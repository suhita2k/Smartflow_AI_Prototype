import { User, TrafficNode, Alert, AnalyticsData, EmergencyVehicle, CVCamera } from '../types';

export const CV_CAMERAS: CVCamera[] = [
  {
    id: 'cam1', name: 'CAM-001 · Central Junction', nodeId: 'n1', location: 'Main St & 5th Ave',
    lat: 40.7128, lng: -74.006, status: 'online', fps: 30, resolution: '4K',
    vehicleCount: 342, pedestrianCount: 47, incidentDetected: false,
    lastDetection: '2s ago', uptime: 99.2, congestionLevel: 74,
    streamBrightness: 80,
    detections: [
      { id: 'd1', type: 'vehicle', confidence: 0.97, bbox: { x: 120, y: 80, w: 90, h: 55 }, label: 'Car', timestamp: Date.now() },
      { id: 'd2', type: 'vehicle', confidence: 0.91, bbox: { x: 250, y: 100, w: 110, h: 60 }, label: 'Truck', timestamp: Date.now() },
      { id: 'd3', type: 'pedestrian', confidence: 0.88, bbox: { x: 60, y: 130, w: 30, h: 70 }, label: 'Pedestrian', timestamp: Date.now() },
    ],
  },
  {
    id: 'cam2', name: 'CAM-002 · North Gate', nodeId: 'n2', location: 'Park Blvd & Oak Rd',
    lat: 40.7228, lng: -74.002, status: 'online', fps: 30, resolution: '1080p',
    vehicleCount: 128, pedestrianCount: 19, incidentDetected: false,
    lastDetection: '1s ago', uptime: 98.7, congestionLevel: 28,
    streamBrightness: 90,
    detections: [
      { id: 'd4', type: 'vehicle', confidence: 0.95, bbox: { x: 180, y: 90, w: 85, h: 50 }, label: 'Car', timestamp: Date.now() },
      { id: 'd5', type: 'pedestrian', confidence: 0.84, bbox: { x: 310, y: 120, w: 28, h: 65 }, label: 'Pedestrian', timestamp: Date.now() },
    ],
  },
  {
    id: 'cam3', name: 'CAM-003 · East Corridor', nodeId: 'n3', location: 'Highway 12 & River Dr',
    lat: 40.7028, lng: -73.996, status: 'alert', fps: 30, resolution: '4K',
    vehicleCount: 521, pedestrianCount: 3, incidentDetected: true,
    lastDetection: 'just now', uptime: 97.1, congestionLevel: 95,
    streamBrightness: 65,
    detections: [
      { id: 'd6', type: 'incident', confidence: 0.93, bbox: { x: 140, y: 70, w: 120, h: 80 }, label: 'Accident', timestamp: Date.now() },
      { id: 'd7', type: 'vehicle', confidence: 0.96, bbox: { x: 200, y: 110, w: 95, h: 55 }, label: 'Bus', timestamp: Date.now() },
      { id: 'd8', type: 'vehicle', confidence: 0.89, bbox: { x: 320, y: 90, w: 80, h: 48 }, label: 'Car', timestamp: Date.now() },
    ],
  },
  {
    id: 'cam4', name: 'CAM-004 · South Bridge', nodeId: 'n4', location: 'Bridge Ave & Dock St',
    lat: 40.7028, lng: -74.012, status: 'online', fps: 25, resolution: '1080p',
    vehicleCount: 89, pedestrianCount: 12, incidentDetected: false,
    lastDetection: '3s ago', uptime: 99.9, congestionLevel: 18,
    streamBrightness: 85,
    detections: [
      { id: 'd9', type: 'vehicle', confidence: 0.92, bbox: { x: 90, y: 100, w: 88, h: 52 }, label: 'Car', timestamp: Date.now() },
    ],
  },
  {
    id: 'cam5', name: 'CAM-005 · West Terminal', nodeId: 'n5', location: 'Terminal Rd & Freight Blvd',
    lat: 40.7128, lng: -74.018, status: 'alert', fps: 30, resolution: '4K',
    vehicleCount: 203, pedestrianCount: 5, incidentDetected: false,
    lastDetection: 'just now', uptime: 96.5, congestionLevel: 60,
    streamBrightness: 70,
    detections: [
      { id: 'd10', type: 'emergency', confidence: 0.99, bbox: { x: 160, y: 60, w: 130, h: 70 }, label: 'Ambulance', timestamp: Date.now() },
      { id: 'd11', type: 'vehicle', confidence: 0.9, bbox: { x: 50, y: 110, w: 85, h: 50 }, label: 'Car', timestamp: Date.now() },
    ],
  },
  {
    id: 'cam6', name: 'CAM-006 · City Square', nodeId: 'n6', location: 'City Sq & Commerce Ave',
    lat: 40.7178, lng: -74.008, status: 'online', fps: 30, resolution: '4K',
    vehicleCount: 418, pedestrianCount: 82, incidentDetected: false,
    lastDetection: '1s ago', uptime: 98.3, congestionLevel: 82,
    streamBrightness: 75,
    detections: [
      { id: 'd12', type: 'vehicle', confidence: 0.94, bbox: { x: 100, y: 85, w: 92, h: 54 }, label: 'Car', timestamp: Date.now() },
      { id: 'd13', type: 'pedestrian', confidence: 0.87, bbox: { x: 270, y: 130, w: 26, h: 68 }, label: 'Pedestrian', timestamp: Date.now() },
      { id: 'd14', type: 'pedestrian', confidence: 0.81, bbox: { x: 340, y: 125, w: 25, h: 65 }, label: 'Pedestrian', timestamp: Date.now() },
    ],
  },
  {
    id: 'cam7', name: 'CAM-007 · Market Lane', nodeId: 'n1', location: 'Market Lane & 3rd St',
    lat: 40.7145, lng: -74.003, status: 'maintenance', fps: 0, resolution: '1080p',
    vehicleCount: 0, pedestrianCount: 0, incidentDetected: false,
    lastDetection: '2h ago', uptime: 88.0, congestionLevel: 0,
    streamBrightness: 0,
    detections: [],
  },
  {
    id: 'cam8', name: 'CAM-008 · Harbor View', nodeId: 'n4', location: 'Harbor Dr & Quay Rd',
    lat: 40.7005, lng: -74.015, status: 'offline', fps: 0, resolution: '4K',
    vehicleCount: 0, pedestrianCount: 0, incidentDetected: false,
    lastDetection: '45m ago', uptime: 71.3, congestionLevel: 0,
    streamBrightness: 0,
    detections: [],
  },
];

export const USERS: User[] = [
  {
    id: '1', name: 'Alex Rivera', email: 'admin@smartflow.ai', role: 'admin', avatar: 'AR',
    status: 'active', department: 'Traffic Operations', phone: '+1 (555) 001-0001',
    createdAt: '2024-01-15', lastLogin: '2 minutes ago', bio: 'Senior traffic systems administrator.',
    permissions: ['view_dashboard', 'manage_signals', 'trigger_emergency', 'manage_users', 'view_analytics', 'resolve_alerts'],
  },
  {
    id: '2', name: 'Jordan Lee', email: 'operator@smartflow.ai', role: 'operator', avatar: 'JL',
    status: 'active', department: 'Field Operations', phone: '+1 (555) 002-0002',
    createdAt: '2024-03-20', lastLogin: '1 hour ago', bio: 'Traffic signal operator for downtown zone.',
    permissions: ['view_dashboard', 'manage_signals', 'trigger_emergency', 'view_analytics', 'resolve_alerts'],
  },
  {
    id: '3', name: 'Sam Chen', email: 'viewer@smartflow.ai', role: 'viewer', avatar: 'SC',
    status: 'active', department: 'Analytics & Reporting', phone: '+1 (555) 003-0003',
    createdAt: '2024-06-10', lastLogin: '3 hours ago', bio: 'Data analyst and traffic report reviewer.',
    permissions: ['view_dashboard', 'view_analytics'],
  },
];

export const CREDENTIALS: Record<string, string> = {
  'admin@smartflow.ai': 'admin123',
  'operator@smartflow.ai': 'op123',
  'viewer@smartflow.ai': 'view123',
};

export const TRAFFIC_NODES: TrafficNode[] = [
  { id: 'n1', name: 'Central Junction', location: 'Main St & 5th Ave', status: 'congested', vehicleCount: 342, avgSpeed: 18, greenTime: 45, redTime: 30, lat: 40.7128, lng: -74.006 },
  { id: 'n2', name: 'North Gate', location: 'Park Blvd & Oak Rd', status: 'normal', vehicleCount: 128, avgSpeed: 42, greenTime: 35, redTime: 25, lat: 40.7228, lng: -74.002 },
  { id: 'n3', name: 'East Corridor', location: 'Highway 12 & River Dr', status: 'critical', vehicleCount: 521, avgSpeed: 8, greenTime: 60, redTime: 15, lat: 40.7028, lng: -73.996 },
  { id: 'n4', name: 'South Bridge', location: 'Bridge Ave & Dock St', status: 'normal', vehicleCount: 89, avgSpeed: 55, greenTime: 30, redTime: 30, lat: 40.7028, lng: -74.012 },
  { id: 'n5', name: 'West Terminal', location: 'Terminal Rd & Freight Blvd', status: 'emergency', vehicleCount: 203, avgSpeed: 0, greenTime: 90, redTime: 0, lat: 40.7128, lng: -74.018 },
  { id: 'n6', name: 'City Square', location: 'City Sq & Commerce Ave', status: 'congested', vehicleCount: 418, avgSpeed: 12, greenTime: 50, redTime: 20, lat: 40.7178, lng: -74.008 },
];

export const ALERTS: Alert[] = [
  { id: 'a1', type: 'emergency', message: 'Ambulance en route — Green Corridor ACTIVE on West Terminal', location: 'West Terminal', timestamp: '2 min ago', resolved: false },
  { id: 'a2', type: 'congestion', message: 'Severe congestion detected — 521 vehicles stalled', location: 'East Corridor', timestamp: '5 min ago', resolved: false },
  { id: 'a3', type: 'congestion', message: 'Moderate congestion — Signal timing adjusted automatically', location: 'Central Junction', timestamp: '12 min ago', resolved: false },
  { id: 'a4', type: 'incident', message: 'Minor accident reported — Lane 2 blocked', location: 'City Square', timestamp: '18 min ago', resolved: false },
  { id: 'a5', type: 'info', message: 'Scheduled maintenance on traffic sensors completed', location: 'North Gate', timestamp: '1 hr ago', resolved: true },
];

export const ANALYTICS_DATA: AnalyticsData[] = [
  { hour: '00:00', vehicles: 420, avgSpeed: 58, incidents: 0 },
  { hour: '02:00', vehicles: 210, avgSpeed: 65, incidents: 0 },
  { hour: '04:00', vehicles: 180, avgSpeed: 68, incidents: 0 },
  { hour: '06:00', vehicles: 680, avgSpeed: 38, incidents: 1 },
  { hour: '08:00', vehicles: 1420, avgSpeed: 18, incidents: 3 },
  { hour: '10:00', vehicles: 980, avgSpeed: 32, incidents: 1 },
  { hour: '12:00', vehicles: 1100, avgSpeed: 28, incidents: 2 },
  { hour: '14:00', vehicles: 1050, avgSpeed: 30, incidents: 1 },
  { hour: '16:00', vehicles: 1580, avgSpeed: 14, incidents: 4 },
  { hour: '18:00', vehicles: 1320, avgSpeed: 20, incidents: 3 },
  { hour: '20:00', vehicles: 750, avgSpeed: 42, incidents: 1 },
  { hour: '22:00', vehicles: 490, avgSpeed: 54, incidents: 0 },
];

export const EMERGENCY_VEHICLES: EmergencyVehicle[] = [
  {
    id: 'ev1',
    type: 'ambulance',
    route: 'West Terminal → City Hospital',
    eta: 4,
    status: 'active',
    corridorNodes: ['n5', 'n6', 'n1'],
  },
];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['view_dashboard', 'manage_signals', 'trigger_emergency', 'manage_users', 'view_analytics', 'resolve_alerts'],
  operator: ['view_dashboard', 'manage_signals', 'trigger_emergency', 'view_analytics', 'resolve_alerts'],
  viewer: ['view_dashboard', 'view_analytics'],
};
