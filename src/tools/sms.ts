import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { TelnyxClient } from '../telnyx-client.js';

export function setupSMSTools(client: TelnyxClient): Tool[] {
  return [
    {
      name: 'send_sms',
      description: 'Send an SMS message to a phone number. The message will be sent via TELNYX SMS service.',
      inputSchema: {
        type: 'object',
        properties: {
          to: {
            type: 'string',
            description: 'Destination phone number in E.164 format (e.g., +14155551234)',
            pattern: '^\\+[1-9]\\d{1,14}$',
          },
          message: {
            type: 'string',
            description: 'Message text to send (max 1600 characters for concatenated SMS)',
            maxLength: 1600,
          },
          from: {
            type: 'string',
            description: 'Sender phone number in E.164 format (optional, uses default if not specified)',
            pattern: '^\\+[1-9]\\d{1,14}$',
          },
        },
        required: ['to', 'message'],
      },
    },
    {
      name: 'get_message_status',
      description: 'Get the delivery status of a previously sent SMS message. Returns detailed status information including delivery state, timestamps, and any errors.',
      inputSchema: {
        type: 'object',
        properties: {
          messageId: {
            type: 'string',
            description: 'TELNYX message ID returned from send_sms',
          },
        },
        required: ['messageId'],
      },
    },
  ];
}
