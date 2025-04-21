/**
 * NEC Vendor Module
 * Handles RMA form submissions for NEC equipment via API integration
 */

import { RMARecord, FormSubmissionResult } from './types';

// Load environment variables
declare const process: { env: { [key: string]: string | undefined } };
const NEC_API_URL = process.env.NEC_API_URL || 'https://api.nec.com/rma/submit';
const NEC_API_KEY = process.env.NEC_API_KEY || '';

if (!NEC_API_KEY) {
  console.warn('[formbot:nec] NEC_API_KEY is not set in environment variables');
}

/**
 * Submit RMA form to NEC's API endpoint
 * @param data RMA record data from Supabase
 * @returns Object containing the vendor RMA ID
 */
export async function submitForm(data: RMARecord): Promise<FormSubmissionResult> {
  console.log(`[formbot:nec] Processing RMA submission for ${data.serial_number}`);
  
  try {
    // Build payload for NEC API - note the field name mapping
    const payload = {
      sn: data.serial_number,                // NEC's expected field name
      model: data.model_number,              // NEC's expected field name
      issue_text: data.issue_description,    // NEC's expected field name
      requester_email: data.submitted_by     // NEC's expected field name
    };
    
    console.log(`[formbot:nec] Sending request to NEC API: ${NEC_API_URL}`);
    
    // Send POST request to NEC API
    const response = await fetch(NEC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NEC_API_KEY}`,
        'User-Agent': 'Claimr-RMA-Agent/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    // Handle unsuccessful response
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NEC API returned ${response.status}: ${errorText}`);
    }
    
    // Parse response
    const responseData = await response.json();
    
    if (!responseData.rma_case_number) {
      throw new Error('NEC API response missing rma_case_number field');
    }
    
    const vendorRmaId = responseData.rma_case_number;
    console.log(`[formbot:nec] Successfully created RMA: ${vendorRmaId}`);
    
    return { vendor_rma_id: vendorRmaId };
  } catch (error: unknown) {
    console.error(`[formbot:nec] API error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to submit RMA to NEC: ${errorMessage}`);
  }
}
