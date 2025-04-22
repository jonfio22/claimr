/**
 * FormBot Agent – Modular Vendor Form Submission Handler
 * Routes RMA requests to vendor-specific modules
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { validateToken } from '../../lib/validateToken';
import { handleRequest } from '../../agents/formbot/handleRequest';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  if (!(await validateToken(req, res))) return;

  const { id } = req.body;

  if (!id) {
    console.error('[formbot:core] Missing RMA ID');
    return res.status(400).json({ error: 'Missing RMA ID' });
  }

  try {
    // Process the request using the handleRequest module
    const result = await handleRequest(id, req);
    
    console.log(`[formbot:core] Successful submission, RMA ID: ${result.vendor_rma_id}`);
    
    /* ── Trigger confirmation email via Echo agent ── */
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/agents/echo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.authorization
            ? { Authorization: req.headers.authorization }
            : {})
        },
        body: JSON.stringify({ id, vendor_rma_id: result.vendor_rma_id })
      });
      console.log('[formbot:core] Echo confirmation triggered');
    } catch (mailErr) {
      console.error('[formbot:core] Echo trigger failed:', mailErr);
    }
    
    return res.status(200).json({
      success: true,
      vendor_rma_id: result.vendor_rma_id
    });
  } catch (err: any) {
    console.error('[formbot:core] Error:', err);
    return res.status(500).json({ error: `Failed to process RMA: ${err.message}` });
  }
}
