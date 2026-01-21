import React, { useState } from 'react';

interface TemplateEditorProps {
  onSaveTemplate: (data: any) => void;
  initialData?: {
    id?: string;
    name: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
  };
}

/**
 * Template Editor Component for n8n
 */
export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  onSaveTemplate,
  initialData
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [htmlContent, setHtmlContent] = useState(initialData?.htmlContent || '');
  const [textContent, setTextContent] = useState(initialData?.textContent || '');
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const templateData = {
      id: initialData?.id,
      name,
      subject,
      htmlContent,
      textContent: textContent || undefined,
      variables: []
    };

    onSaveTemplate(templateData);
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('htmlContent') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = htmlContent;
      const before = text.substring(0, start);
      const after = text.substring(end);
      setHtmlContent(before + `{{${variable}}}` + after);
    }
  };

  const commonVariables = [
    'firstName',
    'lastName',
    'fullName',
    'email'
  ];

  return (
    <div className="template-editor">
      <h2>{initialData?.id ? 'Edit Template' : 'Create Template'}</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Template Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g., Welcome Email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="subject">Email Subject</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="e.g., Welcome to our newsletter, {{firstName}}!"
          />
          <small>Use {'{{variableName}}'} for personalization</small>
        </div>

        <div className="form-group">
          <label htmlFor="htmlContent">HTML Content</label>
          <div className="variable-buttons">
            <span>Insert variable:</span>
            {commonVariables.map(variable => (
              <button
                key={variable}
                type="button"
                onClick={() => insertVariable(variable)}
                className="btn-variable"
              >
                {variable}
              </button>
            ))}
          </div>
          <textarea
            id="htmlContent"
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            required
            rows={15}
            placeholder="Enter HTML content here..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="textContent">Plain Text Content (Optional)</label>
          <textarea
            id="textContent"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            rows={10}
            placeholder="Plain text version of your email..."
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="btn-secondary"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button type="submit" className="btn-primary">
            Save Template
          </button>
        </div>
      </form>

      {showPreview && (
        <div className="preview-section">
          <h3>Preview</h3>
          <div className="preview-subject">
            <strong>Subject:</strong> {subject}
          </div>
          <div className="preview-content">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        </div>
      )}
    </div>
  );
};
