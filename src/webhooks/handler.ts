import { Request, Response } from 'express';
import { validateWebhookSignature } from './validators.js';
import { createLogger } from '../utils/logger.js';
import { WebhookEvent, IncomingSMSEvent, CallEvent } from '../types/index.js';

const logger = createLogger('webhook-handler');

/**
 * Main webhook handler for TELNYX events
 */
export async function handleTelnyxWebhook(req: Request, res: Response) {
  try {
    // Validate webhook signature
    const signature = req.headers['telnyx-signature-ed25519'] as string;
    const timestamp = req.headers['telnyx-timestamp'] as string;
    const publicKey = process.env.TELNYX_PUBLIC_KEY;

    if (publicKey) {
      const isValid = validateWebhookSignature(
        JSON.stringify(req.body),
        signature,
        timestamp,
        publicKey
      );

      if (!isValid) {
        logger.warn('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const event: WebhookEvent = req.body;
    const eventType = event.data.event_type;

    logger.info(`Received webhook event: ${eventType}`);

    // Route to appropriate handler
    switch (eventType) {
      case 'message.received':
        await handleIncomingSMS(event);
        break;
      case 'message.sent':
      case 'message.finalized':
        await handleMessageStatus(event);
        break;
      case 'call.initiated':
      case 'call.answered':
      case 'call.hangup':
        await handleCallEvent(event);
        break;
      default:
        logger.debug(`Unhandled event type: ${eventType}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Handle incoming SMS messages
 */
async function handleIncomingSMS(event: WebhookEvent) {
  const payload = event.data.payload;

  const incomingSMS: IncomingSMSEvent = {
    messageId: payload.id,
    from: payload.from.phone_number,
    to: payload.to[0].phone_number,
    text: payload.text,
    receivedAt: payload.received_at,
    media: payload.media?.map((m: any) => ({
      url: m.url,
      contentType: m.content_type,
    })),
  };

  logger.info('Incoming SMS:', incomingSMS);

  // TODO: Add custom logic for handling incoming messages
  // Examples:
  // - Store in database
  // - Trigger auto-replies
  // - Forward to other systems
  // - Process commands
}

/**
 * Handle message status updates
 */
async function handleMessageStatus(event: WebhookEvent) {
  const payload = event.data.payload;

  logger.info(`Message ${payload.id} status: ${payload.to[0]?.status}`);

  // TODO: Add custom logic for status tracking
  // Examples:
  // - Update delivery status in database
  // - Send notifications on delivery failure
  // - Track delivery metrics
}

/**
 * Handle call events
 */
async function handleCallEvent(event: WebhookEvent) {
  const payload = event.data.payload;

  const callEvent: CallEvent = {
    callControlId: payload.call_control_id,
    callId: payload.call_leg_id,
    from: payload.from,
    to: payload.to,
    direction: payload.direction,
    state: payload.state,
    occurredAt: event.data.occurred_at,
  };

  logger.info('Call event:', callEvent);

  // TODO: Add custom logic for call handling
  // Examples:
  // - Record call logs
  // - Implement IVR menus
  // - Forward calls
  // - Trigger notifications
}

/**
 * Health check endpoint
 */
export function handleHealthCheck(req: Request, res: Response) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}
