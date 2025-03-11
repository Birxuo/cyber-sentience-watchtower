
import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Shield } from 'lucide-react';

interface ThreatLevelIndicatorProps {
  level: number; // 0 to 100
}

const ThreatLevelIndicator: React.FC<ThreatLevelIndicatorProps> = ({ level }) => {
  const [threatState, setThreatState] = useState({
    label: "Low",
    color: "bg-cyber-success",
    textColor: "text-cyber-success",
    icon: Shield
  });

  useEffect(() => {
    if (level < 30) {
      setThreatState({
        label: "Low",
        color: "bg-cyber-success",
        textColor: "text-cyber-success",
        icon: Shield
      });
    } else if (level < 70) {
      setThreatState({
        label: "Medium",
        color: "bg-cyber-warning",
        textColor: "text-cyber-warning",
        icon: Shield
      });
    } else {
      setThreatState({
        label: "High",
        color: "bg-cyber-danger",
        textColor: "text-cyber-danger",
        icon: AlertTriangle
      });
    }
  }, [level]);

  const Icon = threatState.icon;

  return (
    <div className="cyber-border p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <Icon className={`h-5 w-5 ${threatState.textColor}`} />
          <h3 className="text-sm font-semibold">THREAT LEVEL</h3>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-bold ${threatState.textColor}`}>
          {threatState.label.toUpperCase()}
        </div>
      </div>
      <Progress 
        value={level} 
        className="h-2 bg-cyber-dark" 
        indicatorClassName={`${threatState.color} ${level > 70 ? 'animate-pulse' : ''}`} 
      />
      <div className="flex justify-between text-xs mt-1">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
};

export default ThreatLevelIndicator;
