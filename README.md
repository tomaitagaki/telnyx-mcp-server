# TELNYX MCP Server

A comprehensive Model Context Protocol (MCP) server for TELNYX integration, enabling AI assistants to send SMS messages, make voice calls, and handle incoming communications via webhooks.

## Features

- **SMS Messaging**: Send SMS messages to any phone number
- **Voice Calls**: Initiate outbound voice calls with text-to-speech
- **Webhook Handlers**: Process incoming SMS messages and call events
- **Number Management**: List and manage TELNYX phone numbers
- **Call Control**: Hang up active calls, transfer calls, and more
- **Message History**: Retrieve sent message history and status

## Prerequisites

- Node.js 18+ and npm
- TELNYX account with API key
- At least one TELNYX phone number configured
- Poke (Claude Desktop) or any MCP-compatible client

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/tomaitagaki/telnyx-mcp-server.git
cd telnyx-mcp-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your TELNYX credentials:

```env
TELNYX_API_KEY=your_api_key_here
TELNYX_PUBLIC_KEY=your_public_key_here
TELNYX_PROFILE_ID=your_messaging_profile_id
WEBHOOK_SECRET=your_webhook_secret
WEBHOOK_URL=https://your-domain.com/webhooks/telnyx
PORT=3000
```

### 4. Build the Project

```bash
npm run build
```

### 5. Run the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## TELNYX API Setup

### Getting Your API Key

1. Log in to [TELNYX Portal](https://portal.telnyx.com)
2. Navigate to **API Keys** in the left sidebar
3. Click **Create API Key**
4. Copy the API key and save it securely
5. Add it to your `.env` file as `TELNYX_API_KEY`

### Configuring Phone Numbers

1. Go to **Numbers** → **My Numbers** in the TELNYX Portal
2. Purchase or port a phone number if you don't have one
3. Click on your phone number to configure it
4. Under **Messaging**, create or select a Messaging Profile
5. Copy the Profile ID and add it to `.env` as `TELNYX_PROFILE_ID`
6. Under **Voice**, configure a Connection for voice calls

### Setting Up Webhooks

1. In TELNYX Portal, go to **Webhooks**
2. Click **Add Webhook**
3. Set the URL to your public endpoint (e.g., `https://your-domain.com/webhooks/telnyx`)
4. Select events to receive:
   - `message.received`
   - `message.sent`
   - `message.finalized`
   - `call.initiated`
   - `call.answered`
   - `call.hangup`
5. Generate a webhook signing secret and add it to `.env`

## Poke (Claude Desktop) Configuration

Add this to your Claude Desktop configuration file:

### macOS

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "telnyx": {
      "command": "node",
      "args": ["/absolute/path/to/telnyx-mcp-server/build/index.js"],
      "env": {
        "TELNYX_API_KEY": "your_api_key_here",
        "TELNYX_PROFILE_ID": "your_profile_id_here",
        "WEBHOOK_SECRET": "your_webhook_secret"
      }
    }
  }
}
```

### Windows

Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "telnyx": {
      "command": "node",
      "args": ["C:\\path\\to\\telnyx-mcp-server\\build\\index.js"],
      "env": {
        "TELNYX_API_KEY": "your_api_key_here",
        "TELNYX_PROFILE_ID": "your_profile_id_here",
        "WEBHOOK_SECRET": "your_webhook_secret"
      }
    }
  }
}
```

### Restart Claude Desktop

After saving the configuration, completely restart Claude Desktop to load the MCP server.

## Available MCP Tools

### SMS Tools

#### `send_sms`
Send an SMS message to a phone number.

**Parameters:**
- `to` (required): Destination phone number in E.164 format (e.g., +14155551234)
- `message` (required): Message text to send (max 1600 characters)
- `from` (optional): Sender phone number (uses default if not specified)

#### `get_message_status`
Get the delivery status of a sent message.

**Parameters:**
- `messageId` (required): TELNYX message ID

### Voice Tools

#### `make_call`
Initiate an outbound voice call with text-to-speech.

**Parameters:**
- `to` (required): Destination phone number in E.164 format
- `from` (required): Your TELNYX phone number
- `message` (required): Text to speak using TTS
- `voice` (optional): TTS voice (male, female, default: female)

#### `hangup_call`
Hang up an active call.

**Parameters:**
- `callControlId` (required): Call control ID from call initiation

### Number Management

#### `list_phone_numbers`
List all TELNYX phone numbers on your account.

**Returns:** Array of phone numbers with their capabilities and status.

#### `get_number_details`
Get detailed information about a specific phone number.

**Parameters:**
- `phoneNumber` (required): Phone number to query

## Example Usage

### Sending an SMS

```typescript
// In Claude Desktop, simply ask:
"Send an SMS to +14155551234 saying 'Hello from TELNYX MCP!'"
```

### Making a Voice Call

```typescript
// In Claude Desktop:
"Call +14155551234 from my TELNYX number and say 'This is an automated reminder about your appointment'"
```

### Checking Message Status

```typescript
// After sending a message:
"What's the status of message ID abc123?"
```

## Docker Deployment

### Build Docker Image

```bash
docker build -t telnyx-mcp-server .
```

### Run Container

```bash
docker run -d \
  -p 3000:3000 \
  -e TELNYX_API_KEY=your_key \
  -e TELNYX_PROFILE_ID=your_profile \
  -e WEBHOOK_SECRET=your_secret \
  --name telnyx-mcp \
  telnyx-mcp-server
```

## Zo Hosting Deployment

This server is designed to be deployed on Zo hosting similar to the x-link-fetcher pattern:

### 1. Prepare for Deployment

Ensure all files are committed:

```bash
git add .
git commit -m "Prepare for Zo deployment"
git push origin main
```

### 2. Deploy to Zo

Follow the deployment workflow in `deploy.yml` or use Zo CLI:

```bash
zo deploy --config deploy.yml
```

### 3. Configure Webhooks

After deployment, update your TELNYX webhook URL to point to your Zo-hosted endpoint:

```
https://your-app.zo.dev/webhooks/telnyx
```

## Project Structure

```
telnyx-mcp-server/
├── src/
│   ├── index.ts              # Main MCP server implementation
│   ├── telnyx-client.ts      # TELNYX API client wrapper
│   ├── tools/
│   │   ├── sms.ts            # SMS tool implementations
│   │   ├── voice.ts          # Voice call tool implementations
│   │   └── numbers.ts        # Number management tools
│   ├── webhooks/
│   │   ├── handler.ts        # Webhook request handler
│   │   └── validators.ts     # Webhook signature validation
│   └── types/
│       └── index.ts          # TypeScript type definitions
├── examples/
│   ├── send-sms.ts           # Example: Send SMS
│   ├── make-call.ts          # Example: Make voice call
│   └── webhook-server.ts     # Example: Standalone webhook server
├── package.json              # NPM dependencies
├── tsconfig.json             # TypeScript configuration
├── Dockerfile                # Docker container definition
├── deploy.yml                # Zo deployment configuration
├── .env.example              # Environment variable template
└── README.md                 # This file
```

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run type-check
```

## Webhook Event Handling

The server automatically processes incoming webhooks from TELNYX:

### Incoming SMS

When an SMS is received, the webhook handler:
1. Validates the webhook signature
2. Parses the message content
3. Logs the message details
4. Can trigger automated responses (configure in `webhooks/handler.ts`)

### Call Events

Call events are logged and can trigger custom logic:
- `call.initiated`: Call is being set up
- `call.answered`: Call was answered
- `call.hangup`: Call ended

## Error Handling

The server implements comprehensive error handling:

- **API Errors**: TELNYX API errors are caught and returned with helpful messages
- **Validation Errors**: Input parameters are validated before API calls
- **Webhook Validation**: Signatures are verified to prevent spoofing
- **Rate Limiting**: Built-in retry logic for rate-limited requests

## Security Best Practices

1. **Never commit `.env`**: Keep your API keys secure
2. **Use webhook signatures**: Always validate TELNYX webhook signatures
3. **HTTPS only**: Use HTTPS for all webhook endpoints
4. **Rotate keys**: Regularly rotate your API keys
5. **Limit permissions**: Use API keys with minimal required permissions

## Troubleshooting

### "Invalid API Key" Error

- Verify your API key is correct in `.env`
- Ensure the key has the required permissions
- Check if the key has expired

### Messages Not Sending

- Verify your messaging profile ID is correct
- Ensure your phone number is configured for messaging
- Check that the destination number is valid (E.164 format)
- Review TELNYX Portal for any account restrictions

### Webhooks Not Received

- Ensure your webhook URL is publicly accessible
- Verify webhook events are enabled in TELNYX Portal
- Check webhook signature validation is working
- Review server logs for errors

### Claude Desktop Not Loading MCP Server

- Verify the path in `claude_desktop_config.json` is absolute
- Ensure the build directory exists (`npm run build`)
- Check that all environment variables are set
- Completely restart Claude Desktop (not just reload)

## Resources

- [TELNYX API Documentation](https://developers.telnyx.com/docs/api/v2/overview)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [TELNYX Portal](https://portal.telnyx.com)
- [Claude Desktop Documentation](https://claude.ai/desktop)

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## Support

For issues and questions:

- GitHub Issues: [Report a bug](https://github.com/tomaitagaki/telnyx-mcp-server/issues)
- TELNYX Support: [support@telnyx.com](mailto:support@telnyx.com)

## Changelog

### v1.0.0 (2025-12-28)

- Initial release
- SMS sending and status checking
- Voice call initiation and control
- Webhook handling for incoming events
- Number management tools
- Docker and Zo deployment support
