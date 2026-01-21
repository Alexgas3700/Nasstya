import { Template } from '../../src/models/Template';
import { TemplateData } from '../../src/types';

describe('Template Model', () => {
  const validTemplateData: TemplateData = {
    name: 'Welcome Email',
    subject: 'Welcome {{firstName}}!',
    htmlContent: '<h1>Hello {{firstName}} {{lastName}}</h1><p>Welcome to our service!</p>',
    variables: []
  };

  describe('constructor', () => {
    it('should create a template with valid data', () => {
      const template = new Template(validTemplateData);

      expect(template.name).toBe(validTemplateData.name);
      expect(template.subject).toBe(validTemplateData.subject);
      expect(template.htmlContent).toBe(validTemplateData.htmlContent);
      expect(template.id).toBeDefined();
      expect(template.createdAt).toBeInstanceOf(Date);
      expect(template.updatedAt).toBeInstanceOf(Date);
    });

    it('should extract variables from HTML content', () => {
      const template = new Template(validTemplateData);

      expect(template.variables).toContain('firstName');
      expect(template.variables).toContain('lastName');
      expect(template.variables.length).toBe(2);
    });

    it('should use provided variables if specified', () => {
      const data = { ...validTemplateData, variables: ['customVar'] };
      const template = new Template(data);

      expect(template.variables).toEqual(['customVar']);
    });
  });

  describe('validate', () => {
    it('should validate a valid template', () => {
      const template = new Template(validTemplateData);
      const result = template.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation when name is missing', () => {
      const data = { ...validTemplateData, name: '' };
      const template = new Template(data);
      const result = template.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Template name is required');
    });

    it('should fail validation when subject is missing', () => {
      const data = { ...validTemplateData, subject: '' };
      const template = new Template(data);
      const result = template.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Template subject is required');
    });

    it('should fail validation when HTML content is missing', () => {
      const data = { ...validTemplateData, htmlContent: '' };
      const template = new Template(data);
      const result = template.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Template HTML content is required');
    });
  });

  describe('update', () => {
    it('should update template properties', () => {
      const template = new Template(validTemplateData);
      const originalUpdatedAt = template.updatedAt;

      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        template.update({
          name: 'Updated Name',
          subject: 'Updated Subject'
        });

        expect(template.name).toBe('Updated Name');
        expect(template.subject).toBe('Updated Subject');
        expect(template.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 10);
    });

    it('should re-extract variables when HTML content is updated', () => {
      const template = new Template(validTemplateData);

      template.update({
        htmlContent: '<p>Hello {{email}}</p>'
      });

      expect(template.variables).toContain('email');
      expect(template.variables).not.toContain('firstName');
    });
  });

  describe('toJSON', () => {
    it('should convert template to plain object', () => {
      const template = new Template(validTemplateData);
      const json = template.toJSON();

      expect(json.id).toBe(template.id);
      expect(json.name).toBe(template.name);
      expect(json.subject).toBe(template.subject);
      expect(json.htmlContent).toBe(template.htmlContent);
      expect(json.variables).toEqual(template.variables);
    });
  });
});
