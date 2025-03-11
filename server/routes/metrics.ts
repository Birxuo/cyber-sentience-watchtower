import express from 'express';
import { getSystemMetrics, updateThreatLevel } from '../services/metricsService';

const router = express.Router();

// Get all system metrics (threat level, traffic stats, detection metrics)
router.get('/', async (req, res) => {
  try {
    const metrics = await getSystemMetrics();
    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    res.status(500).json({ message: 'Failed to fetch system metrics' });
  }
});

// Get current threat level
router.get('/threat-level', async (req, res) => {
  try {
    const metrics = await getSystemMetrics();
    res.status(200).json({ threatLevel: metrics.threatLevel });
  } catch (error) {
    console.error('Error fetching threat level:', error);
    res.status(500).json({ message: 'Failed to fetch threat level' });
  }
});

// Get traffic statistics
router.get('/traffic', async (req, res) => {
  try {
    const metrics = await getSystemMetrics();
    res.status(200).json({ trafficStats: metrics.trafficStats });
  } catch (error) {
    console.error('Error fetching traffic statistics:', error);
    res.status(500).json({ message: 'Failed to fetch traffic statistics' });
  }
});

// Get AI detection metrics
router.get('/detection', async (req, res) => {
  try {
    const metrics = await getSystemMetrics();
    res.status(200).json({
      detectionMetrics: metrics.detectionMetrics,
      activeDefenses: metrics.activeDefenses,
      lastScan: metrics.lastScan
    });
  } catch (error) {
    console.error('Error fetching detection metrics:', error);
    res.status(500).json({ message: 'Failed to fetch detection metrics' });
  }
});

// Update threat level (for testing or manual override)
router.post('/threat-level', async (req, res) => {
  try {
    const { level } = req.body;
    
    if (level === undefined || level < 0 || level > 100) {
      return res.status(400).json({ message: 'Invalid threat level. Must be between 0 and 100.' });
    }
    
    const result = await updateThreatLevel(level);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating threat level:', error);
    res.status(500).json({ message: 'Failed to update threat level' });
  }
});

export default router;