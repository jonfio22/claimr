/**
 * FormBot Request Handler
 * Core logic for processing RMA requests and routing to vendor modules
 */

import { supabase } from '../../lib/supabaseClient';
import { RMARecord } from './vendorModules/types';

// Dynamic import function for vendor modules
export const getVendorModule = async (vendor: string) => {
  try {
    // Convert vendor name to lowercase and remove spaces
    const normalizedVendor = vendor.toLowerCase().replace(/\s+/g, '');
    const module = await import(`./vendorModules/${normalizedVendor}`);
    return module[`${normalizedVendor}Module`];
  } catch (error) {
    console.error(`[formbot:core] No module found for vendor: ${vendor}`);
    throw new Error(`Unsupported vendor: ${vendor}`);
  }
};

/**
 * Process an RMA request
 * 
 * @param id The RMA request ID
 * @param req The original API request (for auth header forwarding)
 * @returns Object with RMA result
 */
export async function handleRequest(id: string, req: any) {
  // Query Supabase for the RMA details
  const { data, error } = await supabase
    .from('rma_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  
  if (!data) {
    console.error(`[formbot:core] RMA not found: ${id}`);
    throw new Error('RMA not found');
  }
  
  // Import the appropriate vendor module
  console.log(`[formbot:core] Processing RMA ${id} for vendor ${data.vendor}`);
  const module = await getVendorModule(data.vendor);
  
  // Check if this vendor requires phone interaction
  if (module.requiresPhone) {
    console.log(`[formbot:core] Vendor ${data.vendor} requires phone interaction, calling CallBot`);
    
    const callRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/agents/callbot`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': req.headers.authorization 
      },
      body: JSON.stringify({ 
        vendor: data.vendor, 
        rmaPayload: data 
      })
    }).then(r => r.json());
    
    if (callRes.status !== 'SUCCESS') {
      throw new Error(callRes.error || 'CallBot failed to obtain RMA number');
    }
    
    return { vendor_rma_id: callRes.rmaNumber };
  }
  
  // Otherwise use standard form submission
  console.log(`[formbot:core] Using online form submission for ${data.vendor}`);
  const result = await module.submit(data as RMARecord);
  
  return { vendor_rma_id: result.rmaNumber };
}
