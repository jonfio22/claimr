/**
 * Failsafe Agent – Error Recovery Handler
 * Provides retry logic and escalation for failed agent operations
 */

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { agent, rma_id, error, retry_attempted } = req.body;

  // Validate required fields
  if (!agent || !rma_id || !error || retry_attempted === undefined) {
    console.error('[failsafe:handler] Missing required fields');
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['agent', 'rma_id', 'error', 'retry_attempted']
    });
  }

  try {
    // Log the failure event to the ledger agent
    console.log(`[failsafe:handler] Processing failure from ${agent} for RMA ${rma_id}`);
    
    // Call the ledger agent to record this event
    const ledgerResponse = await fetch(`${process.env.A2A_HOST || ''}/api/agents/ledger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent: 'failsafe',
        rma_id,
        action: retry_attempted ? 'escalation' : 'retry_attempt',
        details: {
          failed_agent: agent,
          error_message: error,
          retry_status: retry_attempted ? 'failed' : 'pending'
        }
      }),
    });

    if (!ledgerResponse.ok) {
      console.error('[failsafe:handler] Failed to log to ledger');
    }

    // Determine recovery action based on retry status
    if (!retry_attempted) {
      // First failure - suggest retry
      console.log(`[failsafe:handler] Recommending retry for ${agent} on RMA ${rma_id}`);
      return res.status(200).json({
        retry: true,
        message: 'Retry recommended before escalation'
      });
    } else {
      // Retry already failed - escalate to human
      console.log(`[failsafe:handler] Escalating ${agent} failure on RMA ${rma_id} to human review`);
      return res.status(200).json({
        escalate: true,
        message: 'Retry failed, escalation required',
        // In a real implementation, we might trigger an alert or create a ticket
      });
    }
  } catch (err) {
    console.error('[failsafe:handler] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error in failsafe' });
  }
}
