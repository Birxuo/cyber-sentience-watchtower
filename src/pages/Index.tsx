
import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Shield } from 'lucide-react';

import Header from '@/components/Header';
import ThreatLevelIndicator from '@/components/ThreatLevelIndicator';
import NetworkGraph from '@/components/NetworkGraph';
import AlertsList from '@/components/AlertsList';
import TrafficStats from '@/components/TrafficStats';
import AiDetectionPanel from '@/components/AiDetectionPanel';
import ThreatDetailsModal from '@/components/ThreatDetailsModal';
import LiveTrafficMonitor from '@/components/LiveTrafficMonitor';

import mockDataService from '@/services/mockDataService';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [data, setData] = useState(mockDataService.getCurrentData());
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    // Update data every 3 seconds
    const interval = setInterval(() => {
      const newData = mockDataService.updateData();
      setData(newData);
      
      // Show toast for critical alerts that just appeared
      const newCriticalAlerts = newData.alerts.filter(
        alert => alert.level === 'critical' && 
        new Date().getTime() - alert.timestamp.getTime() < 3000
      );
      
      if (newCriticalAlerts.length > 0) {
        newCriticalAlerts.forEach(alert => {
          toast({
            title: "Critical Alert",
            description: alert.message,
            variant: "destructive",
          });
        });
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [toast]);
  
  const handleClearAlert = (id: string) => {
    const updatedAlerts = mockDataService.clearAlert(id);
    setData(prev => ({ ...prev, alerts: updatedAlerts }));
    
    toast({
      title: "Alert cleared",
      description: "The alert has been dismissed",
    });
  };
  
  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
    setIsModalOpen(true);
    
    // Also show a toast for immediate feedback
    toast({
      title: `Node: ${node.id}`,
      description: `Type: ${node.type}, Status: ${node.status}`,
      variant: node.status === 'malicious' ? 'destructive' : (node.status === 'suspicious' ? 'default' : 'default'),
    });
  };

  return (
    <div className="min-h-screen bg-cyber-black cyber-grid">
      <div className="container px-4 py-2 mx-auto">
        <Header />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
          {/* Main Network Visualization */}
          <div className="lg:col-span-8 glass-panel relative h-[400px]">
            <NetworkGraph 
              width={550} 
              height={300} 
              nodes={data.nodes} 
              connections={data.connections}
              onNodeClick={handleNodeClick}
            />
          </div>
          
          {/* Right Sidebar */}
          <div className="lg:col-span-4 grid grid-cols-1 gap-4">
            <ThreatLevelIndicator level={data.threatLevel} />
            <TrafficStats stats={data.trafficStats} />
          </div>
          
          {/* Live Traffic Monitor */}
          <div className="lg:col-span-6 glass-panel h-[400px]">
            <LiveTrafficMonitor />
          </div>
          
          {/* Bottom Section - Alerts (now in 6 columns instead of 8) */}
          <div className="lg:col-span-6 glass-panel h-[400px]">
            <AlertsList alerts={data.alerts} onClearAlert={handleClearAlert} />
          </div>
          
          {/* AI Detection Panel */}
          <div className="lg:col-span-12 glass-panel">
            <AiDetectionPanel 
              metrics={data.detectionMetrics.map(metric => ({
                name: metric.name,
                value: metric.value,
                icon: metric.icon === 'Activity' ? <Activity className="h-4 w-4 text-cyber-primary" /> :
                      metric.icon === 'Shield' ? <Shield className="h-4 w-4 text-cyber-primary" /> :
                      metric.icon === 'Search' ? <Shield className="h-4 w-4 text-cyber-primary" /> :
                      <Cpu className="h-4 w-4 text-cyber-primary" />
              }))}
              lastScan={data.lastScan}
              activeDefenses={data.activeDefenses}
            />
          </div>
        </div>
        
        {/* Threat Details Modal */}
        <ThreatDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          node={selectedNode}
          connections={data.connections}
          firstDetected={new Date(Date.now() - 1800000)} // 30 minutes ago
        />
        
        <footer className="mt-8 text-center text-xs text-cyber-text/50 pb-4">
          <p>CYBER SENTIENCE WATCHTOWER • AI-POWERED SECURITY MONITORING</p>
          <p className="mt-1">OPEN SOURCE SECURITY PROJECT</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
