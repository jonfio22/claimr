/**
 * Crestron Vendor Module
 * Handles RMA form submissions for Crestron equipment via API integration
 */

import { RMARecord, FormSubmissionResult } from './types';

// Load environment variables
declare const process: { env: { [key: string]: string | undefined } };
const CRESTRON_API_URL = process.env.CRESTRON_API_URL || 'https://api.crestron.com/support/rma';
const CRESTRON_API_KEY = process.env.CRESTRON_API_KEY || '';

if (!CRESTRON_API_KEY) {
  console.warn('[formbot:crestron] CRESTRON_API_KEY is not set in environment variables');
}

/**
 * Submit RMA form to Crestron's API endpoint
 * @param data RMA record data from Supabase
 * @returns Object containing the vendor RMA ID
 */
export async function submitForm(data: RMARecord): Promise<FormSubmissionResult> {
  console.log(`[formbot:crestron] Processing RMA submission for ${data.serial_number}`);
  
  try {
    // Build payload for Crestron API
    const payload = {
      serial_number: data.serial_number,
      model_number: data.model_number,
      issue_description: data.issue_description,
      submitted_by: data.submitted_by
    };
    
    console.log(`[formbot:crestron] Sending request to Crestron API: ${CRESTRON_API_URL}`);
    
    // Send POST request to Crestron API
    const response = await fetch(CRESTRON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CRESTRON_API_KEY}`,
        'User-Agent': 'Claimr-RMA-Agent/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    // Handle unsuccessful response
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Crestron API returned ${response.status}: ${errorText}`);
    }
    
    // Parse response
    const responseData = await response.json();
    
    if (!responseData.rma_reference) {
      throw new Error('Crestron API response missing rma_reference field');
    }
    
    const vendorRmaId = responseData.rma_reference;
    console.log(`[formbot:crestron] Successfully created RMA: ${vendorRmaId}`);
    
    return { vendor_rma_id: vendorRmaId };
  } catch (error: unknown) {
    console.error(`[formbot:crestron] API error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to submit RMA to Crestron: ${errorMessage}`);
  }
}
