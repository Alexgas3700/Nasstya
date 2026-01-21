# n8n Email Broadcasting Module

Comprehensive email broadcasting module for n8n workflow automation platform. This module provides powerful functionality for managing mass email campaigns with template personalization, recipient management, scheduling, and detailed tracking.

## 🚀 Features

- **Multiple Email Provider Support**: SMTP, SendGrid, and Mailgun integration
- **Template Management**: Create, edit, and manage email templates with variable substitution
- **Recipient Management**: Import recipients from CSV or text, manage contact lists
- **Personalization**: Dynamic content personalization using Handlebars templates
- **Campaign Scheduling**: Schedule one-time or recurring email campaigns
- **Tracking & Analytics**: Track email opens, clicks, bounces, and delivery status
- **Bulk Operations**: Efficient bulk email sending with error handling
- **Modern UI**: React-based components designed for n8n integration

## 📦 Installation

```bash
npm install
```

## 🛠️ Configuration

### Email Provider Setup

#### SMTP Configuration

```typescript
import { EmailBroadcastingService, TemplateService, RecipientService, TrackingService } from 'n8n-email-broadcasting-module';

const emailConfig = {
  provider: 'smtp',
  config: {
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
      user: 'your-email@example.com',
      pass: 'your-password'
    }
  }
};

const templateService = new TemplateService();
const recipientService = new RecipientService();
const trackingService = new TrackingService('https://your-tracking-domain.com');

const broadcastingService = new EmailBroadcastingService(
  emailConfig,
  templateService,
  recipientService,
  trackingService
);
```

#### SendGrid Configuration

```typescript
const emailConfig = {
  provider: 'sendgrid',
  config: {
    apiKey: 'your-sendgrid-api-key'
  }
};
```

#### Mailgun Configuration

```typescript
const emailConfig = {
  provider: 'mailgun',
  config: {
    apiKey: 'your-mailgun-api-key',
    domain: 'your-domain.com'
  }
};
```

## 📖 Usage Guide

### 1. Creating Email Templates

```typescript
// Create a new template
const template = await templateService.createTemplate({
  name: 'Welcome Email',
  subject: 'Welcome to our service, {{firstName}}!',
  htmlContent: `
    <html>
      <body>
        <h1>Hello {{firstName}} {{lastName}}!</h1>
        <p>Welcome to our amazing service. We're glad to have you here.</p>
        <p>Your email is: {{email}}</p>
      </body>
    </html>
  `,
  textContent: 'Hello {{firstName}} {{lastName}}! Welcome to our service.',
  variables: []
});

console.log('Template created:', template.id);
```

### 2. Managing Recipients

#### Import from CSV

```typescript
const csvContent = `
email,firstName,lastName,company
john@example.com,John,Doe,Acme Inc
jane@example.com,Jane,Smith,Tech Corp
`;

const importResult = await recipientService.importFromCSV(csvContent);
console.log(`Imported: ${importResult.success}, Failed: ${importResult.failed}`);
```

#### Import from Text

```typescript
const emailList = `
john@example.com
jane@example.com
bob@example.com
`;

const importResult = await recipientService.importFromText(emailList);
```

#### Create Individual Recipients

```typescript
const recipient = await recipientService.createRecipient({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  customFields: {
    company: 'Acme Inc',
    role: 'Developer'
  },
  status: 'active'
});
```

### 3. Creating and Sending Campaigns

```typescript
// Get active recipients
const recipients = await recipientService.getActiveRecipients();

// Create campaign
const campaign = await broadcastingService.createCampaign({
  name: 'Welcome Campaign',
  templateId: template.id,
  recipients: recipients.map(r => r.toJSON()),
  status: 'draft'
});

// Send campaign immediately
await broadcastingService.sendCampaign(campaign.id);

// Or schedule for later
const schedulerService = new SchedulerService();
await schedulerService.scheduleCampaign(
  campaign.id,
  {
    type: 'once',
    startDate: new Date('2026-02-01T10:00:00Z')
  },
  async () => {
    await broadcastingService.sendCampaign(campaign.id);
  }
);
```

### 4. Tracking Campaign Performance

```typescript
// Get campaign statistics
const stats = await broadcastingService.getCampaignStats(campaign.id);

console.log(`
  Total Recipients: ${stats.totalRecipients}
  Sent: ${stats.sent}
  Delivered: ${stats.delivered}
  Opened: ${stats.opened}
  Clicked: ${stats.clicked}
  Open Rate: ${stats.openRate.toFixed(2)}%
  Click Rate: ${stats.clickRate.toFixed(2)}%
`);

// Get detailed history
const history = await broadcastingService.getCampaignHistory(campaign.id);
```

### 5. Recurring Campaigns

```typescript
// Schedule recurring campaign (every Monday at 9 AM)
await schedulerService.scheduleCampaign(
  campaign.id,
  {
    type: 'recurring',
    startDate: new Date(),
    cronExpression: '0 9 * * 1',
    timezone: 'America/New_York'
  },
  async () => {
    await broadcastingService.sendCampaign(campaign.id);
  }
);
```

## 🎨 UI Components

### Campaign Creator

```tsx
import { CampaignCreator } from 'n8n-email-broadcasting-module/ui';

<CampaignCreator
  templates={templates}
  recipients={recipients}
  onCreateCampaign={(data) => {
    // Handle campaign creation
  }}
/>
```

### Template Editor

```tsx
import { TemplateEditor } from 'n8n-email-broadcasting-module/ui';

<TemplateEditor
  onSaveTemplate={(data) => {
    // Handle template save
  }}
  initialData={existingTemplate}
/>
```

### Recipient Importer

```tsx
import { RecipientImporter } from 'n8n-email-broadcasting-module/ui';

<RecipientImporter
  onImport={(data) => {
    // Handle recipient import
  }}
/>
```

### Campaign Dashboard

```tsx
import { CampaignDashboard } from 'n8n-email-broadcasting-module/ui';

<CampaignDashboard
  campaigns={campaigns}
  onSelectCampaign={(id) => {
    // Handle campaign selection
  }}
  onGetStats={async (id) => {
    return await broadcastingService.getCampaignStats(id);
  }}
/>
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

Run tests in watch mode:

```bash
npm run test:watch
```

## 📊 API Reference

### EmailBroadcastingService

- `createCampaign(data: CampaignData): Promise<Campaign>` - Create a new campaign
- `getCampaign(id: string): Promise<Campaign | undefined>` - Get campaign by ID
- `sendCampaign(campaignId: string): Promise<void>` - Send campaign immediately
- `getCampaignStats(campaignId: string): Promise<CampaignStats>` - Get campaign statistics
- `getCampaignHistory(campaignId: string): Promise<MailingHistory[]>` - Get mailing history

### TemplateService

- `createTemplate(data: TemplateData): Promise<Template>` - Create a new template
- `getTemplate(id: string): Promise<Template | undefined>` - Get template by ID
- `updateTemplate(id: string, data: Partial<TemplateData>): Promise<Template>` - Update template
- `deleteTemplate(id: string): Promise<boolean>` - Delete template
- `renderTemplate(templateId: string, variables: Record<string, string>): Promise<{subject, html, text}>` - Render template with variables

### RecipientService

- `createRecipient(data: RecipientData): Promise<Recipient>` - Create a new recipient
- `getRecipient(id: string): Promise<Recipient | undefined>` - Get recipient by ID
- `importFromCSV(csvContent: string): Promise<ImportResult>` - Import recipients from CSV
- `importFromText(text: string, delimiter?: string): Promise<ImportResult>` - Import from text
- `getActiveRecipients(): Promise<Recipient[]>` - Get all active recipients

### SchedulerService

- `scheduleCampaign(campaignId, config, callback): Promise<void>` - Schedule a campaign
- `cancelSchedule(campaignId: string): boolean` - Cancel scheduled campaign
- `pauseSchedule(campaignId: string): boolean` - Pause scheduled campaign
- `resumeSchedule(campaignId: string): boolean` - Resume scheduled campaign

### TrackingService

- `addTrackingPixel(html, campaignId, recipientId): string` - Add open tracking
- `addClickTracking(html, campaignId, recipientId): string` - Add click tracking
- `getCampaignTrackingEvents(campaignId): TrackingPixelData[]` - Get tracking events
- `getClickStatsByUrl(campaignId): Map<string, number>` - Get click statistics by URL

## 🔒 Security Considerations

- **Email Validation**: All email addresses are validated before processing
- **Rate Limiting**: Respect email provider rate limits to avoid blocking
- **Data Privacy**: Handle recipient data securely and comply with GDPR/privacy regulations
- **API Keys**: Store API keys securely using environment variables
- **Unsubscribe**: Always include unsubscribe functionality in emails

## 📝 Best Practices

1. **Test Templates**: Always test templates with sample data before sending
2. **Segment Recipients**: Use recipient lists to target specific audiences
3. **Monitor Bounces**: Regularly check bounce rates and clean recipient lists
4. **Personalization**: Use personalization to improve engagement rates
5. **A/B Testing**: Test different subject lines and content
6. **Compliance**: Include physical address and unsubscribe link in all emails
7. **Timing**: Schedule campaigns at optimal times for your audience

## 🐛 Troubleshooting

### Email Not Sending

- Verify email provider credentials
- Check API key validity
- Ensure recipient emails are valid
- Check rate limits

### Template Rendering Issues

- Validate Handlebars syntax
- Ensure all variables are provided
- Check for missing closing tags

### Import Failures

- Verify CSV format (headers: email, firstName, lastName)
- Check for invalid email addresses
- Ensure proper delimiter usage

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: [Full documentation](https://docs.example.com)

## 🗺️ Roadmap

- [ ] Support for additional email providers (AWS SES, Postmark)
- [ ] Advanced A/B testing functionality
- [ ] Email template marketplace
- [ ] Advanced analytics dashboard
- [ ] Webhook integrations
- [ ] Multi-language support
