/**
 * Example: Standalone Webhook Server
 * 
 * This example demonstrates how to run a standalone HTTP server
 * to receive TELNYX webhook events for incoming SMS and calls.
 * 
 * In production, you would deploy this to a public server or use
 * a tunneling service like ngrok for local development.
 */

import express from 'express';
import { handleTelnyxWebhook, handleHealthCheck } from '../src/webhooks/handler.js';
import { createLogger } from '../src/utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const logger = createLogger('webhook-server');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.post('/webhooks/telnyx', handleTelnyxWebhook);
app.get('/health', handleHealthCheck);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  logger.info(`Webhook server listening on port ${port}`);
  logger.info(`Webhook endpoint: http://localhost:${port}/webhooks/telnyx`);
  logger.info(`Health check: http://localhost:${port}/health`);
  
  if (process.env.NODE_ENV === 'development') {
    logger.info('\nFor local development, expose this server using ngrok:');
    logger.info(`  ngrok http ${port}`);
    logger.info('\nThen configure the ngrok URL in TELNYX Portal:');
    logger.info('  https://your-ngrok-url.ngrok.io/webhooks/telnyx');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down webhook server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down webhook server...');
  process.exit(0);
});
