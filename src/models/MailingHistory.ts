import { v4 as uuidv4 } from 'uuid';
import { MailingHistoryData } from '../types';

/**
 * MailingHistory model for tracking email delivery status
 */
export class MailingHistory {
  public id: string;
  public campaignId: string;
  public recipientId: string;
  public recipientEmail: string;
  public status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  public sentAt?: Date;
  public deliveredAt?: Date;
  public openedAt?: Date;
  public clickedAt?: Date;
  public error?: string;
  public trackingData: Record<string, any>;

  constructor(data: MailingHistoryData) {
    this.id = data.id || uuidv4();
    this.campaignId = data.campaignId;
    this.recipientId = data.recipientId;
    this.recipientEmail = data.recipientEmail;
    this.status = data.status || 'pending';
    this.sentAt = data.sentAt;
    this.deliveredAt = data.deliveredAt;
    this.openedAt = data.openedAt;
    this.clickedAt = data.clickedAt;
    this.error = data.error;
    this.trackingData = data.trackingData || {};
  }

  /**
   * Mark as sent
   */
  public markSent(messageId?: string): void {
    this.status = 'sent';
    this.sentAt = new Date();
    if (messageId) {
      this.trackingData.messageId = messageId;
    }
  }

  /**
   * Mark as delivered
   */
  public markDelivered(): void {
    this.status = 'delivered';
    this.deliveredAt = new Date();
  }

  /**
   * Mark as opened
   */
  public markOpened(): void {
    if (this.status === 'sent' || this.status === 'delivered') {
      this.status = 'opened';
      this.openedAt = new Date();
    }
  }

  /**
   * Mark as clicked
   */
  public markClicked(url?: string): void {
    if (this.status === 'opened' || this.status === 'delivered' || this.status === 'sent') {
      this.status = 'clicked';
      this.clickedAt = new Date();
      if (url) {
        this.trackingData.clickedUrl = url;
      }
    }
  }

  /**
   * Mark as bounced
   */
  public markBounced(error?: string): void {
    this.status = 'bounced';
    if (error) {
      this.error = error;
    }
  }

  /**
   * Mark as failed
   */
  public markFailed(error: string): void {
    this.status = 'failed';
    this.error = error;
  }

  /**
   * Add tracking data
   */
  public addTrackingData(key: string, value: any): void {
    this.trackingData[key] = value;
  }

  /**
   * Convert to plain object for storage
   */
  public toJSON(): MailingHistoryData {
    return {
      id: this.id,
      campaignId: this.campaignId,
      recipientId: this.recipientId,
      recipientEmail: this.recipientEmail,
      status: this.status,
      sentAt: this.sentAt,
      deliveredAt: this.deliveredAt,
      openedAt: this.openedAt,
      clickedAt: this.clickedAt,
      error: this.error,
      trackingData: this.trackingData
    };
  }
}
