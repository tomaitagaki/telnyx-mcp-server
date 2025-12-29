import crypto from 'crypto';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('webhook-validator');

/**
 * Validate TELNYX webhook signature using Ed25519
 * 
 * TELNYX signs webhooks using Ed25519 signature algorithm.
 * The signature is sent in the 'telnyx-signature-ed25519' header.
 * 
 * @param payload - Raw webhook payload (JSON string)
 * @param signature - Signature from header
 * @param timestamp - Timestamp from header
 * @param publicKey - Your TELNYX public key
 * @returns True if signature is valid
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  timestamp: string,
  publicKey: string
): boolean {
  try {
    // TELNYX uses Ed25519, which is supported in Node.js crypto
    // The signed data is: timestamp.payload
    const signedData = `${timestamp}.${payload}`;

    // Convert hex signature to buffer
    const signatureBuffer = Buffer.from(signature, 'hex');

    // Prepare public key for verification
    const publicKeyObj = crypto.createPublicKey({
      key: publicKey,
      format: 'pem',
    });

    // Verify signature
    const isValid = crypto.verify(
      null, // Ed25519 doesn't use a digest
      Buffer.from(signedData),
      publicKeyObj,
      signatureBuffer
    );

    if (!isValid) {
      logger.warn('Webhook signature validation failed');
    }

    return isValid;
  } catch (error) {
    logger.error('Error validating webhook signature:', error);
    return false;
  }
}

/**
 * Validate timestamp to prevent replay attacks
 * 
 * @param timestamp - Timestamp from webhook header
 * @param toleranceSeconds - Maximum age of webhook in seconds (default: 300)
 * @returns True if timestamp is within tolerance
 */
export function validateTimestamp(
  timestamp: string,
  toleranceSeconds: number = 300
): boolean {
  try {
    const webhookTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    const age = (currentTime - webhookTime) / 1000;

    if (age > toleranceSeconds) {
      logger.warn(`Webhook timestamp too old: ${age} seconds`);
      return false;
    }

    if (age < 0) {
      logger.warn('Webhook timestamp is in the future');
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error validating timestamp:', error);
    return false;
  }
}
