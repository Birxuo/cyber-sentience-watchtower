import { supabase, TABLES } from '../lib/supabase';
import { io } from '../server';
import { getNetworkTopology } from './networkService';

// System metrics interfaces
interface TrafficStat {
  label: string;
  value: number;
  change: number;
  max: number;
}

interface DetectionMetric {
  name: string;
  value: number; // 0-100
  icon: string;
}

interface SystemMetrics {
  threatLevel: number;
  trafficStats: TrafficStat[];
  detectionMetrics: DetectionMetric[];
  activeDefenses: string[];
  lastScan: Date;
}

// In-memory storage for system metrics (could be moved to Supabase in production)
let systemMetrics: SystemMetrics = {
  threatLevel: 15,
  trafficStats: [
    {
      label: 'PACKETS/SEC',
      value: 3850,
      change: 5,
      max: 10000
    },
    {
      label: 'BANDWIDTH (MBPS)',
      value: 456,
      change: 2,
      max: 1000
    },
    {
      label: 'ACTIVE CONNECTIONS',
      value: 1233,
      change: -3,
      max: 5000
    },
    {
      label: 'BLOCKED ATTEMPTS',
      value: 27,
      change: 12,
      max: 500
    }
  ],
  detectionMetrics: [
    {
      name: 'ANOMALY DETECTION',
      value: 87,
      icon: 'Activity'
    },
    {
      name: 'THREAT CLASSIFICATION',
      value: 92,
      icon: 'Shield'
    },
    {
      name: 'PATTERN RECOGNITION',
      value: 78,
      icon: 'Search'
    },
    {
      name: 'BEHAVIORAL ANALYSIS',
      value: 85,
      icon: 'LineChart'
    }
  ],
  activeDefenses: [
    'Packet Inspection', 
    'Malware Prevention', 
    'DDoS Protection',
    'Anomaly Detection'
  ],
  lastScan: new Date()
};

// Initialize system metrics
export const initializeSystemMetrics = async (): Promise<void> => {
  // This could load metrics from a database in a real implementation
  console.log('System metrics initialized');
};

// Get current system metrics
export const getSystemMetrics = async (): Promise<SystemMetrics> => {
  return systemMetrics;
};

// Update threat level
export const updateThreatLevel = async (level: number): Promise<{ threatLevel: number }> => {
  systemMetrics.threatLevel = Math.max(0, Math.min(100, level));
  
  // Emit socket event for real-time updates
  io.emit('metricsUpdate', { threatLevel: systemMetrics.threatLevel });
  
  return { threatLevel: systemMetrics.threatLevel };
};

// Update traffic statistics
export const updateTrafficStats = async (): Promise<{ trafficStats: TrafficStat[] }> => {
  // Get network topology to calculate some metrics
  const topology = await getNetworkTopology();
  
  // Update traffic stats based on network state
  systemMetrics.trafficStats.forEach(stat => {
    // Random fluctuation in traffic
    const fluctuation = Math.random() * 0.1 - 0.05; // -5% to +5%
    
    // Update value based on fluctuation
    const newValue = Math.floor(stat.value * (1 + fluctuation));
    stat.value = Math.max(0, Math.min(stat.max, newValue));
    
    // Update change percentage
    stat.change = Math.floor(fluctuation * 100);
    
    // Special case for active connections - base it on actual connections
    if (stat.label === 'ACTIVE CONNECTIONS') {
      stat.value = Math.min(stat.max, topology.connections.length * 100 + Math.floor(Math.random() * 200));
    }
  });
  
  // Emit socket event for real-time updates
  io.emit('metricsUpdate', { trafficStats: systemMetrics.trafficStats });
  
  return { trafficStats: systemMetrics.trafficStats };
};

// Update detection metrics
export const updateDetectionMetrics = async (): Promise<{ 
  detectionMetrics: DetectionMetric[],
  activeDefenses: string[],
  lastScan: Date 
}> => {
  // Update detection metrics with small random changes
  systemMetrics.detectionMetrics.forEach(metric => {
    const change = (Math.random() * 6) - 3; // -3 to +3
    metric.value = Math.max(50, Math.min(99, metric.value + change));
  });
  
  // Update last scan time
  systemMetrics.lastScan = new Date();
  
  // Emit socket event for real-time updates
  io.emit('metricsUpdate', { 
    detectionMetrics: systemMetrics.detectionMetrics,
    lastScan: systemMetrics.lastScan 
  });
  
  return { 
    detectionMetrics: systemMetrics.detectionMetrics,
    activeDefenses: systemMetrics.activeDefenses,
    lastScan: systemMetrics.lastScan 
  };
};

// Simulate a system metrics update (for scheduled tasks)
export const simulateMetricsUpdate = async (): Promise<SystemMetrics> => {
  // Update traffic stats
  await updateTrafficStats();
  
  // Update detection metrics occasionally
  if (Math.random() < 0.3) {
    await updateDetectionMetrics();
  }
  
  // Decay threat level slightly over time
  if (systemMetrics.threatLevel > 10) {
    systemMetrics.threatLevel = Math.max(10, systemMetrics.threatLevel - 0.5);
    io.emit('metricsUpdate', { threatLevel: systemMetrics.threatLevel });
  }
  
  return systemMetrics;
};