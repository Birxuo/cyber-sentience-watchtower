
import React from 'react';
import { Bell, Shield, Cpu, Activity } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="cyber-border p-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-cyber-primary" />
        <h1 className="text-xl font-bold text-cyber-primary">CYBER SENTIENCE WATCHTOWER</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Cpu className="h-4 w-4 text-cyber-success animate-pulse" />
          <span className="text-xs text-cyber-text">AI SENTINEL ACTIVE</span>
        </div>
        <div className="flex items-center space-x-1">
          <Activity className="h-4 w-4 text-cyber-primary" />
          <span className="text-xs text-cyber-text">MONITORING</span>
        </div>
        <Button variant="outline" size="sm" className="border-cyber-primary/50 bg-transparent hover:bg-cyber-primary/10">
          <Bell className="h-4 w-4 mr-1" />
          Alerts
        </Button>
      </div>
    </header>
  );
};

export default Header;
