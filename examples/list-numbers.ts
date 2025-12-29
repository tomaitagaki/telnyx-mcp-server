/**
 * Example: List and Inspect Phone Numbers
 * 
 * This example demonstrates how to list all TELNYX phone numbers
 * and get detailed information about specific numbers.
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
    // List all phone numbers
    console.log('Fetching all phone numbers...');
    const numbers = await client.listPhoneNumbers();

    console.log(`\nFound ${numbers.length} phone number(s):\n`);
    
    numbers.forEach((number, index) => {
      console.log(`${index + 1}. ${number.phoneNumber}`);
      console.log(`   Status: ${number.status}`);
      console.log(`   Features: SMS=${number.features.sms}, MMS=${number.features.mms}, Voice=${number.features.voice}`);
      if (number.messagingProfileId) {
        console.log(`   Messaging Profile: ${number.messagingProfileId}`);
      }
      console.log();
    });

    // Get detailed info about first number
    if (numbers.length > 0) {
      const firstNumber = numbers[0].phoneNumber;
      console.log(`\nFetching detailed information for ${firstNumber}...`);
      
      const details = await client.getNumberDetails(firstNumber);
      console.log('\nDetailed Information:');
      console.log(JSON.stringify(details, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
