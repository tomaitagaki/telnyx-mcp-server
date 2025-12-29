/**
 * Example: Send SMS using TELNYX MCP Server
 * 
 * This example demonstrates how to use the send_sms tool
 * programmatically. In practice, you would typically interact
 * with these tools through Claude Desktop or another MCP client.
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
    // Send an SMS
    console.log('Sending SMS...');
    const result = await client.sendSMS({
      to: '+14155551234', // Replace with actual number
      message: 'Hello from TELNYX MCP Server! This is a test message.',
      from: process.env.TELNYX_FROM_NUMBER,
    });

    console.log('SMS sent successfully:');
    console.log(JSON.stringify(result, null, 2));

    // Wait a moment, then check status
    console.log('\nWaiting 5 seconds before checking status...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Get message status
    console.log('\nChecking message status...');
    const status = await client.getMessageStatus(result.messageId);

    console.log('Message status:');
    console.log(JSON.stringify(status, null, 2));
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
