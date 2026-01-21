/**
 * Type definitions for the email broadcasting module
 */

export interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'mailgun';
  config: SMTPConfig | SendGridConfig | MailgunConfig;
}

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface SendGridConfig {
  apiKey: string;
}

export interface MailgunConfig {
  apiKey: string;
  domain: string;
  host?: string;
}

export interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface TemplateData {
  id?: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RecipientData {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  customFields?: Record<string, string>;
  status: 'active' | 'unsubscribed' | 'bounced';
  createdAt?: Date;
}

export interface CampaignData {
  id?: string;
  name: string;
  templateId: string;
  recipientListId?: string;
  recipients?: RecipientData[];
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  scheduledAt?: Date;
  sentAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MailingHistoryData {
  id?: string;
  campaignId: string;
  recipientId: string;
  recipientEmail: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  error?: string;
  trackingData?: Record<string, any>;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; email: string; error: string }>;
  recipients: RecipientData[];
}

export interface CampaignStats {
  campaignId: string;
  totalRecipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  openRate: number;
  clickRate: number;
}

export interface ScheduleConfig {
  type: 'once' | 'recurring';
  startDate: Date;
  cronExpression?: string;
  timezone?: string;
}

export interface EmailProviderResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface TrackingPixelData {
  campaignId: string;
  recipientId: string;
  type: 'open' | 'click';
  url?: string;
  timestamp: Date;
}
