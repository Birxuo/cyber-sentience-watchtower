
import React from 'react';
import { Activity, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface TrafficStat {
  label: string;
  value: number; // Current value
  change: number; // Percentage change
  max: number; // Maximum value for the progress bar
}

interface TrafficStatsProps {
  stats: TrafficStat[];
}

const TrafficStats: React.FC<TrafficStatsProps> = ({ stats }) => {
  return (
    <div className="cyber-border p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="h-5 w-5 text-cyber-primary" />
        <h3 className="text-sm font-semibold">NETWORK STATISTICS</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-cyber-dark/50 p-3 rounded border border-cyber-primary/10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-cyber-text/70">{stat.label}</span>
              <div className="flex items-center space-x-1">
                {stat.change > 0 ? (
                  <TrendingUp className="h-3 w-3 text-cyber-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-cyber-danger" />
                )}
                <span className={`text-xs ${stat.change > 0 ? 'text-cyber-success' : 'text-cyber-danger'}`}>
                  {Math.abs(stat.change)}%
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-1">
              <span className="text-lg font-bold">{stat.value.toLocaleString()}</span>
              <span className="text-xs text-cyber-text/50">max: {stat.max.toLocaleString()}</span>
            </div>
            
            <Progress 
              value={(stat.value / stat.max) * 100} 
              className="h-1 bg-cyber-dark" 
              indicatorClassName={`bg-cyber-primary`} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrafficStats;
