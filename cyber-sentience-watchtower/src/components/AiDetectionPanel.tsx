
import React from 'react';
import { Cpu, Shield, Activity, Zap, Clock } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface DetectionMetric {
  name: string;
  value: number; // 0-100
  icon: React.ReactNode;
}

interface AiDetectionPanelProps {
  metrics: DetectionMetric[];
  lastScan: Date;
  activeDefenses: string[];
}

const AiDetectionPanel: React.FC<AiDetectionPanelProps> = ({ 
  metrics, 
  lastScan,
  activeDefenses
}) => {
  return (
    <div className="cyber-border p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Cpu className="h-5 w-5 text-cyber-primary" />
        <h3 className="text-sm font-semibold">AI SENTINEL</h3>
        <div className="ml-auto flex items-center space-x-1">
          <div className="h-2 w-2 rounded-full bg-cyber-success animate-pulse" />
          <span className="text-xs text-cyber-text/70">ACTIVE</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 mb-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-cyber-dark/50 p-3 rounded border border-cyber-primary/10">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                {metric.icon}
                <span className="text-xs">{metric.name}</span>
              </div>
              <span className="text-xs font-bold">{metric.value}%</span>
            </div>
            <Progress 
              value={metric.value} 
              className="h-1 bg-cyber-dark" 
              indicatorClassName={`${
                metric.value > 75 ? 'bg-cyber-success' : 
                metric.value > 40 ? 'bg-cyber-primary' : 
                'bg-cyber-warning'
              }`} 
            />
          </div>
        ))}
      </div>
      
      <div className="bg-cyber-dark/30 rounded p-3 text-xs mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-4 w-4 text-cyber-accent" />
          <h4 className="font-medium">ACTIVE DEFENSES</h4>
        </div>
        <ul className="grid grid-cols-1 gap-1">
          {activeDefenses.map((defense, index) => (
            <li key={index} className="flex items-center space-x-2">
              <Zap className="h-3 w-3 text-cyber-success" />
              <span>{defense}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex items-center justify-between text-xs text-cyber-text/50">
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Last scan: {lastScan.toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Activity className="h-3 w-3" />
          <span>Monitoring active</span>
        </div>
      </div>
    </div>
  );
};

export default AiDetectionPanel;
