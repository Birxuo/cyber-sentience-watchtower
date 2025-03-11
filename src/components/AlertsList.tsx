
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, AlertCircle, CheckCircle2, ArrowRight, Download, CheckCheck, Database } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import AlertsFilter, { AlertLevel } from './AlertsFilter';
import ThreatDetailsModal from './ThreatDetailsModal';
import mockDataService from '@/services/mockDataService';
import { useToast } from "@/components/ui/use-toast";

export interface Alert {
  id: string;
  timestamp: Date;
  level: 'critical' | 'warning' | 'info' | 'resolved';
  message: string;
  source: string;
  read?: boolean;
}

interface AlertsListProps {
  alerts: Alert[];
  onClearAlert: (id: string) => void;
}

interface AlertGroups {
  [key: string]: Alert[];
}

const AlertsList: React.FC<AlertsListProps> = ({ alerts, onClearAlert }) => {
  const { toast } = useToast();
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<AlertLevel[]>(['critical', 'warning', 'info', 'resolved']);
  const [timeRange, setTimeRange] = useState('all');
  
  // State for detail modal
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for grouping
  const [groupBySource, setGroupBySource] = useState(false);
  const [readAlerts, setReadAlerts] = useState<string[]>([]);

  const getAlertIcon = (level: Alert['level']) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-cyber-danger" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-cyber-warning" />;
      case 'info':
        return <Info className="h-4 w-4 text-cyber-primary" />;
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4 text-cyber-success" />;
    }
  };

  const getAlertClass = (level: Alert['level'], isRead: boolean) => {
    const baseClass = isRead ? 'border-l-4 opacity-60 ' : 'border-l-4 ';
    switch (level) {
      case 'critical':
        return baseClass + 'border-cyber-danger bg-cyber-danger/10';
      case 'warning':
        return baseClass + 'border-cyber-warning bg-cyber-warning/10';
      case 'info':
        return baseClass + 'border-cyber-primary bg-cyber-primary/10';
      case 'resolved':
        return baseClass + 'border-cyber-success bg-cyber-success/10';
    }
  };

  // Filter alerts based on search term, selected levels, and time range
  const filteredAlerts = alerts.filter(alert => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by alert level
    const matchesLevel = selectedLevels.includes(alert.level);
    
    // Filter by time range
    let matchesTime = true;
    const now = new Date().getTime();
    const alertTime = alert.timestamp.getTime();
    if (timeRange === '1h') {
      matchesTime = now - alertTime <= 3600000; // 1 hour in ms
    } else if (timeRange === '24h') {
      matchesTime = now - alertTime <= 86400000; // 24 hours in ms
    } else if (timeRange === '7d') {
      matchesTime = now - alertTime <= 604800000; // 7 days in ms
    }
    
    return matchesSearch && matchesLevel && matchesTime;
  });

  const handleViewDetails = (source: string) => {
    // Find the node with this source id
    const allData = mockDataService.getCurrentData();
    const node = allData.nodes.find(n => n.id === source);
    
    if (node) {
      setSelectedNode(node);
      setIsModalOpen(true);
    }
  };

  const markAsRead = (id: string) => {
    if (!readAlerts.includes(id)) {
      setReadAlerts(prev => [...prev, id]);
    }
  };

  const markAllAsRead = () => {
    const ids = filteredAlerts.map(alert => alert.id);
    setReadAlerts(prev => [...new Set([...prev, ...ids])]);
    toast({
      title: "All alerts marked as read",
      description: `${ids.length} alerts updated`,
    });
  };

  const exportToCSV = () => {
    const csvContent = [
      // CSV Header
      ["ID", "Timestamp", "Level", "Message", "Source"].join(","),
      // CSV Data
      ...filteredAlerts.map(alert => [
        alert.id,
        alert.timestamp.toISOString(),
        alert.level,
        `"${alert.message.replace(/"/g, '""')}"`, // Escape quotes in CSV
        alert.source
      ].join(","))
    ].join("\n");
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `security-alerts-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Alerts exported",
      description: `${filteredAlerts.length} alerts exported to CSV`,
    });
  };

  // Group alerts by source if needed
  const renderAlerts = () => {
    if (groupBySource) {
      const groups: AlertGroups = {};
      
      filteredAlerts.forEach(alert => {
        if (!groups[alert.source]) {
          groups[alert.source] = [];
        }
        groups[alert.source].push(alert);
      });
      
      return (
        <div className="space-y-4">
          {Object.entries(groups).map(([source, alertsGroup]) => (
            <div key={source} className="bg-cyber-dark/30 p-3 rounded">
              <div className="flex justify-between items-center mb-2 border-b border-cyber-primary/10 pb-1">
                <h4 className="text-sm font-medium flex items-center">
                  <Database className="h-3 w-3 mr-1 text-cyber-primary" />
                  {source} 
                  <span className="ml-2 text-xs text-cyber-text/50">
                    ({alertsGroup.length} {alertsGroup.length === 1 ? 'alert' : 'alerts'})
                  </span>
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs hover:bg-cyber-primary/20 hover:text-cyber-primary"
                  onClick={() => handleViewDetails(source)}
                >
                  Details <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2">
                {alertsGroup.map(alert => renderAlert(alert))}
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {filteredAlerts.map(alert => renderAlert(alert))}
      </div>
    );
  };

  const renderAlert = (alert: Alert) => {
    const isRead = readAlerts.includes(alert.id);

    return (
      <div 
        key={alert.id} 
        className={`p-3 rounded ${getAlertClass(alert.level, isRead)} ${alert.level === 'critical' && !isRead ? 'animate-pulse' : ''}`}
        onClick={() => markAsRead(alert.id)}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            {getAlertIcon(alert.level)}
            <div>
              <p className="text-sm font-medium">{alert.message}</p>
              <div className="flex space-x-2 text-xs text-cyber-text/70 mt-1">
                <span>Source: {alert.source}</span>
                <span>•</span>
                <span>{alert.timestamp.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs hover:bg-cyber-primary/20 hover:text-cyber-primary"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(alert.source);
              }}
            >
              Details <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs hover:bg-cyber-dark/50"
              onClick={(e) => {
                e.stopPropagation();
                onClearAlert(alert.id);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="cyber-border p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-cyber-primary" />
          <h3 className="text-sm font-semibold">SECURITY ALERTS</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-xs py-1 px-2 bg-cyber-dark rounded">
            {filteredAlerts.filter(a => a.level === 'critical').length > 0 && (
              <span className="text-cyber-danger animate-alert-blink font-bold mr-2">
                {filteredAlerts.filter(a => a.level === 'critical').length} CRITICAL
              </span>
            )}
            <span>{filteredAlerts.length} TOTAL</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <AlertsFilter 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedLevels={selectedLevels}
          onLevelChange={setSelectedLevels}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
        
        <div className="flex ml-auto gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setGroupBySource(!groupBySource)}
          >
            <Database className="h-4 w-4 mr-1" />
            {groupBySource ? "Ungroup" : "Group by Source"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={markAllAsRead}
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark All Read
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={exportToCSV}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100%-9rem)]">
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <CheckCircle2 className="h-8 w-8 text-cyber-success mb-2" />
            <p className="text-sm text-cyber-text/70">No security alerts detected</p>
            <p className="text-xs text-cyber-text/50">System monitoring active</p>
          </div>
        ) : (
          renderAlerts()
        )}
      </ScrollArea>
      
      <ThreatDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        node={selectedNode}
        connections={mockDataService.getCurrentData().connections}
        firstDetected={new Date(Date.now() - 1800000)} // 30 minutes ago
      />
    </div>
  );
};

export default AlertsList;
