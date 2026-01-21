import { EmailMessage, EmailProviderResponse } from '../types';

/**
 * Abstract base class for email providers
 */
export abstract class EmailProvider {
  /**
   * Send a single email
   */
  abstract sendEmail(message: EmailMessage): Promise<EmailProviderResponse>;

  /**
   * Send bulk emails
   */
  async sendBulkEmails(messages: EmailMessage[]): Promise<EmailProviderResponse[]> {
    const results: EmailProviderResponse[] = [];
    
    for (const message of messages) {
      try {
        const result = await this.sendEmail(message);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  }

  /**
   * Verify connection to email service
   */
  abstract verifyConnection(): Promise<boolean>;

  /**
   * Get provider name
   */
  abstract getProviderName(): string;
}
