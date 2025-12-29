import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { TelnyxClient } from '../telnyx-client.js';

export function setupVoiceTools(client: TelnyxClient): Tool[] {
  return [
    {
      name: 'make_call',
      description: 'Initiate an outbound voice call and speak a message using text-to-speech. The call will be made from your TELNYX number.',
      inputSchema: {
        type: 'object',
        properties: {
          to: {
            type: 'string',
            description: 'Destination phone number in E.164 format (e.g., +14155551234)',
            pattern: '^\\+[1-9]\\d{1,14}$',
          },
          from: {
            type: 'string',
            description: 'Your TELNYX phone number in E.164 format',
            pattern: '^\\+[1-9]\\d{1,14}$',
          },
          message: {
            type: 'string',
            description: 'Text message to speak using text-to-speech',
            maxLength: 5000,
          },
          voice: {
            type: 'string',
            description: 'Voice type for text-to-speech',
            enum: ['male', 'female'],
            default: 'female',
          },
        },
        required: ['to', 'from', 'message'],
      },
    },
    {
      name: 'hangup_call',
      description: 'Hang up an active call. Requires the call control ID returned from make_call.',
      inputSchema: {
        type: 'object',
        properties: {
          callControlId: {
            type: 'string',
            description: 'Call control ID from make_call response',
          },
        },
        required: ['callControlId'],
      },
    },
  ];
}
