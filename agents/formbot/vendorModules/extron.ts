/**
 * Extron Vendor Module
 * Handles RMA form submissions for Extron equipment via API integration
 */

import { RMARecord, FormSubmissionResult } from './types';

// Load environment variables
declare const process: { env: { [key: string]: string | undefined } };
const EXTRON_API_URL = process.env.EXTRON_API_URL || 'https://api.extron.com/rma/submit';
const EXTRON_API_KEY = process.env.EXTRON_API_KEY || '';

if (!EXTRON_API_KEY) {
  console.warn('[formbot:extron] EXTRON_API_KEY is not set in environment variables');
}

/**
 * Submit RMA form to Extron's API endpoint
 * @param data RMA record data from Supabase
 * @returns Object containing the vendor RMA ID
 */
export async function submitForm(data: RMARecord): Promise<FormSubmissionResult> {
  console.log(`[formbot:extron] Processing RMA submission for ${data.serial_number}`);
  
  try {
    // Build payload for Extron API
    const payload = {
      serial_number: data.serial_number,
      model_number: data.model_number,
      issue_description: data.issue_description,
      submitted_by: data.submitted_by
    };
    
    console.log(`[formbot:extron] Sending request to Extron API: ${EXTRON_API_URL}`);
    
    // Send POST request to Extron API
    const response = await fetch(EXTRON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EXTRON_API_KEY}`,
        'User-Agent': 'Claimr-RMA-Agent/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    // Handle unsuccessful response
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Extron API returned ${response.status}: ${errorText}`);
    }
    
    // Parse response
    const responseData = await response.json();
    
    if (!responseData.confirmation_code) {
      throw new Error('Extron API response missing confirmation_code field');
    }
    
    const vendorRmaId = responseData.confirmation_code;
    console.log(`[formbot:extron] Successfully created RMA: ${vendorRmaId}`);
    
    return { vendor_rma_id: vendorRmaId };
  } catch (error: unknown) {
    console.error(`[formbot:extron] API error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to submit RMA to Extron: ${errorMessage}`);
  }
}
