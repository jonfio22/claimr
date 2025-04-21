/**
 * TraceRoute Agent – Vendor-based Routing Decision Handler
 * Determines which agent should handle an RMA based on its vendor
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

// Vendor routing map
const VENDOR_ROUTES: Record<string, string> = {
  'qsc': 'formbot_qsc',
  'biamp': 'formbot_biamp',
  'shure': 'formbot_shure',
  'crestron': 'callbot_crestron',
  'extron': 'formbot_extron',
  // Add additional vendors as needed
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { id } = req.body;

  if (!id) {
    console.error('[traceroute:decision] Missing RMA ID');
    return res.status(400).json({ error: 'Missing RMA ID' });
  }

  try {
    // Query Supabase for the RMA details
    const { data, error } = await supabase
      .from('rma_requests')
      .select('id, vendor')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!data) {
      console.error(`[traceroute:decision] RMA not found: ${id}`);
      return res.status(400).json({ error: 'RMA not found' });
    }

    // Normalize vendor name (lowercase, trim)
    const vendorKey = data.vendor.toLowerCase().trim();
    const nextStep = VENDOR_ROUTES[vendorKey] || 'default_handler';
    
    console.log(`[traceroute:decision] Routing RMA ${id} (${data.vendor}) to ${nextStep}`);
    
    return res.status(200).json({ 
      success: true, 
      next_step: nextStep,
      rma_id: id
    });
  } catch (err) {
    console.error('[traceroute:decision] Supabase error:', err);
    return res.status(500).json({ error: 'Failed to process routing decision' });
  }
}
