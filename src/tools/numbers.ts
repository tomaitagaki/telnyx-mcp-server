import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { TelnyxClient } from '../telnyx-client.js';

export function setupNumberTools(client: TelnyxClient): Tool[] {
  return [
    {
      name: 'list_phone_numbers',
      description: 'List all TELNYX phone numbers on your account. Shows their status and capabilities (SMS, MMS, Voice).',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'get_number_details',
      description: 'Get detailed information about a specific TELNYX phone number including configuration, features, and associated profiles.',
      inputSchema: {
        type: 'object',
        properties: {
          phoneNumber: {
            type: 'string',
            description: 'Phone number to query in E.164 format (e.g., +14155551234)',
            pattern: '^\\+[1-9]\\d{1,14}$',
          },
        },
        required: ['phoneNumber'],
      },
    },
  ];
}
