import { supabase, TABLES } from '../lib/supabase';
import { io } from '../server';

// Generate a random IP address
const generateIP = (): string => {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

// Initialize the network with default nodes and connections
export const initializeNetwork = async (): Promise<void> => {
  try {
    // Check if we already have nodes
    const { count } = await supabase
      .from(TABLES.NETWORK_NODES)
      .select('*', { count: 'exact', head: true });
    
    if (count && count > 0) {
      console.log('Network already initialized');
      return;
    }
    
    console.log('Initializing network data...');
    
    // Create nodes - a mix of sources, routers, and destinations
    const width = 550;
    const height = 300;
    
    // Create a main router in the center
    const mainRouter = {
      id: 'Main Router',
      type: 'router',
      status: 'normal',
      x: width / 2,
      y: height / 2
    };
    
    const { error: routerError } = await supabase
      .from(TABLES.NETWORK_NODES)
      .insert(mainRouter);
    
    if (routerError) throw routerError;
    
    // Create source nodes
    const sourceNodes = [];
    for (let i = 0; i < 5; i++) {
      const sourceNode = {
        id: `Source-${generateIP()}`,
        type: 'source',
        status: 'normal',
        x: Math.random() * (width / 3) + 30,
        y: Math.random() * (height - 60) + 30
      };
      
      sourceNodes.push(sourceNode);
    }
    
    const { error: sourcesError } = await supabase
      .from(TABLES.NETWORK_NODES)
      .insert(sourceNodes);
    
    if (sourcesError) throw sourcesError;
    
    // Create destination nodes
    const destNodes = [];
    for (let i = 0; i < 7; i++) {
      const destNode = {
        id: `Dest-${generateIP()}`,
        type: 'destination',
        status: 'normal',
        x: Math.random() * (width / 3) + (width * 2/3) - 30,
        y: Math.random() * (height - 60) + 30
      };
      
      destNodes.push(destNode);
    }
    
    const { error: destsError } = await supabase
      .from(TABLES.NETWORK_NODES)
      .insert(destNodes);
    
    if (destsError) throw destsError;
    
    // Connect sources to router
    const sourceConnections = sourceNodes.map(source => ({
      source: source.id,
      target: mainRouter.id,
      status: 'normal',
      traffic: Math.floor(Math.random() * 4) + 1
    }));
    
    const { error: sourceConnsError } = await supabase
      .from(TABLES.NETWORK_CONNECTIONS)
      .insert(sourceConnections);
    
    if (sourceConnsError) throw sourceConnsError;
    
    // Connect router to destinations
    const destConnections = destNodes.map(dest => ({
      source: mainRouter.id,
      target: dest.id,
      status: 'normal',
      traffic: Math.floor(Math.random() * 3) + 1
    }));
    
    const { error: destConnsError } = await supabase
      .from(TABLES.NETWORK_CONNECTIONS)
      .insert(destConnections);
    
    if (destConnsError) throw destConnsError;
    
    console.log('Network initialized successfully');
  } catch (error) {
    console.error('Error initializing network:', error);
    throw error;
  }
};

// Simulate network activity - similar to the frontend mock service
export const simulateNetworkActivity = async () => {
  try {
    // Randomly decide what to simulate
    const action = Math.random();
    
    if (action < 0.3) {
      // Simulate an attack
      return await simulateAttack();
    } else if (action < 0.5) {
      // Simulate resolving a threat
      return await resolveThreat();
    } else {
      // Just update traffic
      return await updateNetworkTraffic();
    }
  } catch (error) {
    console.error('Error simulating network activity:', error);
    throw error;
  }
};

// Simulate an attack on the network
const simulateAttack = async () => {
  try {
    // Find a random normal node that isn't a router
    const { data: normalNodes, error: nodesError } = await supabase
      .from(TABLES.NETWORK_NODES)
      .select('*')
      .eq('status', 'normal')
      .neq('type', 'router');
    
    if (nodesError) throw nodesError;
    if (!normalNodes || normalNodes.length === 0) {
      return { message: 'No normal nodes available for attack simulation' };
    }
    
    // Select a random node
    const targetNode = normalNodes[Math.floor(Math.random() * normalNodes.length)];
    
    // Make it suspicious or malicious
    const newStatus = Math.random() < 0.7 ? 'suspicious' : 'malicious';
    
    const { error: updateNodeError } = await supabase
      .from(TABLES.NETWORK_NODES)
      .update({ status: newStatus })
      .eq('id', targetNode.id);
    
    if (updateNodeError) throw updateNodeError;
    
    // Update connections to/from this node
    const { data: connections, error: connsError } = await supabase
      .from(TABLES.NETWORK_CONNECTIONS)
      .select('*')
      .or(`source.eq.${targetNode.id},target.eq.${targetNode.id}`);
    
    if (connsError) throw connsError;
    
    if (connections) {
      for (const conn of connections) {
        const { error: updateConnError } = await supabase
          .from(TABLES.NETWORK_CONNECTIONS)
          .update({
            status: newStatus,
            traffic: Math.min(5, conn.traffic + 2)
          })
          .eq('id', conn.id);
        
        if (updateConnError) throw updateConnError;
      }
    }
    
    // Generate alert
    const alertLevel = newStatus === 'suspicious' ? 'warning' : 'critical';
    const alertMessage = newStatus === 'suspicious' 
      ? `Suspicious activity detected on ${targetNode.id}`
      : `Malicious behavior detected on ${targetNode.id}`;
    
    const { error: alertError } = await supabase
      .from(TABLES.ALERTS)
      .insert({
        id: `alert-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: alertLevel,
        message: alertMessage,
        source: targetNode.id
      });
    
    if (alertError) throw alertError;
    
    // Emit socket event for real-time updates
    io.emit('networkUpdate', {
      type: 'attack',
      node: targetNode,
      connections,
      alert: {
        id: `alert-${Date.now()}`,
        timestamp: new Date(),
        level: alertLevel,
        message: alertMessage,
        source: targetNode.id
      }
    });
    
    return {
      message: `Attack simulated on ${targetNode.id}`,
      node: targetNode,
      status: newStatus
    };
  } catch (error) {
    console.error('Error simulating attack:', error);
    throw error;
  }
};

// Resolve a threat by returning a node to normal status
const resolveThreat = async () => {
  try {
    // Find a random suspicious/malicious node
    const { data: threatenedNodes, error: nodesError } = await supabase
      .from(TABLES.NETWORK_NODES)
      .select('*')
      .or('status.eq.suspicious,status.eq.malicious');
    
    if (nodesError) throw nodesError;
    if (!threatenedNodes || threatenedNodes.length === 0) {
      return { message: 'No threats to resolve' };
    }
    
    // Select a random node
    const targetNode = threatenedNodes[Math.floor(Math.random() * threatenedNodes.length)];
    
    // Update node status to normal
    const { error: updateNodeError } = await supabase
      .from(TABLES.NETWORK_NODES)
      .update({ status: 'normal' })
      .eq('id', targetNode.id);
    
    if (updateNodeError) throw updateNodeError;
    
    // Update connections to/from this node
    const { data: connections, error: connsError } = await supabase
      .from(TABLES.NETWORK_CONNECTIONS)
      .select('*')
      .or(`source.eq.${targetNode.id},target.eq.${targetNode.id}`);
    
    if (connsError) throw connsError;
    
    if (connections) {
      for (const conn of connections) {
        const { error: updateConnError } = await supabase
          .from(TABLES.NETWORK_CONNECTIONS)
          .update({
            status: 'normal',
            traffic: Math.max(1, conn.traffic - 1)
          })
          .eq('id', conn.id);
        
        if (updateConnError) throw updateConnError;
      }
    }
    
    // Generate resolved alert
    const { error: alertError } = await supabase
      .from(TABLES.ALERTS)
      .insert({
        id: `alert-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'resolved',
        message: `Threat resolved on ${targetNode.id}`,
        source: targetNode.id
      });
    
    if (alertError) throw alertError;
    
    // Emit socket event for real-time updates
    io.emit('networkUpdate', {
      type: 'resolve',
      node: targetNode,
      connections
    });
    
    return {
      message: `Threat resolved on ${targetNode.id}`,
      node: targetNode
    };
  } catch (error) {
    console.error('Error resolving threat:', error);
    throw error;
  }
};

// Update network traffic
const updateNetworkTraffic = async () => {
  try {
    // Get all connections
    const { data: connections, error: connsError } = await supabase
      .from(TABLES.NETWORK_CONNECTIONS)
      .select('*');
    
    if (connsError) throw connsError;
    if (!connections) return { message: 'No connections to update' };
    
    // Update each connection's traffic
    for (const conn of connections) {
      // Random traffic change (-1, 0, or +1)
      const trafficChange = Math.floor(Math.random() * 3) - 1;
      const newTraffic = Math.max(1, Math.min(5, conn.traffic + trafficChange));
      
      if (newTraffic !== conn.traffic) {
        const { error: updateError } = await supabase
          .from(TABLES.NETWORK_CONNECTIONS)
          .update({ traffic: newTraffic })
          .eq('id', conn.id);
        
        if (updateError) throw updateError;
      }
    }
    
    // Emit socket event for real-time updates
    io.emit('networkUpdate', {
      type: 'traffic',
      connections
    });
    
    return { message: 'Network traffic updated' };
  } catch (error) {
    console.error('Error updating network traffic:', error);
    throw error;
  }
};

// Get current network topology
export const getNetworkTopology = async () => {
  try {
    const { data: nodes, error: nodesError } = await supabase
      .from(TABLES.NETWORK_NODES)
      .select('*');
    
    if (nodesError) throw nodesError;
    
    const { data: connections, error: connsError } = await supabase
      .from(TABLES.NETWORK_CONNECTIONS)
      .select('*');
    
    if (connsError) throw connsError;
    
    return {
      nodes: nodes || [],
      connections: connections || []
    };
  } catch (error) {
    console.error('Error getting network topology:', error);
    throw error;
  }
};