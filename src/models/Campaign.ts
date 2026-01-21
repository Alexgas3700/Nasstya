import { v4 as uuidv4 } from 'uuid';
import { CampaignData, RecipientData } from '../types';

/**
 * Campaign model for email campaigns
 */
export class Campaign {
  public id: string;
  public name: string;
  public templateId: string;
  public recipientListId?: string;
  public recipients: RecipientData[];
  public status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  public scheduledAt?: Date;
  public sentAt?: Date;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: CampaignData) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.templateId = data.templateId;
    this.recipientListId = data.recipientListId;
    this.recipients = data.recipients || [];
    this.status = data.status || 'draft';
    this.scheduledAt = data.scheduledAt;
    this.sentAt = data.sentAt;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Validate campaign data
   */
  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Campaign name is required');
    }

    if (!this.templateId) {
      errors.push('Template ID is required');
    }

    if (!this.recipients || this.recipients.length === 0) {
      errors.push('At least one recipient is required');
    }

    if (this.status === 'scheduled' && !this.scheduledAt) {
      errors.push('Scheduled date is required for scheduled campaigns');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Schedule campaign
   */
  public schedule(date: Date): void {
    this.scheduledAt = date;
    this.status = 'scheduled';
    this.updatedAt = new Date();
  }

  /**
   * Start sending campaign
   */
  public startSending(): void {
    this.status = 'sending';
    this.sentAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Mark campaign as completed
   */
  public complete(): void {
    this.status = 'completed';
    this.updatedAt = new Date();
  }

  /**
   * Mark campaign as failed
   */
  public fail(): void {
    this.status = 'failed';
    this.updatedAt = new Date();
  }

  /**
   * Add recipients to campaign
   */
  public addRecipients(recipients: RecipientData[]): void {
    this.recipients.push(...recipients);
    this.updatedAt = new Date();
  }

  /**
   * Remove recipient from campaign
   */
  public removeRecipient(recipientId: string): void {
    this.recipients = this.recipients.filter(r => r.id !== recipientId);
    this.updatedAt = new Date();
  }

  /**
   * Convert to plain object for storage
   */
  public toJSON(): CampaignData {
    return {
      id: this.id,
      name: this.name,
      templateId: this.templateId,
      recipientListId: this.recipientListId,
      recipients: this.recipients,
      status: this.status,
      scheduledAt: this.scheduledAt,
      sentAt: this.sentAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Update campaign data
   */
  public update(data: Partial<CampaignData>): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.templateId !== undefined) this.templateId = data.templateId;
    if (data.recipientListId !== undefined) this.recipientListId = data.recipientListId;
    if (data.recipients !== undefined) this.recipients = data.recipients;
    if (data.status !== undefined) this.status = data.status;
    if (data.scheduledAt !== undefined) this.scheduledAt = data.scheduledAt;
    this.updatedAt = new Date();
  }
}
