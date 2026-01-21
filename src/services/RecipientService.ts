import { parse } from 'csv-parse/sync';
import { Recipient } from '../models/Recipient';
import { RecipientData, ImportResult } from '../types';

/**
 * Service for managing recipients
 */
export class RecipientService {
  private recipients: Map<string, Recipient> = new Map();

  /**
   * Create a new recipient
   */
  async createRecipient(data: RecipientData): Promise<Recipient> {
    const recipient = new Recipient(data);
    const validation = recipient.validate();

    if (!validation.valid) {
      throw new Error(`Recipient validation failed: ${validation.errors.join(', ')}`);
    }

    // Check for duplicate email
    const existing = Array.from(this.recipients.values()).find(
      r => r.email === recipient.email
    );

    if (existing) {
      throw new Error(`Recipient with email ${recipient.email} already exists`);
    }

    this.recipients.set(recipient.id, recipient);
    return recipient;
  }

  /**
   * Get recipient by ID
   */
  async getRecipient(id: string): Promise<Recipient | undefined> {
    return this.recipients.get(id);
  }

  /**
   * Get recipient by email
   */
  async getRecipientByEmail(email: string): Promise<Recipient | undefined> {
    return Array.from(this.recipients.values()).find(
      r => r.email === email.toLowerCase().trim()
    );
  }

  /**
   * Get all recipients
   */
  async getAllRecipients(): Promise<Recipient[]> {
    return Array.from(this.recipients.values());
  }

  /**
   * Get active recipients only
   */
  async getActiveRecipients(): Promise<Recipient[]> {
    return Array.from(this.recipients.values()).filter(
      r => r.status === 'active'
    );
  }

  /**
   * Update recipient
   */
  async updateRecipient(id: string, data: Partial<RecipientData>): Promise<Recipient> {
    const recipient = this.recipients.get(id);
    
    if (!recipient) {
      throw new Error(`Recipient with ID ${id} not found`);
    }

    recipient.update(data);
    const validation = recipient.validate();

    if (!validation.valid) {
      throw new Error(`Recipient validation failed: ${validation.errors.join(', ')}`);
    }

    return recipient;
  }

  /**
   * Delete recipient
   */
  async deleteRecipient(id: string): Promise<boolean> {
    return this.recipients.delete(id);
  }

  /**
   * Import recipients from CSV
   */
  async importFromCSV(csvContent: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      recipients: []
    };

    try {
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        
        try {
          const recipientData: RecipientData = {
            email: record.email || record.Email || '',
            firstName: record.firstName || record.FirstName || record.first_name || '',
            lastName: record.lastName || record.LastName || record.last_name || '',
            status: 'active',
            customFields: {}
          };

          // Add any additional fields as custom fields
          Object.keys(record).forEach(key => {
            if (!['email', 'Email', 'firstName', 'FirstName', 'first_name', 'lastName', 'LastName', 'last_name'].includes(key)) {
              recipientData.customFields![key] = record[key];
            }
          });

          const recipient = await this.createRecipient(recipientData);
          result.success++;
          result.recipients.push(recipient.toJSON());
        } catch (error) {
          result.failed++;
          result.errors.push({
            row: i + 1,
            email: record.email || 'unknown',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    } catch (error) {
      throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Import recipients from text field (one email per line)
   */
  async importFromText(text: string, delimiter: string = '\n'): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      recipients: []
    };

    const emails = text.split(delimiter).map(e => e.trim()).filter(e => e.length > 0);

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      
      try {
        const recipientData: RecipientData = {
          email,
          status: 'active'
        };

        const recipient = await this.createRecipient(recipientData);
        result.success++;
        result.recipients.push(recipient.toJSON());
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: i + 1,
          email,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return result;
  }

  /**
   * Bulk create recipients
   */
  async bulkCreateRecipients(recipientsData: RecipientData[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      recipients: []
    };

    for (let i = 0; i < recipientsData.length; i++) {
      const data = recipientsData[i];
      
      try {
        const recipient = await this.createRecipient(data);
        result.success++;
        result.recipients.push(recipient.toJSON());
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: i + 1,
          email: data.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return result;
  }

  /**
   * Unsubscribe recipient
   */
  async unsubscribeRecipient(email: string): Promise<boolean> {
    const recipient = await this.getRecipientByEmail(email);
    
    if (!recipient) {
      return false;
    }

    recipient.unsubscribe();
    return true;
  }

  /**
   * Mark recipient as bounced
   */
  async markRecipientBounced(email: string): Promise<boolean> {
    const recipient = await this.getRecipientByEmail(email);
    
    if (!recipient) {
      return false;
    }

    recipient.markBounced();
    return true;
  }

  /**
   * Search recipients
   */
  async searchRecipients(query: string): Promise<Recipient[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.recipients.values()).filter(recipient =>
      recipient.email.includes(lowerQuery) ||
      recipient.firstName?.toLowerCase().includes(lowerQuery) ||
      recipient.lastName?.toLowerCase().includes(lowerQuery)
    );
  }
}
