import { Incident, NetworkTraffic, SystemStatus, Alert } from '../types/incident';

const incidentTypes = ['malware', 'intrusion', 'ddos', 'phishing', 'data_breach', 'brute_force'] as const;
const severityLevels = ['low', 'medium', 'high', 'critical'] as const;
const statusTypes = ['detected', 'investigating', 'contained', 'resolved'] as const;

const sampleSources = [
  '192.168.1.45',
  '10.0.0.23',
  '172.16.0.100',
  '203.0.113.5',
  '198.51.100.12',
  '192.0.2.146'
];

const sampleTargets = [
  'web-server-01',
  'database-primary',
  'mail-server',
  'file-server',
  'domain-controller',
  'api-gateway'
];

const responseActions = [
  'Block IP address',
  'Isolate affected system',
  'Update firewall rules',
  'Scan for malware',
  'Reset user credentials',
  'Enable DDoS protection',
  'Notify security team',
  'Create backup'
];

export function generateRandomIncident(): Incident {
  const type = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
  const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
  const status = statusTypes[Math.floor(Math.random() * statusTypes.length)];
  
  return {
    id: `INC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(Date.now() - Math.random() * 86400000), // Last 24 hours
    type,
    severity,
    source: sampleSources[Math.floor(Math.random() * sampleSources.length)],
    target: sampleTargets[Math.floor(Math.random() * sampleTargets.length)],
    description: `${type.replace('_', ' ')} detected from ${sampleSources[Math.floor(Math.random() * sampleSources.length)]}`,
    status,
    responseActions: responseActions.slice(0, Math.floor(Math.random() * 3) + 1),
    affectedSystems: sampleTargets.slice(0, Math.floor(Math.random() * 2) + 1)
  };
}

export function generateNetworkTraffic(): NetworkTraffic {
  const suspicious = Math.random() < 0.15; // 15% chance of suspicious traffic
  
  return {
    timestamp: new Date(),
    source: sampleSources[Math.floor(Math.random() * sampleSources.length)],
    destination: sampleTargets[Math.floor(Math.random() * sampleTargets.length)],
    protocol: ['TCP', 'UDP', 'ICMP'][Math.floor(Math.random() * 3)],
    bytes: Math.floor(Math.random() * 10000) + 100,
    suspicious
  };
}

export function generateSystemStatus(): SystemStatus[] {
  const components = [
    'Firewall',
    'IDS/IPS',
    'Antivirus',
    'Web Application Firewall',
    'SIEM',
    'Endpoint Protection',
    'Network Monitor',
    'Threat Intelligence'
  ];

  return components.map(component => ({
    component,
    status: Math.random() < 0.9 ? 'online' : ['offline', 'warning', 'error'][Math.floor(Math.random() * 3)] as any,
    lastCheck: new Date(Date.now() - Math.random() * 300000), // Last 5 minutes
    responseTime: Math.floor(Math.random() * 200) + 10
  }));
}

export function generateAlert(): Alert {
  const messages = [
    'Suspicious login attempt detected',
    'Malware signature found in email attachment',
    'Unusual network traffic pattern observed',
    'Failed authentication attempts exceed threshold',
    'Potential data exfiltration detected',
    'System vulnerability scan completed'
  ];

  const types = ['info', 'warning', 'error', 'critical'] as const;
  
  return {
    id: `ALT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    message: messages[Math.floor(Math.random() * messages.length)],
    type: types[Math.floor(Math.random() * types.length)],
    acknowledged: false
  };
}