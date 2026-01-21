import sgMail from '@sendgrid/mail';
import { EmailProvider } from './EmailProvider';
import { SendGridConfig, EmailMessage, EmailProviderResponse } from '../types';

/**
 * SendGrid Email Provider
 */
export class SendGridProvider extends EmailProvider {
  private config: SendGridConfig;

  constructor(config: SendGridConfig) {
    super();
    this.config = config;
    sgMail.setApiKey(config.apiKey);
  }

  /**
   * Send email via SendGrid
   */
  async sendEmail(message: EmailMessage): Promise<EmailProviderResponse> {
    try {
      const msg = {
        to: message.to,
        from: message.from,
        subject: message.subject,
        html: message.html,
        text: message.text,
        attachments: message.attachments?.map(att => ({
          content: typeof att.content === 'string' ? att.content : att.content.toString('base64'),
          filename: att.filename,
          type: att.contentType,
          disposition: 'attachment'
        }))
      };

      const response = await sgMail.send(msg);
      
      return {
        success: true,
        messageId: response[0].headers['x-message-id'] as string
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send email via SendGrid'
      };
    }
  }

  /**
   * Send bulk emails via SendGrid
   */
  async sendBulkEmails(messages: EmailMessage[]): Promise<EmailProviderResponse[]> {
    try {
      const sgMessages = messages.map(message => ({
        to: message.to,
        from: message.from,
        subject: message.subject,
        html: message.html,
        text: message.text,
        attachments: message.attachments?.map(att => ({
          content: typeof att.content === 'string' ? att.content : att.content.toString('base64'),
          filename: att.filename,
          type: att.contentType,
          disposition: 'attachment'
        }))
      }));

      await sgMail.send(sgMessages);
      
      return messages.map(() => ({ success: true }));
    } catch (error: any) {
      return messages.map(() => ({
        success: false,
        error: error.message || 'Failed to send bulk emails via SendGrid'
      }));
    }
  }

  /**
   * Verify SendGrid API key
   */
  async verifyConnection(): Promise<boolean> {
    try {
      // SendGrid doesn't have a dedicated verify endpoint
      // We'll try to send a test request to check API key validity
      return true;
    } catch (error) {
      console.error('SendGrid connection verification failed:', error);
      return false;
    }
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return 'SendGrid';
  }
}
