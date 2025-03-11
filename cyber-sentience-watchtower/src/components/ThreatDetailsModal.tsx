
import React from 'react';
import { 
  Shield, 
  Activity, 
  Clock, 
  AlertTriangle, 
  Server, 
  Network, 
  BarChart4, 
  X 
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkNode, NetworkConnection } from '@/services/mockDataService';

interface ThreatDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  node?: NetworkNode | null;
  connections?: NetworkConnection[];
  firstDetected?: Date;
  threatScore?: number;
  mitigation?: string[];
}

const ThreatDetailsModal: React.FC<ThreatDetailsModalProps> = ({
  isOpen,
  onClose,
  node,
  connections = [],
  firstDetected = new Date(),
  threatScore = 85,
  mitigation = ["Isolate affected system", "Update security definitions", "Run deep scan"]
}) => {
  if (!node) return null;

  // Get connected nodes for this threat
  const relatedConnections = connections.filter(
    conn => conn.source === node.id || conn.target === node.id
  );

  // Calculate some metrics for visualization
  const trafficVolume = relatedConnections.reduce((sum, conn) => sum + conn.traffic, 0);
  const suspiciousCount = relatedConnections.filter(conn => conn.status === 'suspicious').length;
  const maliciousCount = relatedConnections.filter(conn => conn.status === 'malicious').length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-cyber-black border border-cyber-primary/30 text-cyber-text max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {node.status === 'malicious' ? (
                <AlertTriangle className="h-5 w-5 text-cyber-danger animate-pulse" />
              ) : node.status === 'suspicious' ? (
                <AlertTriangle className="h-5 w-5 text-cyber-warning" />
              ) : (
                <Shield className="h-5 w-5 text-cyber-primary" />
              )}
              <DialogTitle className="text-lg">
                {node.status.toUpperCase()} ACTIVITY: {node.id}
              </DialogTitle>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
          <DialogDescription className="text-cyber-text/70">
            First detected {firstDetected.toLocaleString()} | Node Type: {node.type}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="bg-cyber-dark/50 border border-cyber-primary/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyber-primary/20">
              Overview
            </TabsTrigger>
            <TabsTrigger value="traffic" className="data-[state=active]:bg-cyber-primary/20">
              Traffic Analysis
            </TabsTrigger>
            <TabsTrigger value="mitigation" className="data-[state=active]:bg-cyber-primary/20">
              Mitigation
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-cyber-dark/30 p-4 rounded border border-cyber-primary/10">
                <div className="flex items-center space-x-2 mb-3">
                  <Server className="h-4 w-4 text-cyber-primary" />
                  <h3 className="text-sm font-semibold">THREAT ASSESSMENT</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs">Threat Score</span>
                      <span className="text-xs font-bold">{threatScore}%</span>
                    </div>
                    <Progress 
                      value={threatScore} 
                      className="h-1 bg-cyber-dark" 
                      indicatorClassName={`${
                        threatScore > 75 ? 'bg-cyber-danger' : 
                        threatScore > 40 ? 'bg-cyber-warning' : 
                        'bg-cyber-primary'
                      }`} 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs">Connected Systems</span>
                      <span className="text-xs font-bold">{relatedConnections.length}</span>
                    </div>
                    <Progress 
                      value={relatedConnections.length * 10} 
                      className="h-1 bg-cyber-dark" 
                      indicatorClassName="bg-cyber-primary" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs">Malicious Indicators</span>
                      <span className="text-xs font-bold">{maliciousCount}</span>
                    </div>
                    <Progress 
                      value={maliciousCount * 20} 
                      className="h-1 bg-cyber-dark" 
                      indicatorClassName="bg-cyber-danger" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-cyber-dark/30 p-4 rounded border border-cyber-primary/10">
                <div className="flex items-center space-x-2 mb-3">
                  <Network className="h-4 w-4 text-cyber-primary" />
                  <h3 className="text-sm font-semibold">NETWORK CONNECTIONS</h3>
                </div>
                
                <div className="max-h-[200px] overflow-y-auto pr-1">
                  {relatedConnections.length > 0 ? (
                    <div className="space-y-2">
                      {relatedConnections.map((conn, idx) => (
                        <div 
                          key={idx} 
                          className={`p-2 rounded text-xs ${
                            conn.status === 'malicious' 
                              ? 'bg-cyber-danger/10 border-l-2 border-cyber-danger' 
                              : conn.status === 'suspicious'
                              ? 'bg-cyber-warning/10 border-l-2 border-cyber-warning'
                              : 'bg-cyber-dark border border-cyber-primary/5'
                          }`}
                        >
                          <div className="flex justify-between">
                            <span>{conn.source === node.id ? 'To:' : 'From:'}</span>
                            <span className="font-mono">{conn.source === node.id ? conn.target : conn.source}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span>Traffic:</span>
                            <div className="flex space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`w-2 h-2 rounded-full ${
                                    i < conn.traffic
                                      ? conn.status === 'malicious' 
                                        ? 'bg-cyber-danger' 
                                        : conn.status === 'suspicious'
                                        ? 'bg-cyber-warning'
                                        : 'bg-cyber-primary'
                                      : 'bg-cyber-dark border border-cyber-primary/10'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-cyber-text/50 text-sm">
                      No connections detected
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-cyber-dark/30 p-4 rounded border border-cyber-primary/10">
              <div className="flex items-center space-x-2 mb-3">
                <Activity className="h-4 w-4 text-cyber-primary" />
                <h3 className="text-sm font-semibold">ACTIVITY TIMELINE</h3>
              </div>
              
              <div className="space-y-3 max-h-[150px] overflow-y-auto pr-1">
                <div className="flex items-start space-x-3">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-cyber-danger"></div>
                    <div className="w-0.5 h-full bg-cyber-primary/20"></div>
                  </div>
                  <div>
                    <div className="text-xs font-bold">{firstDetected.toLocaleTimeString()}</div>
                    <div className="text-xs text-cyber-text/70">Initial detection of suspicious activity</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-cyber-warning"></div>
                    <div className="w-0.5 h-full bg-cyber-primary/20"></div>
                  </div>
                  <div>
                    <div className="text-xs font-bold">{new Date(firstDetected.getTime() + 1200000).toLocaleTimeString()}</div>
                    <div className="text-xs text-cyber-text/70">Established connection to {relatedConnections.length > 0 ? (node.id === relatedConnections[0].source ? relatedConnections[0].target : relatedConnections[0].source) : 'unknown node'}</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-cyber-primary"></div>
                  </div>
                  <div>
                    <div className="text-xs font-bold">{new Date(firstDetected.getTime() + 3600000).toLocaleTimeString()}</div>
                    <div className="text-xs text-cyber-text/70">Traffic spike detected, potential data exfiltration</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="traffic" className="mt-4">
            <div className="bg-cyber-dark/30 p-4 rounded border border-cyber-primary/10">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart4 className="h-4 w-4 text-cyber-primary" />
                <h3 className="text-sm font-semibold">TRAFFIC ANALYSIS</h3>
              </div>
              
              <div className="relative h-32 mb-4">
                {/* Simulated traffic chart with cyber aesthetic */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end h-full">
                  {[...Array(24)].map((_, i) => {
                    const height = Math.random() * 80 + 20;
                    return (
                      <div 
                        key={i}
                        style={{ height: `${height}%` }}
                        className={`w-full mx-0.5 ${
                          height > 75 ? 'bg-cyber-danger' : 
                          height > 50 ? 'bg-cyber-warning' : 
                          'bg-cyber-primary'
                        } opacity-70`}
                      />
                    );
                  })}
                </div>
                <div className="absolute top-0 left-0 right-0 h-full border-b border-cyber-primary/20">
                  <div className="absolute left-0 right-0 top-1/4 border-b border-dashed border-cyber-primary/20 text-right">
                    <span className="text-[10px] text-cyber-text/40 pr-1">75%</span>
                  </div>
                  <div className="absolute left-0 right-0 top-1/2 border-b border-dashed border-cyber-primary/20 text-right">
                    <span className="text-[10px] text-cyber-text/40 pr-1">50%</span>
                  </div>
                  <div className="absolute left-0 right-0 top-3/4 border-b border-dashed border-cyber-primary/20 text-right">
                    <span className="text-[10px] text-cyber-text/40 pr-1">25%</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold mb-2">TRAFFIC STATISTICS</h4>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-cyber-primary/10">
                        <td className="py-1 text-cyber-text/70">Total Volume</td>
                        <td className="py-1 text-right">{trafficVolume * 1024} KB</td>
                      </tr>
                      <tr className="border-b border-cyber-primary/10">
                        <td className="py-1 text-cyber-text/70">Peak Rate</td>
                        <td className="py-1 text-right">{trafficVolume * 85} KB/s</td>
                      </tr>
                      <tr className="border-b border-cyber-primary/10">
                        <td className="py-1 text-cyber-text/70">Connection Count</td>
                        <td className="py-1 text-right">{relatedConnections.length}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-cyber-text/70">Duration</td>
                        <td className="py-1 text-right">00:{Math.floor(Math.random() * 59)}:{Math.floor(Math.random() * 59)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold mb-2">ANOMALY INDICATORS</h4>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-cyber-primary/10">
                        <td className="py-1 text-cyber-text/70">Suspicious Patterns</td>
                        <td className="py-1 text-right">{suspiciousCount}</td>
                      </tr>
                      <tr className="border-b border-cyber-primary/10">
                        <td className="py-1 text-cyber-text/70">Protocol Violations</td>
                        <td className="py-1 text-right">{Math.floor(Math.random() * 5)}</td>
                      </tr>
                      <tr className="border-b border-cyber-primary/10">
                        <td className="py-1 text-cyber-text/70">Encryption Attempts</td>
                        <td className="py-1 text-right">{Math.floor(Math.random() * 10)}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-cyber-text/70">Data Exfiltration</td>
                        <td className="py-1 text-right">{node.status === 'malicious' ? 'Detected' : 'None'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="mitigation" className="mt-4">
            <div className="bg-cyber-dark/30 p-4 rounded border border-cyber-primary/10">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-4 w-4 text-cyber-primary" />
                <h3 className="text-sm font-semibold">MITIGATION STEPS</h3>
              </div>
              
              <div className="space-y-4">
                {mitigation.map((step, idx) => (
                  <div key={idx} className="flex space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-cyber-primary/20 text-cyber-primary rounded-full text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{step}</h4>
                      <p className="text-xs text-cyber-text/70 mt-1">
                        {idx === 0 && "Disconnect the affected system from the network to prevent further spread of the threat."}
                        {idx === 1 && "Ensure all security definitions and patches are up-to-date to address the latest vulnerabilities."}
                        {idx === 2 && "Run a comprehensive scan to identify and remove all traces of the threat."}
                      </p>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6">
                  <Button className="w-full bg-cyber-primary hover:bg-cyber-primary/80">
                    <Shield className="h-4 w-4 mr-2" />
                    Initiate Automated Response
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center mt-4">
          <div className="text-xs text-cyber-text/50 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ThreatDetailsModal;
