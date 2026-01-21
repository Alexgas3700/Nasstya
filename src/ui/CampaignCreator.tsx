import React, { useState, useEffect } from 'react';

interface Template {
  id: string;
  name: string;
  subject: string;
}

interface Recipient {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface CampaignCreatorProps {
  onCreateCampaign: (data: any) => void;
  templates: Template[];
  recipients: Recipient[];
}

/**
 * Campaign Creator Component for n8n
 */
export const CampaignCreator: React.FC<CampaignCreatorProps> = ({
  onCreateCampaign,
  templates,
  recipients
}) => {
  const [campaignName, setCampaignName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledDate, setScheduledDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const campaignData = {
      name: campaignName,
      templateId: selectedTemplate,
      recipients: recipients.filter(r => selectedRecipients.includes(r.id)),
      status: scheduleType === 'immediate' ? 'draft' : 'scheduled',
      scheduledAt: scheduleType === 'scheduled' ? new Date(scheduledDate) : undefined
    };

    onCreateCampaign(campaignData);
  };

  const handleSelectAllRecipients = () => {
    if (selectedRecipients.length === recipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(recipients.map(r => r.id));
    }
  };

  return (
    <div className="campaign-creator">
      <h2>Create Email Campaign</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="campaignName">Campaign Name</label>
          <input
            type="text"
            id="campaignName"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            required
            placeholder="Enter campaign name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="template">Email Template</label>
          <select
            id="template"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            required
          >
            <option value="">Select a template</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.subject}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Recipients</label>
          <div className="recipients-list">
            <div className="select-all">
              <input
                type="checkbox"
                id="selectAll"
                checked={selectedRecipients.length === recipients.length}
                onChange={handleSelectAllRecipients}
              />
              <label htmlFor="selectAll">Select All ({recipients.length})</label>
            </div>
            
            <div className="recipients-scroll">
              {recipients.map(recipient => (
                <div key={recipient.id} className="recipient-item">
                  <input
                    type="checkbox"
                    id={`recipient-${recipient.id}`}
                    checked={selectedRecipients.includes(recipient.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRecipients([...selectedRecipients, recipient.id]);
                      } else {
                        setSelectedRecipients(selectedRecipients.filter(id => id !== recipient.id));
                      }
                    }}
                  />
                  <label htmlFor={`recipient-${recipient.id}`}>
                    {recipient.firstName && recipient.lastName
                      ? `${recipient.firstName} ${recipient.lastName} (${recipient.email})`
                      : recipient.email}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Schedule</label>
          <div className="schedule-options">
            <label>
              <input
                type="radio"
                value="immediate"
                checked={scheduleType === 'immediate'}
                onChange={() => setScheduleType('immediate')}
              />
              Send Immediately
            </label>
            <label>
              <input
                type="radio"
                value="scheduled"
                checked={scheduleType === 'scheduled'}
                onChange={() => setScheduleType('scheduled')}
              />
              Schedule for Later
            </label>
          </div>

          {scheduleType === 'scheduled' && (
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Create Campaign
          </button>
        </div>
      </form>
    </div>
  );
};
