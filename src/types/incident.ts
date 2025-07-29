export interface Incident {
  id: string;
  timestamp: Date;
  type: 'malware' | 'intrusion' | 'ddos' | 'phishing' | 'data_breach' | 'brute_force';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  description: string;
  status: 'detected' | 'investigating' | 'contained' | 'resolved';
  responseActions: string[];
  affectedSystems: string[];
}

export interface NetworkTraffic {
  timestamp: Date;
  source: string;
  destination: string;
  protocol: string;
  bytes: number;
  suspicious: boolean;
}

export interface SystemStatus {
  component: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  lastCheck: Date;
  responseTime: number;
}

export interface Alert {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  acknowledged: boolean;
}