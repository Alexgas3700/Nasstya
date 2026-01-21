import { TemplateService } from '../../src/services/TemplateService';
import { TemplateData } from '../../src/types';

describe('TemplateService', () => {
  let service: TemplateService;

  beforeEach(() => {
    service = new TemplateService();
  });

  const validTemplateData: TemplateData = {
    name: 'Test Template',
    subject: 'Hello {{firstName}}',
    htmlContent: '<p>Welcome {{firstName}} {{lastName}}</p>',
    variables: []
  };

  describe('createTemplate', () => {
    it('should create a new template', async () => {
      const template = await service.createTemplate(validTemplateData);

      expect(template.id).toBeDefined();
      expect(template.name).toBe(validTemplateData.name);
      expect(template.subject).toBe(validTemplateData.subject);
    });

    it('should throw error for invalid template data', async () => {
      const invalidData = { ...validTemplateData, name: '' };

      await expect(service.createTemplate(invalidData)).rejects.toThrow('Template validation failed');
    });
  });

  describe('getTemplate', () => {
    it('should retrieve an existing template', async () => {
      const created = await service.createTemplate(validTemplateData);
      const retrieved = await service.getTemplate(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should return undefined for non-existent template', async () => {
      const retrieved = await service.getTemplate('non-existent-id');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAllTemplates', () => {
    it('should return all templates', async () => {
      await service.createTemplate(validTemplateData);
      await service.createTemplate({ ...validTemplateData, name: 'Template 2' });

      const templates = await service.getAllTemplates();

      expect(templates).toHaveLength(2);
    });

    it('should return empty array when no templates exist', async () => {
      const templates = await service.getAllTemplates();

      expect(templates).toHaveLength(0);
    });
  });

  describe('updateTemplate', () => {
    it('should update an existing template', async () => {
      const template = await service.createTemplate(validTemplateData);
      const updated = await service.updateTemplate(template.id, {
        name: 'Updated Name'
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.subject).toBe(validTemplateData.subject);
    });

    it('should throw error for non-existent template', async () => {
      await expect(
        service.updateTemplate('non-existent-id', { name: 'Test' })
      ).rejects.toThrow('Template with ID non-existent-id not found');
    });
  });

  describe('deleteTemplate', () => {
    it('should delete an existing template', async () => {
      const template = await service.createTemplate(validTemplateData);
      const result = await service.deleteTemplate(template.id);

      expect(result).toBe(true);

      const retrieved = await service.getTemplate(template.id);
      expect(retrieved).toBeUndefined();
    });

    it('should return false for non-existent template', async () => {
      const result = await service.deleteTemplate('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('renderTemplate', () => {
    it('should render template with variables', async () => {
      const template = await service.createTemplate(validTemplateData);
      const rendered = await service.renderTemplate(template.id, {
        firstName: 'John',
        lastName: 'Doe'
      });

      expect(rendered.subject).toBe('Hello John');
      expect(rendered.html).toContain('Welcome John Doe');
    });

    it('should throw error for non-existent template', async () => {
      await expect(
        service.renderTemplate('non-existent-id', {})
      ).rejects.toThrow('Template with ID non-existent-id not found');
    });
  });

  describe('validateTemplateSyntax', () => {
    it('should validate correct template syntax', async () => {
      const result = await service.validateTemplateSyntax(
        '<p>Hello {{name}}</p>',
        'Welcome {{name}}'
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect syntax errors', async () => {
      const result = await service.validateTemplateSyntax(
        '<p>Hello {{name}</p>',
        'Welcome'
      );

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('cloneTemplate', () => {
    it('should clone an existing template', async () => {
      const original = await service.createTemplate(validTemplateData);
      const cloned = await service.cloneTemplate(original.id, 'Cloned Template');

      expect(cloned.id).not.toBe(original.id);
      expect(cloned.name).toBe('Cloned Template');
      expect(cloned.subject).toBe(original.subject);
      expect(cloned.htmlContent).toBe(original.htmlContent);
    });

    it('should throw error for non-existent template', async () => {
      await expect(
        service.cloneTemplate('non-existent-id', 'Clone')
      ).rejects.toThrow('Template with ID non-existent-id not found');
    });
  });

  describe('searchTemplates', () => {
    it('should find templates by name', async () => {
      await service.createTemplate({ ...validTemplateData, name: 'Welcome Email' });
      await service.createTemplate({ ...validTemplateData, name: 'Newsletter' });

      const results = await service.searchTemplates('welcome');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Welcome Email');
    });

    it('should return empty array when no matches found', async () => {
      await service.createTemplate(validTemplateData);

      const results = await service.searchTemplates('nonexistent');

      expect(results).toHaveLength(0);
    });
  });
});
