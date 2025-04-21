/**
 * Samsung Vendor Module
 * Handles RMA form submissions for Samsung equipment via API integration
 */

import { RMARecord, FormSubmissionResult } from './types';

// Load environment variables
declare const process: { env: { [key: string]: string | undefined } };
const SAMSUNG_API_URL = process.env.SAMSUNG_API_URL || 'https://api.samsung.com/support/rma/create';
const SAMSUNG_API_KEY = process.env.SAMSUNG_API_KEY || '';

if (!SAMSUNG_API_KEY) {
  console.warn('[formbot:samsung] SAMSUNG_API_KEY is not set in environment variables');
}

/**
 * Submit RMA form to Samsung's API endpoint
 * @param data RMA record data from Supabase
 * @returns Object containing the vendor RMA ID
 */
export async function submitForm(data: RMARecord): Promise<FormSubmissionResult> {
  console.log(`[formbot:samsung] Processing RMA submission for ${data.serial_number}`);
  
  try {
    // Build payload for Samsung API - note the field name mapping
    const payload = {
      product_serial: data.serial_number,  // Samsung's expected field name
      model_code: data.model_number,       // Samsung's expected field name
      issue: data.issue_description,       // Samsung's expected field name
      contact_email: data.submitted_by     // Samsung's expected field name
    };
    
    console.log(`[formbot:samsung] Sending request to Samsung API: ${SAMSUNG_API_URL}`);
    
    // Send POST request to Samsung API
    const response = await fetch(SAMSUNG_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SAMSUNG_API_KEY}`,
        'User-Agent': 'Claimr-RMA-Agent/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    // Handle unsuccessful response
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Samsung API returned ${response.status}: ${errorText}`);
    }
    
    // Parse response
    const responseData = await response.json();
    
    if (!responseData.rma_ticket) {
      throw new Error('Samsung API response missing rma_ticket field');
    }
    
    const vendorRmaId = responseData.rma_ticket;
    console.log(`[formbot:samsung] Successfully created RMA: ${vendorRmaId}`);
    
    return { vendor_rma_id: vendorRmaId };
  } catch (error: unknown) {
    console.error(`[formbot:samsung] API error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to submit RMA to Samsung: ${errorMessage}`);
  }
}
