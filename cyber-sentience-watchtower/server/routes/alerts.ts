import express from 'express';
import { supabase, TABLES } from '../lib/supabase';
import { io } from '../server';

const router = express.Router();

// Get all alerts with optional filtering
router.get('/', async (req, res) => {
  try {
    const { level, source, timeRange, read } = req.query;
    
    let query = supabase
      .from(TABLES.ALERTS)
      .select('*')
      .order('level', { ascending: true })
      .order('timestamp', { ascending: false })
      .limit(100);
    
    // Filter by alert level
    if (level) {
      if (Array.isArray(level)) {
        query = query.in('level', level);
      } else {
        query = query.eq('level', level);
      }
    }
    
    // Filter by source
    if (source) {
      query = query.eq('source', source);
    }
    
    // Filter by time range
    if (timeRange) {
      const now = new Date();
      let timeAgo;
      
      switch(timeRange) {
        case '1h':
          timeAgo = new Date(now.getTime() - 3600000); // 1 hour ago
          break;
        case '24h':
          timeAgo = new Date(now.getTime() - 86400000); // 24 hours ago
          break;
        case '7d':
          timeAgo = new Date(now.getTime() - 604800000); // 7 days ago
          break;
        default:
          timeAgo = null;
      }
      
      if (timeAgo) {
        query = query.gte('timestamp', timeAgo.toISOString());
      }
    }
    
    // Filter by read status
    if (read !== undefined) {
      query = query.eq('read', read === 'true');
    }
    
    const { data: alerts, error } = await query;
    
    if (error) throw error;
      
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Failed to fetch alerts' });
  }
});

// Get a specific alert by ID
router.get('/:id', async (req, res) => {
  try {
    const { data: alert, error } = await supabase
      .from(TABLES.ALERTS)
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    res.status(200).json(alert);
  } catch (error) {
    console.error('Error fetching alert:', error);
    res.status(500).json({ message: 'Failed to fetch alert' });
  }
});

// Create a new alert
router.post('/', async (req, res) => {
  try {
    const { level, message, source } = req.body;
    
    if (!level || !message || !source) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newAlert = {
      id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      source,
      read: false
    };
    
    const { data, error } = await supabase
      .from(TABLES.ALERTS)
      .insert(newAlert)
      .select()
      .single();
    
    if (error) throw error;
    
    // Emit socket event for real-time updates
    io.emit('newAlert', data);
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ message: 'Failed to create alert' });
  }
});

// Mark an alert as read/unread
router.patch('/:id/read', async (req, res) => {
  try {
    const { read } = req.body;
    
    if (read === undefined) {
      return res.status(400).json({ message: 'Missing read status' });
    }
    
    const { data: alert, error } = await supabase
      .from(TABLES.ALERTS)
      .update({ read })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    res.status(200).json(alert);
  } catch (error) {
    console.error('Error updating alert read status:', error);
    res.status(500).json({ message: 'Failed to update alert read status' });
  }
});

// Delete an alert
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from(TABLES.ALERTS)
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    
    // Emit socket event for real-time updates
    io.emit('alertDeleted', req.params.id);
    
    res.status(200).json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ message: 'Failed to delete alert' });
  }
});

// Mark all alerts as read
router.post('/mark-all-read', async (req, res) => {
  try {
    const { level, source } = req.body;
    
    let query = supabase
      .from(TABLES.ALERTS)
      .update({ read: true })
      .eq('read', false);
    
    // Apply filters if provided
    if (level) {
      query = query.eq('level', level);
    }
    
    if (source) {
      query = query.eq('source', source);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.status(200).json({ 
      message: 'Alerts marked as read',
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Error marking alerts as read:', error);
    res.status(500).json({ message: 'Failed to mark alerts as read' });
  }
});

export default router;