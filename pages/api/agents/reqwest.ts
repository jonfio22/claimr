/**
 * ReqWest Agent – Intake Handler
 * Accepts RMA request data and writes to Supabase
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const { serial_number, model_number, issue_description, vendor, submitted_by } = req.body;

  if (!serial_number || !model_number || !issue_description || !vendor || !submitted_by) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase.from('rma_requests').insert([{
      serial_number,
      model_number,
      issue_description,
      vendor,
      submitted_by
    }]).select().single();

    if (error) throw error;

    console.log('[reqwest:intake] RMA submitted:', data.id);
    return res.status(200).json({ success: true, id: data.id, created_at: data.created_at });
  } catch (err) {
    console.error('[reqwest:intake] Supabase error:', err);
    return res.status(500).json({ error: 'Failed to submit RMA' });
  }
}
