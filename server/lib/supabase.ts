import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

// Create Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseKey);

// Database table names
export const TABLES = {
  ALERTS: 'alerts',
  NETWORK_NODES: 'network_nodes',
  NETWORK_CONNECTIONS: 'network_connections'
} as const;

// Type definitions for Supabase tables
export type Tables = {
  alerts: {
    Row: {
      id: string;
      timestamp: string;
      level: 'critical' | 'warning' | 'info' | 'resolved';
      message: string;
      source: string;
      read: boolean;
      last_updated: string;
    };
    Insert: Omit<Tables['alerts']['Row'], 'last_updated'>;
    Update: Partial<Tables['alerts']['Row']>;
  };
  network_nodes: {
    Row: {
      id: string;
      type: 'source' | 'destination' | 'router';
      status: 'normal' | 'suspicious' | 'malicious';
      x: number;
      y: number;
      last_updated: string;
    };
    Insert: Omit<Tables['network_nodes']['Row'], 'last_updated'>;
    Update: Partial<Tables['network_nodes']['Row']>;
  };
  network_connections: {
    Row: {
      id: string;
      source: string;
      target: string;
      status: 'normal' | 'suspicious' | 'malicious';
      traffic: number;
      last_updated: string;
    };
    Insert: Omit<Tables['network_connections']['Row'], 'last_updated' | 'id'>;
    Update: Partial<Tables['network_connections']['Row']>;
  };
};