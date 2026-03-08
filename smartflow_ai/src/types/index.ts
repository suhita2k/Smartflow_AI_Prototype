export type Role = 'admin' | 'operator' | 'viewer';
export type AccountStatus = 'active' | 'pending' | 'suspended' | 'inactive';

export type CameraStatus = 'online' | 'offline' | 'maintenance' | 'alert';
export type DetectionType = 'vehicle' | 'pedestrian' | 'incident' | 'emergency';

export interface Detection {
  id: string;
  type: DetectionType;
  confidence: number;
  bbox: { x: number; y: number; w: number; h: number };
  label: string;
  timestamp: number;
}

export interface CVCamera {
  id: string;
  name: string;
  nodeId: string;
  location: string;
  lat: number;
  lng: number;
  status: CameraStatus;
  fps: number;
  resolution: string;
  vehicleCount: number;
  pedestrianCount: number;
  incidentDetected: boolean;
  lastDetection: string;
  uptime: number;
  detections: Detection[];
  streamBrightness: number;
  congestionLevel: number; // 0-100
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  status: AccountStatus;
  department: string;
  phone: string;
  createdAt: string;
  lastLogin: string;
  bio: string;
  permissions: string[];
}

export interface TrafficNode {
  id: string;
  name: string;
  location: string;
  status: 'normal' | 'congested' | 'critical' | 'emergency';
  vehicleCount: number;
  avgSpeed: number;
  greenTime: number;
  redTime: number;
  lat: number;
  lng: number;
}

export interface Alert {
  id: string;
  type: 'emergency' | 'congestion' | 'incident' | 'info';
  message: string;
  location: string;
  timestamp: string;
  resolved: boolean;
}

export interface AnalyticsData {
  hour: string;
  vehicles: number;
  avgSpeed: number;
  incidents: number;
}

export interface EmergencyVehicle {
  id: string;
  type: 'ambulance' | 'fire' | 'police';
  route: string;
  eta: number;
  status: 'active' | 'completed';
  corridorNodes: string[];
}
