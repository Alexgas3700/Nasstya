import React, { useState } from 'react';

interface RecipientImporterProps {
  onImport: (data: any) => void;
}

/**
 * Recipient Importer Component for n8n
 */
export const RecipientImporter: React.FC<RecipientImporterProps> = ({ onImport }) => {
  const [importMethod, setImportMethod] = useState<'csv' | 'text'>('csv');
  const [csvContent, setCsvContent] = useState('');
  const [textContent, setTextContent] = useState('');
  const [delimiter, setDelimiter] = useState('\n');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCsvContent(content);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (importMethod === 'csv') {
      onImport({
        method: 'csv',
        content: csvContent
      });
    } else {
      onImport({
        method: 'text',
        content: textContent,
        delimiter
      });
    }
  };

  return (
    <div className="recipient-importer">
      <h2>Import Recipients</h2>

      <div className="import-method-selector">
        <label>
          <input
            type="radio"
            value="csv"
            checked={importMethod === 'csv'}
            onChange={() => setImportMethod('csv')}
          />
          Import from CSV File
        </label>
        <label>
          <input
            type="radio"
            value="text"
            checked={importMethod === 'text'}
            onChange={() => setImportMethod('text')}
          />
          Import from Text
        </label>
      </div>

      <form onSubmit={handleSubmit}>
        {importMethod === 'csv' ? (
          <div className="csv-import">
            <div className="form-group">
              <label htmlFor="csvFile">Upload CSV File</label>
              <input
                type="file"
                id="csvFile"
                accept=".csv"
                onChange={handleFileChange}
              />
              <small>
                CSV should contain columns: email, firstName, lastName (optional)
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="csvContent">Or Paste CSV Content</label>
              <textarea
                id="csvContent"
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                rows={10}
                placeholder="email,firstName,lastName&#10;john@example.com,John,Doe&#10;jane@example.com,Jane,Smith"
              />
            </div>

            <div className="csv-example">
              <h4>Example CSV Format:</h4>
              <pre>
                email,firstName,lastName{'\n'}
                john@example.com,John,Doe{'\n'}
                jane@example.com,Jane,Smith
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-import">
            <div className="form-group">
              <label htmlFor="delimiter">Delimiter</label>
              <select
                id="delimiter"
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
              >
                <option value="\n">New Line</option>
                <option value=",">Comma</option>
                <option value=";">Semicolon</option>
                <option value="\t">Tab</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="textContent">Email Addresses</label>
              <textarea
                id="textContent"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={10}
                placeholder="john@example.com&#10;jane@example.com&#10;bob@example.com"
                required
              />
              <small>
                Enter one email address per line (or separated by chosen delimiter)
              </small>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Import Recipients
          </button>
        </div>
      </form>
    </div>
  );
};
