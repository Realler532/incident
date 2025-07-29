import { useState, useEffect, useCallback } from 'react';
import { Incident, NetworkTraffic, SystemStatus, Alert } from '../types/incident';
import { generateRandomIncident, generateNetworkTraffic, generateSystemStatus, generateAlert } from '../utils/dataSimulator';

export function useIncidentData() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [networkTraffic, setNetworkTraffic] = useState<NetworkTraffic[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  // Initialize data
  useEffect(() => {
    const initialIncidents = Array.from({ length: 10 }, () => generateRandomIncident());
    const initialTraffic = Array.from({ length: 50 }, () => generateNetworkTraffic());
    const initialStatus = generateSystemStatus();
    
    setIncidents(initialIncidents);
    setNetworkTraffic(initialTraffic);
    setSystemStatus(initialStatus);
  }, []);

  // Simulate real-time incident generation
  useEffect(() => {
    if (!isMonitoring) return;

    const incidentInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 5 seconds
        const newIncident = generateRandomIncident();
        setIncidents(prev => [newIncident, ...prev].slice(0, 50));
        
        // Generate alert for high/critical incidents
        if (newIncident.severity === 'high' || newIncident.severity === 'critical') {
          const alert = generateAlert();
          setAlerts(prev => [alert, ...prev].slice(0, 20));
        }
      }
    }, 5000);

    return () => clearInterval(incidentInterval);
  }, [isMonitoring]);

  // Simulate real-time network traffic
  useEffect(() => {
    if (!isMonitoring) return;

    const trafficInterval = setInterval(() => {
      const newTraffic = generateNetworkTraffic();
      setNetworkTraffic(prev => [newTraffic, ...prev].slice(0, 100));
      
      // Generate alert for suspicious traffic
      if (newTraffic.suspicious) {
        const alert: Alert = {
          id: `ALT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          message: `Suspicious network traffic detected from ${newTraffic.source}`,
          type: 'warning',
          acknowledged: false
        };
        setAlerts(prev => [alert, ...prev].slice(0, 20));
      }
    }, 2000);

    return () => clearInterval(trafficInterval);
  }, [isMonitoring]);

  // Update system status periodically
  useEffect(() => {
    if (!isMonitoring) return;

    const statusInterval = setInterval(() => {
      setSystemStatus(generateSystemStatus());
    }, 10000);

    return () => clearInterval(statusInterval);
  }, [isMonitoring]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  const resolveIncident = useCallback((incidentId: string) => {
    setIncidents(prev => prev.map(incident =>
      incident.id === incidentId ? { ...incident, status: 'resolved' } : incident
    ));
  }, []);

  const toggleMonitoring = useCallback(() => {
    setIsMonitoring(prev => !prev);
  }, []);

  return {
    incidents,
    networkTraffic,
    systemStatus,
    alerts,
    isMonitoring,
    acknowledgeAlert,
    resolveIncident,
    toggleMonitoring
  };
}