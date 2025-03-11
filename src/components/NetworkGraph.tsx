
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, AlertTriangle } from 'lucide-react';

interface Node {
  id: string;
  type: 'source' | 'destination' | 'router';
  status: 'normal' | 'suspicious' | 'malicious';
  x: number;
  y: number;
}

interface Connection {
  source: string;
  target: string;
  status: 'normal' | 'suspicious' | 'malicious';
  traffic: number;
}

interface NetworkGraphProps {
  width: number;
  height: number;
  nodes: Node[];
  connections: Connection[];
  onNodeClick?: (node: Node) => void;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ 
  width, 
  height, 
  nodes, 
  connections,
  onNodeClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);

  // Drawing the network graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw connections
    connections.forEach(connection => {
      const source = nodes.find(n => n.id === connection.source);
      const target = nodes.find(n => n.id === connection.target);
      
      if (!source || !target) return;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      
      // Set connection style based on status
      if (connection.status === 'malicious') {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
      } else if (connection.status === 'suspicious') {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 1;
      }
      
      // Dashed line for suspicious connections
      if (connection.status === 'suspicious') {
        ctx.setLineDash([4, 2]);
      } else {
        ctx.setLineDash([]);
      }
      
      ctx.stroke();
      
      // Draw traffic indicators
      if (connection.traffic > 0) {
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        
        ctx.fillStyle = connection.status === 'malicious' 
          ? '#ef4444' 
          : connection.status === 'suspicious' 
            ? '#f59e0b' 
            : '#0ea5e9';
            
        ctx.beginPath();
        ctx.arc(midX, midY, connection.traffic, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      ctx.beginPath();
      
      // Different shapes for different node types
      if (node.type === 'router') {
        ctx.rect(node.x - 8, node.y - 8, 16, 16);
      } else {
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
      }
      
      // Fill based on status
      if (node.status === 'malicious') {
        ctx.fillStyle = '#ef4444';
      } else if (node.status === 'suspicious') {
        ctx.fillStyle = '#f59e0b';
      } else {
        ctx.fillStyle = node.type === 'source' ? '#0ea5e9' : '#8b5cf6';
      }
      
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Highlight hovered node
      if (hoveredNode && hoveredNode.id === node.id) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  }, [width, height, nodes, connections, hoveredNode]);

  // Handle mouse movement for hovering
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find hovered node
    let foundNode = null;
    for (const node of nodes) {
      const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
      if (distance < 10) {
        foundNode = node;
        break;
      }
    }

    setHoveredNode(foundNode);
  };

  // Handle click on node
  const handleClick = () => {
    if (hoveredNode && onNodeClick) {
      onNodeClick(hoveredNode);
    }
  };

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <ArrowLeftRight className="h-4 w-4 text-cyber-primary" />
        <h3 className="text-sm font-semibold">NETWORK TRAFFIC</h3>
      </div>
      
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="cursor-pointer"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />
      
      {hoveredNode && (
        <div 
          className="absolute bg-cyber-dark border border-cyber-primary/30 p-2 rounded text-xs"
          style={{ left: hoveredNode.x + 20, top: hoveredNode.y - 10 }}
        >
          <div className="flex items-center space-x-1">
            {hoveredNode.status === 'malicious' && (
              <AlertTriangle className="h-3 w-3 text-cyber-danger" />
            )}
            <span>{hoveredNode.id}</span>
          </div>
          <div className="text-cyber-text/70">{hoveredNode.type}</div>
          <div className={
            hoveredNode.status === 'malicious' 
              ? 'text-cyber-danger' 
              : hoveredNode.status === 'suspicious' 
                ? 'text-cyber-warning' 
                : 'text-cyber-success'
          }>
            {hoveredNode.status.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkGraph;
