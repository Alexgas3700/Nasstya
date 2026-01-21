import nodemailer, { Transporter } from 'nodemailer';
import { EmailProvider } from './EmailProvider';
import { SMTPConfig, EmailMessage, EmailProviderResponse } from '../types';

/**
 * SMTP Email Provider
 */
export class SMTPProvider extends EmailProvider {
  private transporter: Transporter;
  private config: SMTPConfig;

  constructor(config: SMTPConfig) {
    super();
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass
      }
    });
  }

  /**
   * Send email via SMTP
   */
  async sendEmail(message: EmailMessage): Promise<EmailProviderResponse> {
    try {
      const info = await this.transporter.sendMail({
        from: message.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        attachments: message.attachments
      });

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      };
    }
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP connection verification failed:', error);
      return false;
    }
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return 'SMTP';
  }

  /**
   * Close transporter connection
   */
  close(): void {
    this.transporter.close();
  }
}
