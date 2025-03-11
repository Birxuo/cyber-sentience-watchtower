
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, RefreshCcw, Filter, ArrowUpDown } from 'lucide-react';
import mockDataService from '@/services/mockDataService';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TrafficData {
  time: string;
  packets: number;
  bandwidth: number;
}

const LiveTrafficMonitor: React.FC = () => {
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [viewMode, setViewMode] = useState<'packets' | 'bandwidth'>('packets');
  const [timeRange, setTimeRange] = useState<'1m' | '5m' | '15m'>('5m');
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  
  // Initialize traffic data
  useEffect(() => {
    // Generate initial data based on timeRange
    generateTrafficData();
    
    // Set up interval for data updates if auto-refresh is enabled
    let interval: NodeJS.Timeout | null = null;
    
    if (isAutoRefresh) {
      interval = setInterval(() => {
        updateTrafficData();
      }, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh, timeRange]);
  
  // Generate mock traffic data based on the selected time range
  const generateTrafficData = () => {
    const now = new Date();
    const data: TrafficData[] = [];
    
    // Determine number of data points and interval based on time range
    let dataPoints = 0;
    let intervalMinutes = 0;
    
    switch (timeRange) {
      case '1m':
        dataPoints = 12;
        intervalMinutes = 5;
        break;
      case '5m':
        dataPoints = 20;
        intervalMinutes = 15;
        break;
      case '15m':
        dataPoints = 30;
        intervalMinutes = 30;
        break;
    }
    
    // Generate data points
    for (let i = dataPoints - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * intervalMinutes * 60000);
      const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Use data from mockDataService for realistic values
      const mockData = mockDataService.getCurrentData();
      const trafficStat = mockData.trafficStats.find(stat => stat.label === 'PACKETS/SEC');
      const bandwidthStat = mockData.trafficStats.find(stat => stat.label === 'BANDWIDTH (MBPS)');
      
      // Add some randomness to make it look like real traffic
      const basePackets = trafficStat ? trafficStat.value : 3800;
      const baseBandwidth = bandwidthStat ? bandwidthStat.value : 450;
      
      const packets = Math.max(0, Math.floor(basePackets * (0.85 + Math.random() * 0.3)));
      const bandwidth = Math.max(0, Math.floor(baseBandwidth * (0.85 + Math.random() * 0.3)));
      
      data.push({ time: timeString, packets, bandwidth });
    }
    
    setTrafficData(data);
  };
  
  const updateTrafficData = () => {
    // Get latest data from mock service
    const mockData = mockDataService.getCurrentData();
    const trafficStat = mockData.trafficStats.find(stat => stat.label === 'PACKETS/SEC');
    const bandwidthStat = mockData.trafficStats.find(stat => stat.label === 'BANDWIDTH (MBPS)');
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const basePackets = trafficStat ? trafficStat.value : 3800;
    const baseBandwidth = bandwidthStat ? bandwidthStat.value : 450;
    
    const packets = Math.max(0, Math.floor(basePackets * (0.85 + Math.random() * 0.3)));
    const bandwidth = Math.max(0, Math.floor(baseBandwidth * (0.85 + Math.random() * 0.3)));
    
    // Add new data point and remove oldest
    setTrafficData(prev => {
      const newData = [...prev, { time: timeString, packets, bandwidth }];
      return newData.slice(1);
    });
  };
  
  // Manually refresh data
  const handleRefresh = () => {
    updateTrafficData();
  };
  
  // Calculate current traffic values
  const currentValue = viewMode === 'packets' 
    ? trafficData.length > 0 ? trafficData[trafficData.length - 1].packets : 0
    : trafficData.length > 0 ? trafficData[trafficData.length - 1].bandwidth : 0;
  
  // Calculate change from previous reading
  const previousValue = trafficData.length > 1 
    ? (viewMode === 'packets' ? trafficData[trafficData.length - 2].packets : trafficData[trafficData.length - 2].bandwidth)
    : currentValue;
  
  const changePercent = previousValue === 0 
    ? 0 
    : Math.floor(((currentValue - previousValue) / previousValue) * 100);
  
  // Get visualization color based on traffic load
  const getLineColor = () => {
    const mockData = mockDataService.getCurrentData();
    const criticalAlert = mockData.alerts.some(alert => alert.level === 'critical');
    
    if (criticalAlert) return '#ef4444'; // Red for critical alerts
    
    const suspiciousNode = mockData.nodes.some(node => node.status === 'suspicious' || node.status === 'malicious');
    if (suspiciousNode) return '#f59e0b'; // Yellow/amber for suspicious activity
    
    return '#10b981'; // Green for normal traffic
  }

  return (
    <div className="cyber-border p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-cyber-primary" />
          <h3 className="text-sm font-semibold">LIVE TRAFFIC MONITOR</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
          >
            <RefreshCcw className={`h-4 w-4 mr-1 ${isAutoRefresh ? 'text-cyber-primary animate-spin' : ''}`} />
            {isAutoRefresh ? 'Auto' : 'Manual'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={handleRefresh}
            disabled={isAutoRefresh}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
        <div className="md:col-span-8 bg-cyber-dark/30 p-3 rounded">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <Select
                value={viewMode}
                onValueChange={(value) => setViewMode(value as 'packets' | 'bandwidth')}
              >
                <SelectTrigger className="h-8 text-xs w-[130px]">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="packets">Packets/Sec</SelectItem>
                  <SelectItem value="bandwidth">Bandwidth</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={timeRange}
                onValueChange={(value) => setTimeRange(value as '1m' | '5m' | '15m')}
              >
                <SelectTrigger className="h-8 text-xs w-[90px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 Minute</SelectItem>
                  <SelectItem value="5m">5 Minutes</SelectItem>
                  <SelectItem value="15m">15 Minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-xs text-cyber-text/70">
              Last update: {trafficData.length > 0 ? trafficData[trafficData.length - 1].time : 'N/A'}
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={150}>
            <LineChart
              data={trafficData}
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis 
                dataKey="time" 
                stroke="#9ca3af" 
                tick={{ fontSize: 10 }} 
                tickSize={5}
                tickMargin={5}
              />
              <YAxis 
                stroke="#9ca3af" 
                tick={{ fontSize: 10 }}
                tickSize={5}
                tickMargin={5}
                width={40}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: '1px solid #1e40af',
                  borderRadius: '4px',
                  color: '#e2e8f0',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey={viewMode === 'packets' ? 'packets' : 'bandwidth'} 
                stroke={getLineColor()}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="md:col-span-4 bg-cyber-dark/30 p-3 rounded flex flex-col justify-center">
          <div className="text-center mb-2">
            <div className="text-xs text-cyber-text/70 uppercase">
              {viewMode === 'packets' ? 'PACKETS/SECOND' : 'BANDWIDTH (MBPS)'}
            </div>
            <div className="text-2xl font-bold mt-1 text-cyber-primary">
              {currentValue.toLocaleString()}
            </div>
            <div className={`text-xs mt-1 flex items-center justify-center ${
              changePercent > 0 ? 'text-cyber-danger' : 
              changePercent < 0 ? 'text-cyber-success' : 
              'text-cyber-text/70'
            }`}>
              <ArrowUpDown className="h-3 w-3 mr-1" />
              {changePercent > 0 ? '+' : ''}{changePercent}% from previous
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-cyber-dark/50 p-2 rounded">
              <div className="text-xs text-cyber-text/70">PEAK</div>
              <div className="text-sm font-medium">
                {Math.max(...trafficData.map(d => viewMode === 'packets' ? d.packets : d.bandwidth)).toLocaleString()}
              </div>
            </div>
            <div className="bg-cyber-dark/50 p-2 rounded">
              <div className="text-xs text-cyber-text/70">AVERAGE</div>
              <div className="text-sm font-medium">
                {Math.floor(trafficData.reduce((sum, d) => sum + (viewMode === 'packets' ? d.packets : d.bandwidth), 0) / 
                (trafficData.length || 1)).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-cyber-dark/30 p-3 rounded">
        <h4 className="text-xs font-medium mb-2 text-cyber-text/70">TRAFFIC HIGHLIGHTS</h4>
        <ScrollArea className="h-[60px]">
          <div className="space-y-1 text-xs">
            {mockDataService.getCurrentData().nodes
              .filter(node => node.status !== 'normal')
              .slice(0, 3)
              .map((node, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-cyber-dark">
                  <span className={node.status === 'malicious' ? 'text-cyber-danger' : 'text-cyber-warning'}>
                    {node.id}
                  </span>
                  <span>{node.status.toUpperCase()}</span>
                </div>
              ))}
            {mockDataService.getCurrentData().connections
              .filter(conn => conn.status !== 'normal')
              .slice(0, 2)
              .map((conn, idx) => (
                <div key={`conn-${idx}`} className="flex justify-between py-1 border-b border-cyber-dark">
                  <span className={conn.status === 'malicious' ? 'text-cyber-danger' : 'text-cyber-warning'}>
                    {conn.source} → {conn.target}
                  </span>
                  <span>HIGH TRAFFIC</span>
                </div>
              ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default LiveTrafficMonitor;
