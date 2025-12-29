/**
 * Example: Make Voice Call using TELNYX MCP Server
 * 
 * This example demonstrates how to initiate a voice call
 * with text-to-speech message.
 */

import { TelnyxClient } from '../src/telnyx-client.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Initialize TELNYX client
  const client = new TelnyxClient({
    apiKey: process.env.TELNYX_API_KEY!,
    profileId: process.env.TELNYX_PROFILE_ID,
  });

  try {
    // Make a call
    console.log('Initiating voice call...');
    const result = await client.makeCall({
      to: '+14155551234', // Replace with actual number
      from: process.env.TELNYX_FROM_NUMBER!,
      message: 'Hello! This is an automated call from TELNYX MCP Server. This is a test message. Thank you!',
      voice: 'female',
    });

    console.log('Call initiated successfully:');
    console.log(JSON.stringify(result, null, 2));

    // Wait for call to complete (adjust timing as needed)
    console.log('\nWaiting 30 seconds for call to complete...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Optionally hang up if still active
    console.log('\nHanging up call...');
    await client.hangupCall(result.callControlId);
    console.log('Call ended.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
