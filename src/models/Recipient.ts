import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';
import { RecipientData } from '../types';

/**
 * Recipient model for email recipients
 */
export class Recipient {
  public id: string;
  public email: string;
  public firstName?: string;
  public lastName?: string;
  public customFields: Record<string, string>;
  public status: 'active' | 'unsubscribed' | 'bounced';
  public createdAt: Date;

  constructor(data: RecipientData) {
    this.id = data.id || uuidv4();
    this.email = data.email.toLowerCase().trim();
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.customFields = data.customFields || {};
    this.status = data.status || 'active';
    this.createdAt = data.createdAt || new Date();
  }

  /**
   * Validate recipient data
   */
  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.email || !validator.isEmail(this.email)) {
      errors.push('Valid email address is required');
    }

    if (this.status && !['active', 'unsubscribed', 'bounced'].includes(this.status)) {
      errors.push('Invalid status value');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get full name
   */
  public getFullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.firstName || this.lastName || this.email;
  }

  /**
   * Get all variables for template personalization
   */
  public getVariables(): Record<string, string> {
    return {
      email: this.email,
      firstName: this.firstName || '',
      lastName: this.lastName || '',
      fullName: this.getFullName(),
      ...this.customFields
    };
  }

  /**
   * Convert to plain object for storage
   */
  public toJSON(): RecipientData {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      customFields: this.customFields,
      status: this.status,
      createdAt: this.createdAt
    };
  }

  /**
   * Update recipient data
   */
  public update(data: Partial<RecipientData>): void {
    if (data.email !== undefined) this.email = data.email.toLowerCase().trim();
    if (data.firstName !== undefined) this.firstName = data.firstName;
    if (data.lastName !== undefined) this.lastName = data.lastName;
    if (data.customFields !== undefined) this.customFields = data.customFields;
    if (data.status !== undefined) this.status = data.status;
  }

  /**
   * Mark as unsubscribed
   */
  public unsubscribe(): void {
    this.status = 'unsubscribed';
  }

  /**
   * Mark as bounced
   */
  public markBounced(): void {
    this.status = 'bounced';
  }
}
