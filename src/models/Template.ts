import { v4 as uuidv4 } from 'uuid';
import { TemplateData } from '../types';

/**
 * Template model for email templates
 */
export class Template {
  public id: string;
  public name: string;
  public subject: string;
  public htmlContent: string;
  public textContent?: string;
  public variables: string[];
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: TemplateData) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.subject = data.subject;
    this.htmlContent = data.htmlContent;
    this.textContent = data.textContent;
    this.variables = data.variables || this.extractVariables(data.htmlContent);
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Extract variables from template content
   * Supports {{variable}} syntax
   */
  private extractVariables(content: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables = new Set<string>();
    let match;

    while ((match = regex.exec(content)) !== null) {
      variables.add(match[1].trim());
    }

    return Array.from(variables);
  }

  /**
   * Validate template data
   */
  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Template name is required');
    }

    if (!this.subject || this.subject.trim().length === 0) {
      errors.push('Template subject is required');
    }

    if (!this.htmlContent || this.htmlContent.trim().length === 0) {
      errors.push('Template HTML content is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to plain object for storage
   */
  public toJSON(): TemplateData {
    return {
      id: this.id,
      name: this.name,
      subject: this.subject,
      htmlContent: this.htmlContent,
      textContent: this.textContent,
      variables: this.variables,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Update template data
   */
  public update(data: Partial<TemplateData>): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.subject !== undefined) this.subject = data.subject;
    if (data.htmlContent !== undefined) {
      this.htmlContent = data.htmlContent;
      this.variables = this.extractVariables(data.htmlContent);
    }
    if (data.textContent !== undefined) this.textContent = data.textContent;
    this.updatedAt = new Date();
  }
}
