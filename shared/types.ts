export type DeviceStatus = "online" | "offline" | "warning";
export type WasteType = "Plastic" | "Paper" | "Glass" | "Metal" | "Organic" | "E-Waste" | "Other";
export type RegistrationStatus = "pending" | "approved" | "rejected";

export interface SensorReading {
  temperature: number;
  humidity: number;
  battery: number;
  signal: number;
  updatedAt: string;
}

export interface Device {
  id: string;
  macAddress: string;
  firmware: string;
  location: string;
  sensors: string[];
  status: DeviceStatus;
  lastSeen: string;
  power: string;
  camera: "healthy" | "attention";
  registeredAt: string;
  classificationsToday: number;
  uptime: string;
  health: number;
  reading: SensorReading;
}

export interface Classification {
  id: string;
  timestamp: string;
  deviceId: string;
  location: string;
  wasteType: WasteType;
  confidence: number;
  isEWaste: boolean;
  imageTone: "mint" | "amber" | "slate" | "lime" | "blue";
}

export interface WasteDetection {
  label: WasteType;
  count: number;
  color: string;
  share: number;
}

export interface TrendPoint {
  label: string;
  total: number;
  eWaste: number;
  nonEWaste: number;
}

export interface SystemStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  totalClassifications: number;
  eWasteDetected: number;
  averageConfidence: number;
}

export interface PendingRegistration {
  id: string;
  macAddress: string;
  firmware: string;
  sensors: string[];
  location: string;
  discoveredAt: string;
  status: RegistrationStatus;
}
