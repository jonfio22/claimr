/**
 * Supabase database schema for Claimr
 * 
 * Tables:
 * - rma_requests: Stores RMA request information
 * - agent_logs: Logs all agent actions for auditing
 * - vendor_status: Tracks vendor-specific status for RMAs
 */

-- RMA Requests Table
CREATE TABLE IF NOT EXISTS rma_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  technician_id TEXT NOT NULL,
  vendor_id TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  equipment_serial TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'initiated',
  vendor_rma_number TEXT,
  return_tracking_number TEXT,
  replacement_tracking_number TEXT,
  last_agent_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on RMA status for quicker filtering
CREATE INDEX IF NOT EXISTS idx_rma_status ON rma_requests(status);
CREATE INDEX IF NOT EXISTS idx_rma_vendor ON rma_requests(vendor_id);

-- Agent Logs Table
CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  agent_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_data JSONB NOT NULL,
  rma_id UUID REFERENCES rma_requests(id),
  status TEXT NOT NULL,
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index on agent logs
CREATE INDEX IF NOT EXISTS idx_logs_agent_id ON agent_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_logs_rma_id ON agent_logs(rma_id);

-- Vendor Status Table
CREATE TABLE IF NOT EXISTS vendor_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  vendor_id TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  rma_id UUID REFERENCES rma_requests(id),
  status TEXT NOT NULL,
  last_checked TIMESTAMP WITH TIME ZONE NOT NULL,
  response_data JSONB NOT NULL
);

-- Create index on vendor status
CREATE INDEX IF NOT EXISTS idx_vendor_status_rma ON vendor_status(rma_id);
CREATE INDEX IF NOT EXISTS idx_vendor_status_vendor ON vendor_status(vendor_id);

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to automatically update updated_at columns
CREATE TRIGGER update_rma_request_timestamp
BEFORE UPDATE ON rma_requests
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_vendor_status_timestamp
BEFORE UPDATE ON vendor_status
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
