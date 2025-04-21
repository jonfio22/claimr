/**
 * LG Vendor Module
 * Handles RMA form submissions for LG equipment via API integration
 */

import { RMARecord, FormSubmissionResult } from './types';

// Load environment variables
declare const process: { env: { [key: string]: string | undefined } };
const LG_API_URL = process.env.LG_API_URL || 'https://api.lg.com/service/rma';
const LG_API_KEY = process.env.LG_API_KEY || '';

if (!LG_API_KEY) {
  console.warn('[formbot:lg] LG_API_KEY is not set in environment variables');
}

/**
 * Submit RMA form to LG's API endpoint
 * @param data RMA record data from Supabase
 * @returns Object containing the vendor RMA ID
 */
export async function submitForm(data: RMARecord): Promise<FormSubmissionResult> {
  console.log(`[formbot:lg] Processing RMA submission for ${data.serial_number}`);
  
  try {
    // Build payload for LG API - note the field name mapping
    const payload = {
      serialNo: data.serial_number,            // LG's expected field name
      modelNo: data.model_number,             // LG's expected field name
      problemDescription: data.issue_description, // LG's expected field name
      requesterEmail: data.submitted_by       // LG's expected field name
    };
    
    console.log(`[formbot:lg] Sending request to LG API: ${LG_API_URL}`);
    
    // Send POST request to LG API
    const response = await fetch(LG_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LG_API_KEY}`,
        'User-Agent': 'Claimr-RMA-Agent/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    // Handle unsuccessful response
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LG API returned ${response.status}: ${errorText}`);
    }
    
    // Parse response
    const responseData = await response.json();
    
    if (!responseData.case_id) {
      throw new Error('LG API response missing case_id field');
    }
    
    const vendorRmaId = responseData.case_id;
    console.log(`[formbot:lg] Successfully created RMA: ${vendorRmaId}`);
    
    return { vendor_rma_id: vendorRmaId };
  } catch (error: unknown) {
    console.error(`[formbot:lg] API error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to submit RMA to LG: ${errorMessage}`);
  }
}
