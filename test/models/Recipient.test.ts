import { Recipient } from '../../src/models/Recipient';
import { RecipientData } from '../../src/types';

describe('Recipient Model', () => {
  const validRecipientData: RecipientData = {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    status: 'active'
  };

  describe('constructor', () => {
    it('should create a recipient with valid data', () => {
      const recipient = new Recipient(validRecipientData);

      expect(recipient.email).toBe(validRecipientData.email);
      expect(recipient.firstName).toBe(validRecipientData.firstName);
      expect(recipient.lastName).toBe(validRecipientData.lastName);
      expect(recipient.status).toBe(validRecipientData.status);
      expect(recipient.id).toBeDefined();
      expect(recipient.createdAt).toBeInstanceOf(Date);
    });

    it('should normalize email to lowercase', () => {
      const data = { ...validRecipientData, email: 'TEST@EXAMPLE.COM' };
      const recipient = new Recipient(data);

      expect(recipient.email).toBe('test@example.com');
    });

    it('should default status to active', () => {
      const data = { email: 'test@example.com' } as RecipientData;
      const recipient = new Recipient(data);

      expect(recipient.status).toBe('active');
    });
  });

  describe('validate', () => {
    it('should validate a valid recipient', () => {
      const recipient = new Recipient(validRecipientData);
      const result = recipient.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation with invalid email', () => {
      const data = { ...validRecipientData, email: 'invalid-email' };
      const recipient = new Recipient(data);
      const result = recipient.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Valid email address is required');
    });

    it('should fail validation with empty email', () => {
      const data = { ...validRecipientData, email: '' };
      const recipient = new Recipient(data);
      const result = recipient.validate();

      expect(result.valid).toBe(false);
    });

    it('should fail validation with invalid status', () => {
      const data = { ...validRecipientData, status: 'invalid' as any };
      const recipient = new Recipient(data);
      const result = recipient.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid status value');
    });
  });

  describe('getFullName', () => {
    it('should return full name when both first and last names are present', () => {
      const recipient = new Recipient(validRecipientData);

      expect(recipient.getFullName()).toBe('John Doe');
    });

    it('should return first name only when last name is missing', () => {
      const data = { ...validRecipientData, lastName: undefined };
      const recipient = new Recipient(data);

      expect(recipient.getFullName()).toBe('John');
    });

    it('should return email when no names are present', () => {
      const data = { email: 'test@example.com', status: 'active' } as RecipientData;
      const recipient = new Recipient(data);

      expect(recipient.getFullName()).toBe('test@example.com');
    });
  });

  describe('getVariables', () => {
    it('should return all variables for template personalization', () => {
      const recipient = new Recipient(validRecipientData);
      const variables = recipient.getVariables();

      expect(variables.email).toBe('test@example.com');
      expect(variables.firstName).toBe('John');
      expect(variables.lastName).toBe('Doe');
      expect(variables.fullName).toBe('John Doe');
    });

    it('should include custom fields', () => {
      const data = {
        ...validRecipientData,
        customFields: { company: 'Acme Inc' }
      };
      const recipient = new Recipient(data);
      const variables = recipient.getVariables();

      expect(variables.company).toBe('Acme Inc');
    });
  });

  describe('unsubscribe', () => {
    it('should mark recipient as unsubscribed', () => {
      const recipient = new Recipient(validRecipientData);
      recipient.unsubscribe();

      expect(recipient.status).toBe('unsubscribed');
    });
  });

  describe('markBounced', () => {
    it('should mark recipient as bounced', () => {
      const recipient = new Recipient(validRecipientData);
      recipient.markBounced();

      expect(recipient.status).toBe('bounced');
    });
  });
});
