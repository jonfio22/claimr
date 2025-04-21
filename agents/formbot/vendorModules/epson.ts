/**
 * Epson Vendor Module
 * Handles RMA form submissions for Epson equipment via API integration
 */

import { RMARecord, FormSubmissionResult } from './types';

// Load environment variables
declare const process: { env: { [key: string]: string | undefined } };
const EPSON_API_URL = process.env.EPSON_API_URL || 'https://api.epson.com/support/rma';
const EPSON_API_KEY = process.env.EPSON_API_KEY || '';

if (!EPSON_API_KEY) {
  console.warn('[formbot:epson] EPSON_API_KEY is not set in environment variables');
}

/**
 * Submit RMA form to Epson's API endpoint
 * @param data RMA record data from Supabase
 * @returns Object containing the vendor RMA ID
 */
export async function submitForm(data: RMARecord): Promise<FormSubmissionResult> {
  console.log(`[formbot:epson] Processing RMA submission for ${data.serial_number}`);
  
  try {
    // Build payload for Epson API - note the field name mapping
    const payload = {
      serial: data.serial_number,          // Epson's expected field name
      model: data.model_number,            // Epson's expected field name
      description: data.issue_description, // Epson's expected field name
      contact_email: data.submitted_by     // Epson's expected field name
    };
    
    console.log(`[formbot:epson] Sending request to Epson API: ${EPSON_API_URL}`);
    
    // Send POST request to Epson API
    const response = await fetch(EPSON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EPSON_API_KEY}`,
        'User-Agent': 'Claimr-RMA-Agent/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    // Handle unsuccessful response
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Epson API returned ${response.status}: ${errorText}`);
    }
    
    // Parse response
    const responseData = await response.json();
    
    if (!responseData.ticket_id) {
      throw new Error('Epson API response missing ticket_id field');
    }
    
    const vendorRmaId = responseData.ticket_id;
    console.log(`[formbot:epson] Successfully created RMA: ${vendorRmaId}`);
    
    return { vendor_rma_id: vendorRmaId };
  } catch (error: unknown) {
    console.error(`[formbot:epson] API error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to submit RMA to Epson: ${errorMessage}`);
  }
}
