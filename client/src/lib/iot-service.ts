import type {
  Classification,
  Device,
  PendingRegistration,
  SystemStats,
  TrendPoint,
  WasteDetection,
} from "@shared/types";

export const deviceData: Device[] = [
  {
    id: "ESP32-CAM-001",
    macAddress: "24:6F:28:9A:1C:71",
    firmware: "v2.4.1",
    location: "Main Campus",
    sensors: ["Camera", "DHT22", "Load cell"],
    status: "online",
    lastSeen: "12 sec ago",
    power: "PoE · 98%",
    camera: "healthy",
    registeredAt: "08 Sep 2026",
    classificationsToday: 184,
    uptime: "14d 08h",
    health: 98,
    reading: { temperature: 24.8, humidity: 46, battery: 98, signal: 92, updatedAt: "12 sec ago" },
  },
  {
    id: "ESP32-CAM-002",
    macAddress: "24:6F:28:9A:1C:8B",
    firmware: "v2.4.1",
    location: "Engineering Block",
    sensors: ["Camera", "DHT22", "Load cell"],
    status: "online",
    lastSeen: "28 sec ago",
    power: "PoE · 94%",
    camera: "healthy",
    registeredAt: "08 Sep 2026",
    classificationsToday: 137,
    uptime: "14d 08h",
    health: 94,
    reading: { temperature: 25.6, humidity: 52, battery: 94, signal: 88, updatedAt: "28 sec ago" },
  },
  {
    id: "ESP32-CAM-003",
    macAddress: "24:6F:28:9A:1C:93",
    firmware: "v2.3.8",
    location: "Computer Lab",
    sensors: ["Camera", "DHT22"],
    status: "warning",
    lastSeen: "4 min ago",
    power: "Battery · 31%",
    camera: "attention",
    registeredAt: "12 Sep 2026",
    classificationsToday: 92,
    uptime: "6d 11h",
    health: 68,
    reading: { temperature: 27.1, humidity: 61, battery: 31, signal: 61, updatedAt: "4 min ago" },
  },
  {
    id: "ESP32-CAM-004",
    macAddress: "24:6F:28:9A:1C:A2",
    firmware: "v2.4.1",
    location: "Cafeteria",
    sensors: ["Camera", "DHT22", "Load cell"],
    status: "online",
    lastSeen: "46 sec ago",
    power: "PoE · 96%",
    camera: "healthy",
    registeredAt: "14 Sep 2026",
    classificationsToday: 126,
    uptime: "12d 04h",
    health: 96,
    reading: { temperature: 25.1, humidity: 57, battery: 96, signal: 95, updatedAt: "46 sec ago" },
  },
  {
    id: "ESP32-CAM-005",
    macAddress: "24:6F:28:9A:1C:BD",
    firmware: "v2.4.0",
    location: "Research Lab",
    sensors: ["Camera", "DHT22", "Load cell"],
    status: "offline",
    lastSeen: "2 hr ago",
    power: "Battery · 0%",
    camera: "attention",
    registeredAt: "16 Sep 2026",
    classificationsToday: 0,
    uptime: "—",
    health: 0,
    reading: { temperature: 0, humidity: 0, battery: 0, signal: 0, updatedAt: "2 hr ago" },
  },
];

export const classifications: Classification[] = [
  { id: "CLS-9031", timestamp: "Today, 10:42:18", deviceId: "ESP32-CAM-001", location: "Main Campus", wasteType: "E-Waste", confidence: 98.4, isEWaste: true, imageTone: "lime" },
  { id: "CLS-9030", timestamp: "Today, 10:40:51", deviceId: "ESP32-CAM-004", location: "Cafeteria", wasteType: "Organic", confidence: 96.1, isEWaste: false, imageTone: "mint" },
  { id: "CLS-9029", timestamp: "Today, 10:39:07", deviceId: "ESP32-CAM-002", location: "Engineering Block", wasteType: "Metal", confidence: 92.7, isEWaste: false, imageTone: "slate" },
  { id: "CLS-9028", timestamp: "Today, 10:36:44", deviceId: "ESP32-CAM-001", location: "Main Campus", wasteType: "Plastic", confidence: 94.8, isEWaste: false, imageTone: "blue" },
  { id: "CLS-9027", timestamp: "Today, 10:34:12", deviceId: "ESP32-CAM-003", location: "Computer Lab", wasteType: "E-Waste", confidence: 89.3, isEWaste: true, imageTone: "amber" },
  { id: "CLS-9026", timestamp: "Today, 10:31:56", deviceId: "ESP32-CAM-004", location: "Cafeteria", wasteType: "Paper", confidence: 97.2, isEWaste: false, imageTone: "mint" },
  { id: "CLS-9025", timestamp: "Today, 10:29:30", deviceId: "ESP32-CAM-002", location: "Engineering Block", wasteType: "Glass", confidence: 91.9, isEWaste: false, imageTone: "slate" },
  { id: "CLS-9024", timestamp: "Today, 10:24:09", deviceId: "ESP32-CAM-001", location: "Main Campus", wasteType: "E-Waste", confidence: 95.6, isEWaste: true, imageTone: "lime" },
];

export const wasteDetections: WasteDetection[] = [
  { label: "Organic", count: 642, color: "#8ecb70", share: 31 },
  { label: "Plastic", count: 488, color: "#8ea7c7", share: 24 },
  { label: "Paper", count: 364, color: "#d3c2a1", share: 18 },
  { label: "Metal", count: 288, color: "#9aa6ab", share: 14 },
  { label: "E-Waste", count: 166, color: "#c7ee47", share: 8 },
  { label: "Glass", count: 102, color: "#84c6bd", share: 5 },
];

export const trendData: TrendPoint[] = [
  { label: "04 Sep", total: 218, eWaste: 16, nonEWaste: 202 },
  { label: "05 Sep", total: 284, eWaste: 21, nonEWaste: 263 },
  { label: "06 Sep", total: 249, eWaste: 18, nonEWaste: 231 },
  { label: "07 Sep", total: 326, eWaste: 32, nonEWaste: 294 },
  { label: "08 Sep", total: 302, eWaste: 28, nonEWaste: 274 },
  { label: "09 Sep", total: 358, eWaste: 34, nonEWaste: 324 },
  { label: "10 Sep", total: 321, eWaste: 29, nonEWaste: 292 },
  { label: "11 Sep", total: 391, eWaste: 36, nonEWaste: 355 },
  { label: "12 Sep", total: 337, eWaste: 32, nonEWaste: 305 },
  { label: "13 Sep", total: 418, eWaste: 42, nonEWaste: 376 },
  { label: "14 Sep", total: 395, eWaste: 38, nonEWaste: 357 },
  { label: "15 Sep", total: 448, eWaste: 45, nonEWaste: 403 },
  { label: "16 Sep", total: 452, eWaste: 47, nonEWaste: 405 },
];

export const pendingRegistrations: PendingRegistration[] = [
  { id: "ESP32-CAM-006", macAddress: "24:6F:28:9A:1C:C8", firmware: "v2.4.1", sensors: ["Camera", "DHT22", "Load cell"], location: "North Gate · auto-detected", discoveredAt: "3 min ago", status: "pending" },
  { id: "ESP32-CAM-007", macAddress: "24:6F:28:9A:1C:D4", firmware: "v2.4.0", sensors: ["Camera", "DHT22"], location: "Library Annex · auto-detected", discoveredAt: "18 min ago", status: "pending" },
  { id: "ESP32-CAM-008", macAddress: "24:6F:28:9A:1C:E1", firmware: "v2.3.9", sensors: ["Camera", "Load cell"], location: "Sports Complex · auto-detected", discoveredAt: "1 hr ago", status: "pending" },
];

export const systemStats: SystemStats = {
  totalDevices: deviceData.length,
  onlineDevices: deviceData.filter((device) => device.status === "online").length,
  offlineDevices: deviceData.filter((device) => device.status !== "online").length,
  totalClassifications: 2050,
  eWasteDetected: 166,
  averageConfidence: 94.6,
};

export const activityLog = [
  { time: "10:42", title: "E-waste detected", detail: "ESP32-CAM-001 · Main Campus", type: "signal" },
  { time: "10:38", title: "Device heartbeat restored", detail: "ESP32-CAM-004 · Cafeteria", type: "device" },
  { time: "10:17", title: "Firmware update completed", detail: "ESP32-CAM-002 · v2.4.1", type: "update" },
  { time: "09:54", title: "Low battery warning", detail: "ESP32-CAM-003 · 31% remaining", type: "warning" },
  { time: "09:21", title: "New device discovered", detail: "ESP32-CAM-008 · awaiting approval", type: "new" },
];

export const apiNotes = {
  source: "mock",
  transport: "REST / WebSocket / MQTT ready",
  lastSync: "12 seconds ago",
};
