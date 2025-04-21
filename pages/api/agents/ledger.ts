/**
 * Ledger Agent – Action Logging Handler
 * Central logging service for all agents in the Claimr mesh
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { agent, rma_id, action, details } = req.body;

  // Validate required fields
  if (!agent || !rma_id || !action || !details) {
    console.error('[ledger:log] Missing required fields');
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['agent', 'rma_id', 'action', 'details']
    });
  }

  try {
    // Prepare log data
    const logEntry = {
      agent,
      rma_id,
      action,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      timestamp: new Date().toISOString()
    };

    // Insert into agent_logs table
    const { data, error } = await supabase
      .from('agent_logs')
      .insert(logEntry)
      .select('id')
      .single();

    if (error) {
      console.error('[ledger:log] Supabase error:', error);
      return res.status(500).json({ error: 'Failed to write log entry' });
    }

    console.log(`[ledger:log] Logged action "${action}" for agent ${agent}, log ID: ${data.id}`);
    
    return res.status(200).json({
      success: true,
      log_id: data.id
    });
  } catch (err) {
    console.error('[ledger:log] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
