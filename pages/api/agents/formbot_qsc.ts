/**
 * FormBot QSC Agent – RMA Form Submission Handler
 * Simulates submission of RMA data to QSC's vendor portal
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

// Generate a fake QSC RMA number (for simulation only)
function generateQscRmaNumber(): string {
  const prefix = 'QSC';
  const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6-digit number
  return `${prefix}-${randomDigits}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { id } = req.body;

  if (!id) {
    console.error('[formbot:qsc] Missing RMA ID');
    return res.status(400).json({ error: 'Missing RMA ID' });
  }

  try {
    // Query Supabase for the RMA details
    const { data, error } = await supabase
      .from('rma_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!data) {
      console.error(`[formbot:qsc] RMA not found: ${id}`);
      return res.status(400).json({ error: 'RMA not found' });
    }

    // Simulate form submission to QSC portal
    console.log(`[formbot:qsc] Submitting RMA ${id} to QSC portal:`, {
      serialNumber: data.serial_number,
      modelNumber: data.model_number,
      issueDescription: data.issue_description,
      submittedBy: data.submitted_by
    });
    
    // Generate a fake vendor RMA ID (would come from actual API in production)
    const vendorRmaId = generateQscRmaNumber();
    
    // In a real implementation, we would update the Supabase record with the vendor RMA ID
    
    console.log(`[formbot:qsc] Success! QSC RMA created: ${vendorRmaId}`);
    
    return res.status(200).json({
      success: true,
      vendor_rma_id: vendorRmaId,
      submission_time: new Date().toISOString()
    });
  } catch (err) {
    console.error('[formbot:qsc] Error:', err);
    return res.status(500).json({ error: 'Failed to submit RMA to QSC' });
  }
}
