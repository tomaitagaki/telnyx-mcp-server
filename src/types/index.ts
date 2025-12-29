/**
 * TELNYX MCP Server Type Definitions
 */

// Configuration
export interface TelnyxConfig {
  apiKey: string;
  profileId?: string;
}

// SMS Types
export interface SendSMSParams {
  to: string;
  message: string;
  from?: string;
}

export interface SendSMSResponse {
  success: boolean;
  messageId: string;
  to: string;
  from: string;
  status: string;
  segments: number;
}

export interface MessageStatus {
  messageId: string;
  status: string;
  to: string;
  from: string;
  text: string;
  direction: string;
  createdAt: string;
  updatedAt: string;
  errors: any[];
}

// Voice Types
export interface MakeCallParams {
  to: string;
  from: string;
  message: string;
  voice?: 'male' | 'female';
}

export interface MakeCallResponse {
  success: boolean;
  callControlId: string;
  callId: string;
  to: string;
  from: string;
  status: string;
}

// Phone Number Types
export interface PhoneNumber {
  phoneNumber: string;
  status: string;
  features: {
    sms: boolean;
    mms: boolean;
    voice: boolean;
  };
  connectionId?: string;
  messagingProfileId?: string;
}

export interface NumberDetails extends PhoneNumber {
  connectionName?: string;
  messagingProfileName?: string;
  billingGroupId?: string;
  emergencyEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Webhook Types
export interface WebhookEvent {
  data: {
    event_type: string;
    id: string;
    occurred_at: string;
    payload: any;
  };
}

export interface IncomingSMSEvent {
  messageId: string;
  from: string;
  to: string;
  text: string;
  receivedAt: string;
  media?: Array<{
    url: string;
    contentType: string;
  }>;
}

export interface CallEvent {
  callControlId: string;
  callId: string;
  from: string;
  to: string;
  direction: string;
  state: string;
  occurredAt: string;
}
