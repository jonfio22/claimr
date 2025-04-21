/**
 * Biamp Vendor Module
 * Handles RMA form submissions for Biamp equipment via API integration
 */

import { RMARecord, FormSubmissionResult } from './types';

// Load environment variables
declare const process: { env: { [key: string]: string | undefined } };
const BIAMP_API_URL = process.env.BIAMP_API_URL || 'https://api.biamp.com/rma/create';
const BIAMP_API_KEY = process.env.BIAMP_API_KEY || '';

if (!BIAMP_API_KEY) {
  console.warn('[formbot:biamp] BIAMP_API_KEY is not set in environment variables');
}

/**
 * Submit RMA form to Biamp's API endpoint
 * @param data RMA record data from Supabase
 * @returns Object containing the vendor RMA ID
 */
export async function submitForm(data: RMARecord): Promise<FormSubmissionResult> {
  console.log(`[formbot:biamp] Processing RMA submission for ${data.serial_number}`);
  
  try {
    // Build payload for Biamp API
    const payload = {
      serial_number: data.serial_number,
      model_number: data.model_number,
      issue_description: data.issue_description,
      submitted_by: data.submitted_by
    };
    
    console.log(`[formbot:biamp] Sending request to Biamp API: ${BIAMP_API_URL}`);
    
    // Send POST request to Biamp API
    const response = await fetch(BIAMP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BIAMP_API_KEY}`,
        'User-Agent': 'Claimr-RMA-Agent/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    // Handle unsuccessful response
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Biamp API returned ${response.status}: ${errorText}`);
    }
    
    // Parse response
    const responseData = await response.json();
    
    if (!responseData.ticket_number) {
      throw new Error('Biamp API response missing ticket_number field');
    }
    
    const vendorRmaId = responseData.ticket_number;
    console.log(`[formbot:biamp] Successfully created RMA: ${vendorRmaId}`);
    
    return { vendor_rma_id: vendorRmaId };
  } catch (error: unknown) {
    console.error(`[formbot:biamp] API error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to submit RMA to Biamp: ${errorMessage}`);
  }
}
