import Handlebars from 'handlebars';
import { Template } from '../models/Template';
import { TemplateData } from '../types';

/**
 * Service for managing email templates
 */
export class TemplateService {
  private templates: Map<string, Template> = new Map();

  /**
   * Create a new template
   */
  async createTemplate(data: TemplateData): Promise<Template> {
    const template = new Template(data);
    const validation = template.validate();

    if (!validation.valid) {
      throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
    }

    this.templates.set(template.id, template);
    return template;
  }

  /**
   * Get template by ID
   */
  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  /**
   * Get all templates
   */
  async getAllTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  /**
   * Update template
   */
  async updateTemplate(id: string, data: Partial<TemplateData>): Promise<Template> {
    const template = this.templates.get(id);
    
    if (!template) {
      throw new Error(`Template with ID ${id} not found`);
    }

    template.update(data);
    const validation = template.validate();

    if (!validation.valid) {
      throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
    }

    return template;
  }

  /**
   * Delete template
   */
  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }

  /**
   * Render template with variables
   */
  async renderTemplate(templateId: string, variables: Record<string, string>): Promise<{ subject: string; html: string; text?: string }> {
    const template = this.templates.get(templateId);
    
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    try {
      const subjectTemplate = Handlebars.compile(template.subject);
      const htmlTemplate = Handlebars.compile(template.htmlContent);
      
      const subject = subjectTemplate(variables);
      const html = htmlTemplate(variables);
      
      let text: string | undefined;
      if (template.textContent) {
        const textTemplate = Handlebars.compile(template.textContent);
        text = textTemplate(variables);
      }

      return { subject, html, text };
    } catch (error) {
      throw new Error(`Failed to render template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate template syntax
   */
  async validateTemplateSyntax(htmlContent: string, subject: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      Handlebars.compile(subject);
    } catch (error) {
      errors.push(`Subject syntax error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      Handlebars.compile(htmlContent);
    } catch (error) {
      errors.push(`HTML content syntax error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Clone template
   */
  async cloneTemplate(id: string, newName: string): Promise<Template> {
    const original = this.templates.get(id);
    
    if (!original) {
      throw new Error(`Template with ID ${id} not found`);
    }

    const clonedData: TemplateData = {
      name: newName,
      subject: original.subject,
      htmlContent: original.htmlContent,
      textContent: original.textContent,
      variables: original.variables
    };

    return this.createTemplate(clonedData);
  }

  /**
   * Search templates by name
   */
  async searchTemplates(query: string): Promise<Template[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.templates.values()).filter(template =>
      template.name.toLowerCase().includes(lowerQuery)
    );
  }
}
