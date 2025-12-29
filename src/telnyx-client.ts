import Telnyx from 'telnyx';
import { createLogger } from './utils/logger.js';
import {
  TelnyxConfig,
  SendSMSParams,
  SendSMSResponse,
  MakeCallParams,
  MakeCallResponse,
  MessageStatus,
  PhoneNumber,
  NumberDetails,
} from './types/index.js';

const logger = createLogger('telnyx-client');

export class TelnyxClient {
  private client: any;
  private profileId?: string;
  private defaultFromNumber?: string;

  constructor(config: TelnyxConfig) {
    this.client = Telnyx(config.apiKey);
    this.profileId = config.profileId;
    this.defaultFromNumber = process.env.TELNYX_FROM_NUMBER;
    
    logger.info('TELNYX client initialized');
  }

  /**
   * Send an SMS message
   */
  async sendSMS(params: SendSMSParams): Promise<SendSMSResponse> {
    try {
      logger.info(`Sending SMS to ${params.to}`);

      const fromNumber = params.from || this.defaultFromNumber;
      if (!fromNumber) {
        throw new Error('No from number specified and no default configured');
      }

      const response = await this.client.messages.create({
        from: fromNumber,
        to: params.to,
        text: params.message,
        messaging_profile_id: this.profileId,
      });

      logger.info(`SMS sent successfully. Message ID: ${response.data.id}`);

      return {
        success: true,
        messageId: response.data.id,
        to: params.to,
        from: fromNumber,
        status: response.data.to[0]?.status || 'queued',
        segments: response.data.parts || 1,
      };
    } catch (error: any) {
      logger.error('Error sending SMS:', error);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  /**
   * Get message delivery status
   */
  async getMessageStatus(messageId: string): Promise<MessageStatus> {
    try {
      logger.info(`Fetching status for message: ${messageId}`);

      const response = await this.client.messages.retrieve(messageId);
      const message = response.data;

      return {
        messageId: message.id,
        status: message.to[0]?.status || 'unknown',
        to: message.to[0]?.phone_number,
        from: message.from.phone_number,
        text: message.text,
        direction: message.direction,
        createdAt: message.created_at,
        updatedAt: message.updated_at,
        errors: message.errors || [],
      };
    } catch (error: any) {
      logger.error('Error fetching message status:', error);
      throw new Error(`Failed to get message status: ${error.message}`);
    }
  }

  /**
   * Make an outbound voice call with text-to-speech
   */
  async makeCall(params: MakeCallParams): Promise<MakeCallResponse> {
    try {
      logger.info(`Initiating call to ${params.to}`);

      const connectionId = process.env.TELNYX_CONNECTION_ID;
      if (!connectionId) {
        throw new Error('TELNYX_CONNECTION_ID not configured');
      }

      const response = await this.client.calls.create({
        connection_id: connectionId,
        to: params.to,
        from: params.from,
        answer_on_bridge: true,
      });

      const callControlId = response.data.call_control_id;

      // Speak the message using text-to-speech
      await this.client.calls.speak(callControlId, {
        payload: params.message,
        voice: params.voice || 'female',
        language: 'en-US',
      });

      logger.info(`Call initiated successfully. Call Control ID: ${callControlId}`);

      return {
        success: true,
        callControlId,
        callId: response.data.call_leg_id,
        to: params.to,
        from: params.from,
        status: response.data.state,
      };
    } catch (error: any) {
      logger.error('Error making call:', error);
      throw new Error(`Failed to make call: ${error.message}`);
    }
  }

  /**
   * Hang up an active call
   */
  async hangupCall(callControlId: string): Promise<{ success: boolean }> {
    try {
      logger.info(`Hanging up call: ${callControlId}`);

      await this.client.calls.hangup(callControlId);

      logger.info('Call hung up successfully');
      return { success: true };
    } catch (error: any) {
      logger.error('Error hanging up call:', error);
      throw new Error(`Failed to hang up call: ${error.message}`);
    }
  }

  /**
   * List all phone numbers on the account
   */
  async listPhoneNumbers(): Promise<PhoneNumber[]> {
    try {
      logger.info('Fetching phone numbers');

      const response = await this.client.phoneNumbers.list({
        page: { size: 100 },
      });

      const numbers = response.data.map((number: any) => ({
        phoneNumber: number.phone_number,
        status: number.status,
        features: {
          sms: number.features?.sms || false,
          mms: number.features?.mms || false,
          voice: number.features?.voice || false,
        },
        connectionId: number.connection_id,
        messagingProfileId: number.messaging_profile_id,
      }));

      logger.info(`Found ${numbers.length} phone numbers`);
      return numbers;
    } catch (error: any) {
      logger.error('Error listing phone numbers:', error);
      throw new Error(`Failed to list phone numbers: ${error.message}`);
    }
  }

  /**
   * Get detailed information about a specific phone number
   */
  async getNumberDetails(phoneNumber: string): Promise<NumberDetails> {
    try {
      logger.info(`Fetching details for number: ${phoneNumber}`);

      const response = await this.client.phoneNumbers.retrieve(phoneNumber);
      const number = response.data;

      return {
        phoneNumber: number.phone_number,
        status: number.status,
        connectionId: number.connection_id,
        connectionName: number.connection_name,
        messagingProfileId: number.messaging_profile_id,
        messagingProfileName: number.messaging_profile_name,
        features: {
          sms: number.features?.sms || false,
          mms: number.features?.mms || false,
          voice: number.features?.voice || false,
        },
        billingGroupId: number.billing_group_id,
        emergencyEnabled: number.emergency_enabled,
        createdAt: number.created_at,
        updatedAt: number.updated_at,
      };
    } catch (error: any) {
      logger.error('Error fetching number details:', error);
      throw new Error(`Failed to get number details: ${error.message}`);
    }
  }
}
