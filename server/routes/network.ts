import express from 'express';
import { supabase, TABLES } from '../lib/supabase';
import { simulateNetworkActivity, getNetworkTopology } from '../services/networkService';

const router = express.Router();

// Get all network nodes
router.get('/nodes', async (req, res) => {
  try {
    const { data: nodes, error } = await supabase
      .from(TABLES.NETWORK_NODES)
      .select('*');
    
    if (error) throw error;
    
    res.status(200).json(nodes);
  } catch (error) {
    console.error('Error fetching network nodes:', error);
    res.status(500).json({ message: 'Failed to fetch network nodes' });
  }
});

// Get all network connections
router.get('/connections', async (req, res) => {
  try {
    const { data: connections, error } = await supabase
      .from(TABLES.NETWORK_CONNECTIONS)
      .select('*');
    
    if (error) throw error;
    
    res.status(200).json(connections);
  } catch (error) {
    console.error('Error fetching network connections:', error);
    res.status(500).json({ message: 'Failed to fetch network connections' });
  }
});

// Get complete network topology (nodes and connections)
router.get('/topology', async (req, res) => {
  try {
    const topology = await getNetworkTopology();
    res.status(200).json(topology);
  } catch (error) {
    console.error('Error fetching network topology:', error);
    res.status(500).json({ message: 'Failed to fetch network topology' });
  }
});

// Simulate network activity (for testing)
router.post('/simulate', async (req, res) => {
  try {
    const result = await simulateNetworkActivity();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error simulating network activity:', error);
    res.status(500).json({ message: 'Failed to simulate network activity' });
  }
});

export default router;