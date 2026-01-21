import { RecipientService } from '../../src/services/RecipientService';
import { RecipientData } from '../../src/types';

describe('RecipientService', () => {
  let service: RecipientService;

  beforeEach(() => {
    service = new RecipientService();
  });

  const validRecipientData: RecipientData = {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    status: 'active'
  };

  describe('createRecipient', () => {
    it('should create a new recipient', async () => {
      const recipient = await service.createRecipient(validRecipientData);

      expect(recipient.id).toBeDefined();
      expect(recipient.email).toBe(validRecipientData.email);
      expect(recipient.firstName).toBe(validRecipientData.firstName);
    });

    it('should throw error for invalid recipient data', async () => {
      const invalidData = { ...validRecipientData, email: 'invalid-email' };

      await expect(service.createRecipient(invalidData)).rejects.toThrow('Recipient validation failed');
    });

    it('should throw error for duplicate email', async () => {
      await service.createRecipient(validRecipientData);

      await expect(service.createRecipient(validRecipientData)).rejects.toThrow('already exists');
    });
  });

  describe('getRecipient', () => {
    it('should retrieve an existing recipient', async () => {
      const created = await service.createRecipient(validRecipientData);
      const retrieved = await service.getRecipient(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should return undefined for non-existent recipient', async () => {
      const retrieved = await service.getRecipient('non-existent-id');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('getRecipientByEmail', () => {
    it('should retrieve recipient by email', async () => {
      await service.createRecipient(validRecipientData);
      const retrieved = await service.getRecipientByEmail('test@example.com');

      expect(retrieved).toBeDefined();
      expect(retrieved?.email).toBe('test@example.com');
    });

    it('should be case-insensitive', async () => {
      await service.createRecipient(validRecipientData);
      const retrieved = await service.getRecipientByEmail('TEST@EXAMPLE.COM');

      expect(retrieved).toBeDefined();
    });
  });

  describe('getAllRecipients', () => {
    it('should return all recipients', async () => {
      await service.createRecipient(validRecipientData);
      await service.createRecipient({ ...validRecipientData, email: 'test2@example.com' });

      const recipients = await service.getAllRecipients();

      expect(recipients).toHaveLength(2);
    });
  });

  describe('getActiveRecipients', () => {
    it('should return only active recipients', async () => {
      await service.createRecipient(validRecipientData);
      await service.createRecipient({ ...validRecipientData, email: 'test2@example.com', status: 'unsubscribed' });

      const active = await service.getActiveRecipients();

      expect(active).toHaveLength(1);
      expect(active[0].status).toBe('active');
    });
  });

  describe('importFromCSV', () => {
    it('should import recipients from CSV', async () => {
      const csv = 'email,firstName,lastName\ntest1@example.com,John,Doe\ntest2@example.com,Jane,Smith';
      const result = await service.importFromCSV(csv);

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.recipients).toHaveLength(2);
    });

    it('should handle errors in CSV import', async () => {
      const csv = 'email,firstName,lastName\ninvalid-email,John,Doe\ntest@example.com,Jane,Smith';
      const result = await service.importFromCSV(csv);

      expect(result.success).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });

    it('should handle custom fields', async () => {
      const csv = 'email,firstName,company\ntest@example.com,John,Acme Inc';
      const result = await service.importFromCSV(csv);

      expect(result.success).toBe(1);
      expect(result.recipients[0].customFields?.company).toBe('Acme Inc');
    });
  });

  describe('importFromText', () => {
    it('should import recipients from text', async () => {
      const text = 'test1@example.com\ntest2@example.com\ntest3@example.com';
      const result = await service.importFromText(text);

      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.recipients).toHaveLength(3);
    });

    it('should handle custom delimiter', async () => {
      const text = 'test1@example.com,test2@example.com,test3@example.com';
      const result = await service.importFromText(text, ',');

      expect(result.success).toBe(3);
    });

    it('should handle errors in text import', async () => {
      const text = 'invalid-email\ntest@example.com';
      const result = await service.importFromText(text);

      expect(result.success).toBe(1);
      expect(result.failed).toBe(1);
    });
  });

  describe('unsubscribeRecipient', () => {
    it('should unsubscribe a recipient', async () => {
      await service.createRecipient(validRecipientData);
      const result = await service.unsubscribeRecipient('test@example.com');

      expect(result).toBe(true);

      const recipient = await service.getRecipientByEmail('test@example.com');
      expect(recipient?.status).toBe('unsubscribed');
    });

    it('should return false for non-existent recipient', async () => {
      const result = await service.unsubscribeRecipient('nonexistent@example.com');

      expect(result).toBe(false);
    });
  });

  describe('markRecipientBounced', () => {
    it('should mark recipient as bounced', async () => {
      await service.createRecipient(validRecipientData);
      const result = await service.markRecipientBounced('test@example.com');

      expect(result).toBe(true);

      const recipient = await service.getRecipientByEmail('test@example.com');
      expect(recipient?.status).toBe('bounced');
    });
  });

  describe('searchRecipients', () => {
    it('should search recipients by email', async () => {
      await service.createRecipient(validRecipientData);
      await service.createRecipient({ ...validRecipientData, email: 'another@example.com' });

      const results = await service.searchRecipients('test@');

      expect(results).toHaveLength(1);
      expect(results[0].email).toBe('test@example.com');
    });

    it('should search recipients by name', async () => {
      await service.createRecipient(validRecipientData);
      await service.createRecipient({ ...validRecipientData, email: 'jane@example.com', firstName: 'Jane' });

      const results = await service.searchRecipients('john');

      expect(results).toHaveLength(1);
      expect(results[0].firstName).toBe('John');
    });
  });
});
