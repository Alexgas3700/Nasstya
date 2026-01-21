# API Documentation

Complete API reference for the n8n Email Broadcasting Module.

## Table of Contents

- [Email Broadcasting Service](#email-broadcasting-service)
- [Template Service](#template-service)
- [Recipient Service](#recipient-service)
- [Scheduler Service](#scheduler-service)
- [Tracking Service](#tracking-service)
- [Email Providers](#email-providers)
- [Models](#models)
- [Types](#types)

## Email Broadcasting Service

Main service for managing email campaigns.

### Constructor

```typescript
constructor(
  emailConfig: EmailConfig,
  templateService: TemplateService,
  recipientService: RecipientService,
  trackingService: TrackingService
)
```

### Methods

#### createCampaign

Create a new email campaign.

```typescript
async createCampaign(data: CampaignData): Promise<Campaign>
```

**Parameters:**
- `data.name` (string): Campaign name
- `data.templateId` (string): Template ID to use
- `data.recipients` (RecipientData[]): List of recipients
- `data.status` ('draft' | 'scheduled' | 'sending' | 'completed' | 'failed'): Campaign status
- `data.scheduledAt` (Date, optional): Scheduled send date

**Returns:** Created Campaign object

**Throws:** Error if validation fails or template not found

**Example:**

```typescript
const campaign = await service.createCampaign({
  name: 'Newsletter January 2026',
  templateId: 'template-123',
  recipients: recipients,
  status: 'draft'
});
```

#### getCampaign

Retrieve a campaign by ID.

```typescript
async getCampaign(id: string): Promise<Campaign | undefined>
```

#### getAllCampaigns

Get all campaigns.

```typescript
async getAllCampaigns(): Promise<Campaign[]>
```

#### sendCampaign

Send a campaign immediately.

```typescript
async sendCampaign(campaignId: string): Promise<void>
```

**Throws:** Error if campaign not found or already sent

#### getCampaignStats

Get statistics for a campaign.

```typescript
async getCampaignStats(campaignId: string): Promise<CampaignStats>
```

**Returns:**

```typescript
{
  campaignId: string;
  totalRecipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  openRate: number;
  clickRate: number;
}
```

#### getCampaignHistory

Get mailing history for a campaign.

```typescript
async getCampaignHistory(campaignId: string): Promise<MailingHistory[]>
```

#### verifyConnection

Verify email provider connection.

```typescript
async verifyConnection(): Promise<boolean>
```

## Template Service

Service for managing email templates.

### Methods

#### createTemplate

Create a new template.

```typescript
async createTemplate(data: TemplateData): Promise<Template>
```

**Parameters:**
- `data.name` (string): Template name
- `data.subject` (string): Email subject (supports {{variables}})
- `data.htmlContent` (string): HTML content (supports {{variables}})
- `data.textContent` (string, optional): Plain text content
- `data.variables` (string[], optional): List of variables (auto-extracted if not provided)

**Example:**

```typescript
const template = await service.createTemplate({
  name: 'Welcome Email',
  subject: 'Welcome {{firstName}}!',
  htmlContent: '<h1>Hello {{firstName}} {{lastName}}</h1>',
  variables: []
});
```

#### getTemplate

Get template by ID.

```typescript
async getTemplate(id: string): Promise<Template | undefined>
```

#### getAllTemplates

Get all templates.

```typescript
async getAllTemplates(): Promise<Template[]>
```

#### updateTemplate

Update an existing template.

```typescript
async updateTemplate(id: string, data: Partial<TemplateData>): Promise<Template>
```

#### deleteTemplate

Delete a template.

```typescript
async deleteTemplate(id: string): Promise<boolean>
```

#### renderTemplate

Render template with variables.

```typescript
async renderTemplate(
  templateId: string,
  variables: Record<string, string>
): Promise<{ subject: string; html: string; text?: string }>
```

**Example:**

```typescript
const rendered = await service.renderTemplate('template-123', {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com'
});
```

#### validateTemplateSyntax

Validate template syntax.

```typescript
async validateTemplateSyntax(
  htmlContent: string,
  subject: string
): Promise<{ valid: boolean; errors: string[] }>
```

#### cloneTemplate

Clone an existing template.

```typescript
async cloneTemplate(id: string, newName: string): Promise<Template>
```

#### searchTemplates

Search templates by name.

```typescript
async searchTemplates(query: string): Promise<Template[]>
```

## Recipient Service

Service for managing recipients.

### Methods

#### createRecipient

Create a new recipient.

```typescript
async createRecipient(data: RecipientData): Promise<Recipient>
```

**Parameters:**
- `data.email` (string): Email address (required, validated)
- `data.firstName` (string, optional): First name
- `data.lastName` (string, optional): Last name
- `data.customFields` (Record<string, string>, optional): Custom fields
- `data.status` ('active' | 'unsubscribed' | 'bounced'): Recipient status

**Example:**

```typescript
const recipient = await service.createRecipient({
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  customFields: { company: 'Acme Inc' },
  status: 'active'
});
```

#### getRecipient

Get recipient by ID.

```typescript
async getRecipient(id: string): Promise<Recipient | undefined>
```

#### getRecipientByEmail

Get recipient by email address.

```typescript
async getRecipientByEmail(email: string): Promise<Recipient | undefined>
```

#### getAllRecipients

Get all recipients.

```typescript
async getAllRecipients(): Promise<Recipient[]>
```

#### getActiveRecipients

Get only active recipients.

```typescript
async getActiveRecipients(): Promise<Recipient[]>
```

#### importFromCSV

Import recipients from CSV content.

```typescript
async importFromCSV(csvContent: string): Promise<ImportResult>
```

**CSV Format:**

```csv
email,firstName,lastName,customField1,customField2
john@example.com,John,Doe,Value1,Value2
jane@example.com,Jane,Smith,Value3,Value4
```

**Returns:**

```typescript
{
  success: number;
  failed: number;
  errors: Array<{ row: number; email: string; error: string }>;
  recipients: RecipientData[];
}
```

#### importFromText

Import recipients from text (one email per line).

```typescript
async importFromText(text: string, delimiter?: string): Promise<ImportResult>
```

**Parameters:**
- `text` (string): Text containing emails
- `delimiter` (string, optional): Delimiter (default: '\n')

#### bulkCreateRecipients

Create multiple recipients at once.

```typescript
async bulkCreateRecipients(recipientsData: RecipientData[]): Promise<ImportResult>
```

#### unsubscribeRecipient

Unsubscribe a recipient.

```typescript
async unsubscribeRecipient(email: string): Promise<boolean>
```

#### markRecipientBounced

Mark recipient as bounced.

```typescript
async markRecipientBounced(email: string): Promise<boolean>
```

#### searchRecipients

Search recipients by email or name.

```typescript
async searchRecipients(query: string): Promise<Recipient[]>
```

## Scheduler Service

Service for scheduling campaigns.

### Methods

#### scheduleCampaign

Schedule a campaign for future execution.

```typescript
async scheduleCampaign(
  campaignId: string,
  config: ScheduleConfig,
  callback: () => Promise<void>
): Promise<void>
```

**Schedule Config:**

```typescript
// One-time execution
{
  type: 'once',
  startDate: new Date('2026-02-01T10:00:00Z')
}

// Recurring execution
{
  type: 'recurring',
  startDate: new Date(),
  cronExpression: '0 9 * * 1', // Every Monday at 9 AM
  timezone: 'America/New_York'
}
```

**Cron Expression Examples:**

- `'0 9 * * *'` - Every day at 9 AM
- `'0 9 * * 1'` - Every Monday at 9 AM
- `'0 9 1 * *'` - First day of every month at 9 AM
- `'0 */2 * * *'` - Every 2 hours

#### cancelSchedule

Cancel a scheduled campaign.

```typescript
cancelSchedule(campaignId: string): boolean
```

#### pauseSchedule

Pause a scheduled campaign.

```typescript
pauseSchedule(campaignId: string): boolean
```

#### resumeSchedule

Resume a paused campaign.

```typescript
resumeSchedule(campaignId: string): boolean
```

#### validateCronExpression

Validate a cron expression.

```typescript
validateCronExpression(expression: string): boolean
```

## Tracking Service

Service for tracking email opens and clicks.

### Constructor

```typescript
constructor(baseUrl: string = 'https://tracking.example.com')
```

### Methods

#### addTrackingPixel

Add open tracking pixel to email HTML.

```typescript
addTrackingPixel(html: string, campaignId: string, recipientId: string): string
```

#### addClickTracking

Add click tracking to all links.

```typescript
addClickTracking(html: string, campaignId: string, recipientId: string): string
```

#### addFullTracking

Add both open and click tracking.

```typescript
addFullTracking(html: string, campaignId: string, recipientId: string): string
```

#### recordEvent

Record a tracking event.

```typescript
async recordEvent(trackingId: string): Promise<TrackingPixelData | undefined>
```

#### getCampaignTrackingEvents

Get all tracking events for a campaign.

```typescript
getCampaignTrackingEvents(campaignId: string): TrackingPixelData[]
```

#### getClickStatsByUrl

Get click statistics by URL.

```typescript
getClickStatsByUrl(campaignId: string): Map<string, number>
```

## Email Providers

### SMTP Provider

```typescript
import { SMTPProvider } from 'n8n-email-broadcasting-module';

const provider = new SMTPProvider({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: 'user@example.com',
    pass: 'password'
  }
});
```

### SendGrid Provider

```typescript
import { SendGridProvider } from 'n8n-email-broadcasting-module';

const provider = new SendGridProvider({
  apiKey: 'your-sendgrid-api-key'
});
```

### Mailgun Provider

```typescript
import { MailgunProvider } from 'n8n-email-broadcasting-module';

const provider = new MailgunProvider({
  apiKey: 'your-mailgun-api-key',
  domain: 'your-domain.com'
});
```

## Models

### Template

Properties:
- `id`: string
- `name`: string
- `subject`: string
- `htmlContent`: string
- `textContent?`: string
- `variables`: string[]
- `createdAt`: Date
- `updatedAt`: Date

### Recipient

Properties:
- `id`: string
- `email`: string
- `firstName?`: string
- `lastName?`: string
- `customFields`: Record<string, string>
- `status`: 'active' | 'unsubscribed' | 'bounced'
- `createdAt`: Date

### Campaign

Properties:
- `id`: string
- `name`: string
- `templateId`: string
- `recipients`: RecipientData[]
- `status`: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed'
- `scheduledAt?`: Date
- `sentAt?`: Date
- `createdAt`: Date
- `updatedAt`: Date

### MailingHistory

Properties:
- `id`: string
- `campaignId`: string
- `recipientId`: string
- `recipientEmail`: string
- `status`: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed'
- `sentAt?`: Date
- `deliveredAt?`: Date
- `openedAt?`: Date
- `clickedAt?`: Date
- `error?`: string
- `trackingData`: Record<string, any>

## Error Handling

All async methods may throw errors. Always use try-catch blocks:

```typescript
try {
  const campaign = await service.createCampaign(data);
} catch (error) {
  console.error('Failed to create campaign:', error.message);
}
```

Common error scenarios:
- Validation failures
- Resource not found
- Email provider errors
- Network errors
- Rate limit exceeded
