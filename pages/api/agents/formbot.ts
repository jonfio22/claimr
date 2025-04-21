/**
 * FormBot Agent – Modular Vendor Form Submission Handler
 * Routes RMA requests to vendor-specific modules
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { RMARecord } from '@/agents/formbot/vendorModules/types';

// Dynamic import function for vendor modules
const getVendorModule = async (vendor: string) => {
  try {
    // Convert vendor name to lowercase and remove spaces
    const normalizedVendor = vendor.toLowerCase().replace(/\s+/g, '');
    return await import(`@/agents/formbot/vendorModules/${normalizedVendor}`);
  } catch (error) {
    console.error(`[formbot:core] No module found for vendor: ${vendor}`);
    throw new Error(`Unsupported vendor: ${vendor}`);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { id } = req.body;

  if (!id) {
    console.error('[formbot:core] Missing RMA ID');
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
      console.error(`[formbot:core] RMA not found: ${id}`);
      return res.status(400).json({ error: 'RMA not found' });
    }
    
    // Import the appropriate vendor module
    console.log(`[formbot:core] Processing RMA ${id} for vendor ${data.vendor}`);
    const vendorModule = await getVendorModule(data.vendor);
    
    // Submit the form using the vendor module
    const result = await vendorModule.submitForm(data as RMARecord);
    
    console.log(`[formbot:core] Successful submission, RMA ID: ${result.vendor_rma_id}`);
    
    return res.status(200).json({
      success: true,
      vendor_rma_id: result.vendor_rma_id
    });
  } catch (err) {
    console.error('[formbot:core] Error:', err);
    return res.status(500).json({ error: `Failed to process RMA: ${err.message}` });
  }
}
