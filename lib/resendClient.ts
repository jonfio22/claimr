/**
 * resendClient.ts
 * Initializes and exports the Resend email client
 * 
 * Dependencies:
 * - Resend SDK
 * - Environment variables for API key
 */

import { Resend } from 'resend';

// Initialize Resend client with API key from env
const resendApiKey = process.env.RESEND_API_KEY || '';

if (!resendApiKey) {
  console.error('Missing Resend API key in environment variables');
}

export const resend = new Resend(resendApiKey);
