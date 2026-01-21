import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { EmailProvider } from './EmailProvider';
import { MailgunConfig, EmailMessage, EmailProviderResponse } from '../types';

/**
 * Mailgun Email Provider
 */
export class MailgunProvider extends EmailProvider {
  private config: MailgunConfig;
  private mailgun: any;
  private client: any;

  constructor(config: MailgunConfig) {
    super();
    this.config = config;
    this.mailgun = new Mailgun(formData);
    this.client = this.mailgun.client({
      username: 'api',
      key: config.apiKey,
      url: config.host || 'https://api.mailgun.net'
    });
  }

  /**
   * Send email via Mailgun
   */
  async sendEmail(message: EmailMessage): Promise<EmailProviderResponse> {
    try {
      const messageData: any = {
        from: message.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text
      };

      if (message.attachments && message.attachments.length > 0) {
        messageData.attachment = message.attachments.map(att => ({
          filename: att.filename,
          data: att.content
        }));
      }

      const response = await this.client.messages.create(this.config.domain, messageData);
      
      return {
        success: true,
        messageId: response.id
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send email via Mailgun'
      };
    }
  }

  /**
   * Verify Mailgun connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.client.domains.get(this.config.domain);
      return true;
    } catch (error) {
      console.error('Mailgun connection verification failed:', error);
      return false;
    }
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return 'Mailgun';
  }
}
