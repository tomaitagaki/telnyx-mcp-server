#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { TelnyxClient } from './telnyx-client.js';
import { setupSMSTools } from './tools/sms.js';
import { setupVoiceTools } from './tools/voice.js';
import { setupNumberTools } from './tools/numbers.js';
import { createLogger } from './utils/logger.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const logger = createLogger('mcp-server');

// Validate required environment variables
const requiredEnvVars = ['TELNYX_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Initialize TELNYX client
const telnyxClient = new TelnyxClient({
  apiKey: process.env.TELNYX_API_KEY!,
  profileId: process.env.TELNYX_PROFILE_ID,
});

// Create MCP server
const server = new Server(
  {
    name: 'telnyx-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register all tools
const smsTools = setupSMSTools(telnyxClient);
const voiceTools = setupVoiceTools(telnyxClient);
const numberTools = setupNumberTools(telnyxClient);

const allTools: Tool[] = [...smsTools, ...voiceTools, ...numberTools];

logger.info(`Registered ${allTools.length} tools`);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.debug('Listing available tools');
  return { tools: allTools };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  logger.info(`Executing tool: ${name}`);
  logger.debug(`Tool arguments:`, args);

  try {
    let result;

    // SMS Tools
    if (name === 'send_sms') {
      result = await telnyxClient.sendSMS({
        to: args.to as string,
        message: args.message as string,
        from: args.from as string | undefined,
      });
    } else if (name === 'get_message_status') {
      result = await telnyxClient.getMessageStatus(args.messageId as string);
    }
    // Voice Tools
    else if (name === 'make_call') {
      result = await telnyxClient.makeCall({
        to: args.to as string,
        from: args.from as string,
        message: args.message as string,
        voice: args.voice as 'male' | 'female' | undefined,
      });
    } else if (name === 'hangup_call') {
      result = await telnyxClient.hangupCall(args.callControlId as string);
    }
    // Number Management Tools
    else if (name === 'list_phone_numbers') {
      result = await telnyxClient.listPhoneNumbers();
    } else if (name === 'get_number_details') {
      result = await telnyxClient.getNumberDetails(args.phoneNumber as string);
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }

    logger.info(`Tool ${name} executed successfully`);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    logger.error(`Error executing tool ${name}:`, error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message || 'Unknown error occurred'}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    logger.info('TELNYX MCP Server started successfully');
    logger.info('Available tools:', allTools.map(t => t.name).join(', '));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

main();
