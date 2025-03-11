-- Enable Row Level Security
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_connections ENABLE ROW LEVEL SECURITY;

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level TEXT NOT NULL CHECK (level IN ('critical', 'warning', 'info', 'resolved')),
  message TEXT NOT NULL,
  source TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Create network_nodes table
CREATE TABLE IF NOT EXISTS network_nodes (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('source', 'destination', 'router')),
  status TEXT NOT NULL CHECK (status IN ('normal', 'suspicious', 'malicious')),
  x NUMERIC NOT NULL,
  y NUMERIC NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Create network_connections table
CREATE TABLE IF NOT EXISTS network_connections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  source TEXT NOT NULL REFERENCES network_nodes(id),
  target TEXT NOT NULL REFERENCES network_nodes(id),
  status TEXT NOT NULL CHECK (status IN ('normal', 'suspicious', 'malicious')),
  traffic INTEGER CHECK (traffic >= 0 AND traffic <= 5),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_alerts_level ON alerts(level);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_source ON alerts(source);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(read);

CREATE INDEX IF NOT EXISTS idx_nodes_status ON network_nodes(status);
CREATE INDEX IF NOT EXISTS idx_connections_status ON network_connections(status);
CREATE INDEX IF NOT EXISTS idx_connections_source_target ON network_connections(source, target);

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON alerts FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON network_nodes FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON network_connections FOR SELECT USING (true);

-- Create functions for real-time updates
CREATE OR REPLACE FUNCTION handle_updated_at()
  RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for last_updated
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON network_nodes
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON network_connections
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();