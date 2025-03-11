
import { Alert } from '@/components/AlertsList';

// Network node types
export interface NetworkNode {
  id: string;
  type: 'source' | 'destination' | 'router';
  status: 'normal' | 'suspicious' | 'malicious';
  x: number;
  y: number;
}

// Network connection types
export interface NetworkConnection {
  source: string;
  target: string;
  status: 'normal' | 'suspicious' | 'malicious';
  traffic: number; // 0-5 for visualization
}

// Traffic statistics
export interface TrafficStat {
  label: string;
  value: number;
  change: number;
  max: number;
}

// AI Detection Metrics
export interface DetectionMetric {
  name: string;
  value: number; // 0-100
  icon: string; // This will be replaced with React components
}

class MockDataService {
  private nodes: NetworkNode[] = [];
  private connections: NetworkConnection[] = [];
  private alerts: Alert[] = [];
  private threatLevel: number = 15; // 0-100
  private trafficStats: TrafficStat[] = [];
  private detectionMetrics: DetectionMetric[] = [];
  private activeDefenses: string[] = [
    'Packet Inspection', 
    'Malware Prevention', 
    'DDoS Protection',
    'Anomaly Detection'
  ];
  private lastScan: Date = new Date();
  
  // IP address generator
  private generateIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }
  
  // Initialize mock data
  constructor() {
    this.initializeNetworkData();
    this.initializeTrafficStats();
    this.initializeDetectionMetrics();
    this.generateRandomAlerts(2); // Start with a few alerts
  }
  
  // Create initial network topology
  private initializeNetworkData() {
    // Create nodes - a mix of sources, routers, and destinations
    const width = 550;
    const height = 300;
    
    // Create a main router in the center
    this.nodes.push({
      id: 'Main Router',
      type: 'router',
      status: 'normal',
      x: width / 2,
      y: height / 2
    });
    
    // Create some source nodes (typically on the left)
    for (let i = 0; i < 5; i++) {
      this.nodes.push({
        id: `Source-${this.generateIP()}`,
        type: 'source',
        status: 'normal',
        x: Math.random() * (width / 3) + 30,
        y: Math.random() * (height - 60) + 30
      });
    }
    
    // Create some destination nodes (typically on the right)
    for (let i = 0; i < 7; i++) {
      this.nodes.push({
        id: `Dest-${this.generateIP()}`,
        type: 'destination',
        status: 'normal',
        x: Math.random() * (width / 3) + (width * 2/3) - 30,
        y: Math.random() * (height - 60) + 30
      });
    }
    
    // Create connections - sources connect to router, router connects to destinations
    const router = this.nodes.find(n => n.type === 'router');
    const sources = this.nodes.filter(n => n.type === 'source');
    const destinations = this.nodes.filter(n => n.type === 'destination');
    
    if (router) {
      // Connect sources to router
      sources.forEach(source => {
        this.connections.push({
          source: source.id,
          target: router.id,
          status: 'normal',
          traffic: Math.floor(Math.random() * 4) + 1
        });
      });
      
      // Connect router to destinations
      destinations.forEach(dest => {
        this.connections.push({
          source: router.id,
          target: dest.id,
          status: 'normal',
          traffic: Math.floor(Math.random() * 3) + 1
        });
      });
    }
  }
  
  // Initialize traffic statistics
  private initializeTrafficStats() {
    this.trafficStats = [
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
    ];
  }
  
  // Initialize AI detection metrics
  private initializeDetectionMetrics() {
    this.detectionMetrics = [
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
    ];
  }
  
  // Generate a random alert
  private generateAlert(): Alert {
    const alertTypes = [
      {
        level: 'info' as const,
        messages: [
          'New device connected to network',
          'Scheduled system scan completed',
          'Software update available',
          'Unusual but legitimate traffic pattern detected',
          'User login from new location'
        ]
      },
      {
        level: 'warning' as const,
        messages: [
          'Multiple failed login attempts detected',
          'Unusual outbound traffic volume',
          'Potential port scanning activity',
          'Security patch required',
          'Unusual access pattern to secure resources'
        ]
      },
      {
        level: 'critical' as const,
        messages: [
          'Possible data exfiltration detected',
          'Malware signature identified',
          'Brute force attack in progress',
          'Known vulnerability exploitation attempt',
          'Unauthorized admin access attempt'
        ]
      },
      {
        level: 'resolved' as const,
        messages: [
          'Threat contained and eliminated',
          'Suspicious connection blocked',
          'Security patch applied successfully',
          'Compromised account secured',
          'Attack vector neutralized'
        ]
      }
    ];
    
    const source = this.nodes[Math.floor(Math.random() * this.nodes.length)].id;
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const message = alertType.messages[Math.floor(Math.random() * alertType.messages.length)];
    
    return {
      id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(),
      level: alertType.level,
      message,
      source
    };
  }
  
  // Generate a specific number of random alerts
  private generateRandomAlerts(count: number) {
    for (let i = 0; i < count; i++) {
      this.alerts.unshift(this.generateAlert());
    }
    
    // Sort alerts by criticality and time
    this.alerts.sort((a, b) => {
      const levelOrder = { critical: 0, warning: 1, info: 2, resolved: 3 };
      if (levelOrder[a.level] !== levelOrder[b.level]) {
        return levelOrder[a.level] - levelOrder[b.level];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
    
    // Limit total alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(0, 50);
    }
  }
  
  // Simulate a potential attack and update network state
  private simulateAttack() {
    // Only simulate attack if below threshold (to prevent too many attacks)
    if (this.threatLevel < 70 && Math.random() < 0.3) {
      // Increase threat level
      this.threatLevel = Math.min(100, this.threatLevel + Math.floor(Math.random() * 20) + 10);
      
      // Select a random node to become suspicious or malicious
      const targetIndex = Math.floor(Math.random() * this.nodes.length);
      const targetNode = this.nodes[targetIndex];
      
      // Prefer targeting normal nodes that aren't routers
      if (targetNode.status === 'normal' && targetNode.type !== 'router') {
        // Either suspicious or malicious
        targetNode.status = Math.random() < 0.7 ? 'suspicious' : 'malicious';
        
        // Find connections to/from this node and make them suspicious/malicious
        this.connections.forEach(conn => {
          if (conn.source === targetNode.id || conn.target === targetNode.id) {
            conn.status = targetNode.status;
            conn.traffic = Math.min(5, conn.traffic + 2); // Increase traffic
          }
        });
        
        // Generate alert based on node status
        const alertLevel = targetNode.status === 'suspicious' ? 'warning' : 'critical';
        const alertMessage = targetNode.status === 'suspicious' 
          ? 'Suspicious activity detected on ' + targetNode.id
          : 'Malicious behavior detected on ' + targetNode.id;
          
        this.alerts.unshift({
          id: `alert-${Date.now()}`,
          timestamp: new Date(),
          level: alertLevel as 'warning' | 'critical',
          message: alertMessage,
          source: targetNode.id
        });
        
        // Update traffic stats to reflect attack
        this.trafficStats.forEach(stat => {
          if (stat.label === 'PACKETS/SEC') {
            stat.value = Math.min(stat.max, Math.floor(stat.value * 1.2));
            stat.change = 20;
          } else if (stat.label === 'BLOCKED ATTEMPTS') {
            stat.value = Math.min(stat.max, stat.value + Math.floor(Math.random() * 10) + 5);
            stat.change = 15;
          }
        });
      }
    }
  }
  
  // Simulate resolving threats
  private resolveThreats() {
    // Chance to resolve threats if the threat level is high
    if (this.threatLevel > 30 && Math.random() < 0.4) {
      // Find nodes that are suspicious or malicious
      const compromisedNodes = this.nodes.filter(
        node => node.status === 'suspicious' || node.status === 'malicious'
      );
      
      // If we have compromised nodes, attempt to fix some
      if (compromisedNodes.length > 0) {
        const nodeToFix = compromisedNodes[Math.floor(Math.random() * compromisedNodes.length)];
        const wasStatus = nodeToFix.status;
        
        // Reset the node status
        nodeToFix.status = 'normal';
        
        // Fix related connections
        this.connections.forEach(conn => {
          if (conn.source === nodeToFix.id || conn.target === nodeToFix.id) {
            conn.status = 'normal';
            conn.traffic = Math.max(1, conn.traffic - 2); // Decrease traffic
          }
        });
        
        // Update threat level
        this.threatLevel = Math.max(10, this.threatLevel - (wasStatus === 'malicious' ? 15 : 5));
        
        // Generate a resolved alert
        this.alerts.unshift({
          id: `alert-${Date.now()}`,
          timestamp: new Date(),
          level: 'resolved',
          message: `Threat on ${nodeToFix.id} contained and resolved`,
          source: nodeToFix.id
        });
        
        // Update last scan time
        this.lastScan = new Date();
      }
    }
  }
  
  // Update traffic stats
  private updateTrafficStats() {
    this.trafficStats.forEach(stat => {
      // Random fluctuation in traffic
      const fluctuation = Math.random() * 0.1 - 0.05; // -5% to +5%
      
      // Update value based on fluctuation
      const newValue = Math.floor(stat.value * (1 + fluctuation));
      stat.value = Math.max(0, Math.min(stat.max, newValue));
      
      // Update change percentage
      stat.change = Math.floor(fluctuation * 100);
    });
  }
  
  // Update network traffic
  private updateNetworkTraffic() {
    this.connections.forEach(conn => {
      // Random changes to traffic levels
      if (Math.random() < 0.3) {
        const change = Math.random() < 0.5 ? 1 : -1;
        conn.traffic = Math.max(1, Math.min(5, conn.traffic + change));
      }
    });
  }
  
  // Periodically generate random alerts
  private checkForNewAlerts() {
    if (Math.random() < 0.15) {
      this.generateRandomAlerts(1);
    }
  }
  
  // Update all data (called on interval)
  public updateData() {
    // 10% chance to simulate an attack
    if (Math.random() < 0.1) {
      this.simulateAttack();
    }
    
    // 15% chance to resolve threats
    if (Math.random() < 0.15) {
      this.resolveThreats();
    }
    
    // Update traffic stats
    this.updateTrafficStats();
    
    // Update network traffic
    this.updateNetworkTraffic();
    
    // Check for new alerts
    this.checkForNewAlerts();
    
    // Decay threat level slightly over time
    this.threatLevel = Math.max(10, this.threatLevel - 0.5);
    
    // Return all updated data
    return {
      nodes: this.nodes,
      connections: this.connections,
      alerts: this.alerts,
      threatLevel: this.threatLevel,
      trafficStats: this.trafficStats,
      detectionMetrics: this.detectionMetrics,
      activeDefenses: this.activeDefenses,
      lastScan: this.lastScan
    };
  }
  
  // Clear a specific alert
  public clearAlert(id: string) {
    this.alerts = this.alerts.filter(alert => alert.id !== id);
    return this.alerts;
  }
  
  // Get current data without updating
  public getCurrentData() {
    return {
      nodes: this.nodes,
      connections: this.connections,
      alerts: this.alerts,
      threatLevel: this.threatLevel,
      trafficStats: this.trafficStats,
      detectionMetrics: this.detectionMetrics,
      activeDefenses: this.activeDefenses,
      lastScan: this.lastScan
    };
  }
}

export default new MockDataService();
