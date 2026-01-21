# Usage Examples

Practical examples for common use cases with the n8n Email Broadcasting Module.

## Table of Contents

- [Basic Setup](#basic-setup)
- [Template Management](#template-management)
- [Recipient Management](#recipient-management)
- [Campaign Creation and Sending](#campaign-creation-and-sending)
- [Scheduling](#scheduling)
- [Tracking and Analytics](#tracking-and-analytics)
- [Advanced Use Cases](#advanced-use-cases)

## Basic Setup

### Initialize Services

```typescript
import {
  EmailBroadcastingService,
  TemplateService,
  RecipientService,
  TrackingService,
  SchedulerService
} from 'n8n-email-broadcasting-module';

// Initialize services
const templateService = new TemplateService();
const recipientService = new RecipientService();
const trackingService = new TrackingService('https://tracking.example.com');
const schedulerService = new SchedulerService();

// Configure email provider (SMTP example)
const emailConfig = {
  provider: 'smtp' as const,
  config: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  }
};

const broadcastingService = new EmailBroadcastingService(
  emailConfig,
  templateService,
  recipientService,
  trackingService
);

// Verify connection
const isConnected = await broadcastingService.verifyConnection();
console.log('Email provider connected:', isConnected);
```

## Template Management

### Create a Welcome Email Template

```typescript
const welcomeTemplate = await templateService.createTemplate({
  name: 'Welcome Email',
  subject: 'Welcome to {{companyName}}, {{firstName}}!',
  htmlContent: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { 
          display: inline-block; 
          padding: 10px 20px; 
          background: #007bff; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to {{companyName}}!</h1>
        </div>
        <div class="content">
          <h2>Hello {{firstName}} {{lastName}},</h2>
          <p>We're excited to have you join our community!</p>
          <p>Your account has been successfully created with the email: <strong>{{email}}</strong></p>
          <p>
            <a href="https://example.com/get-started" class="button">Get Started</a>
          </p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The {{companyName}} Team</p>
        </div>
      </div>
    </body>
    </html>
  `,
  textContent: `
    Welcome to {{companyName}}, {{firstName}} {{lastName}}!
    
    We're excited to have you join our community!
    Your account has been successfully created with the email: {{email}}
    
    Get started: https://example.com/get-started
    
    If you have any questions, feel free to reach out to our support team.
    
    Best regards,
    The {{companyName}} Team
  `,
  variables: []
});

console.log('Welcome template created:', welcomeTemplate.id);
```

### Create a Newsletter Template

```typescript
const newsletterTemplate = await templateService.createTemplate({
  name: 'Monthly Newsletter',
  subject: '{{monthName}} Newsletter - Latest Updates',
  htmlContent: `
    <!DOCTYPE html>
    <html>
    <body>
      <h1>{{monthName}} Newsletter</h1>
      <p>Hi {{firstName}},</p>
      <p>Here are the latest updates from our team:</p>
      
      <h2>Featured Article</h2>
      <p>{{articleTitle}}</p>
      <p>{{articleSummary}}</p>
      <a href="{{articleUrl}}">Read More</a>
      
      <h2>Upcoming Events</h2>
      <p>{{eventsDescription}}</p>
      
      <p>Stay connected!</p>
    </body>
    </html>
  `,
  variables: []
});
```

### Validate Template Before Saving

```typescript
const validation = await templateService.validateTemplateSyntax(
  '<h1>Hello {{firstName}}</h1>',
  'Welcome {{firstName}}'
);

if (validation.valid) {
  console.log('Template syntax is valid');
} else {
  console.error('Template errors:', validation.errors);
}
```

### Clone and Modify Template

```typescript
// Clone existing template
const clonedTemplate = await templateService.cloneTemplate(
  welcomeTemplate.id,
  'Welcome Email - Variant B'
);

// Modify the cloned template
await templateService.updateTemplate(clonedTemplate.id, {
  subject: 'Get Started with {{companyName}}, {{firstName}}!',
  htmlContent: '<!-- Modified content -->'
});
```

## Recipient Management

### Import Recipients from CSV File

```typescript
import fs from 'fs';

// Read CSV file
const csvContent = fs.readFileSync('recipients.csv', 'utf-8');

// Import recipients
const importResult = await recipientService.importFromCSV(csvContent);

console.log(`
  Successfully imported: ${importResult.success}
  Failed: ${importResult.failed}
`);

if (importResult.failed > 0) {
  console.log('Errors:');
  importResult.errors.forEach(error => {
    console.log(`  Row ${error.row}: ${error.email} - ${error.error}`);
  });
}
```

### Import from Email List

```typescript
const emailList = `
john.doe@example.com
jane.smith@company.com
bob.wilson@startup.io
alice.johnson@tech.com
`;

const result = await recipientService.importFromText(emailList);
console.log(`Imported ${result.success} recipients`);
```

### Create Recipients with Custom Fields

```typescript
const recipients = [
  {
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    customFields: {
      company: 'Acme Inc',
      role: 'Developer',
      industry: 'Technology',
      signupDate: '2026-01-15'
    },
    status: 'active' as const
  },
  {
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    customFields: {
      company: 'Tech Corp',
      role: 'Manager',
      industry: 'Software'
    },
    status: 'active' as const
  }
];

const bulkResult = await recipientService.bulkCreateRecipients(recipients);
console.log(`Created ${bulkResult.success} recipients`);
```

### Search and Filter Recipients

```typescript
// Search by email
const searchResults = await recipientService.searchRecipients('john@');

// Get only active recipients
const activeRecipients = await recipientService.getActiveRecipients();

// Get specific recipient
const recipient = await recipientService.getRecipientByEmail('john@example.com');
```

### Handle Unsubscribes

```typescript
// Unsubscribe a recipient
await recipientService.unsubscribeRecipient('user@example.com');

// Mark as bounced
await recipientService.markRecipientBounced('bounced@example.com');
```

## Campaign Creation and Sending

### Create and Send Simple Campaign

```typescript
// Get active recipients
const recipients = await recipientService.getActiveRecipients();

// Create campaign
const campaign = await broadcastingService.createCampaign({
  name: 'Welcome Campaign - January 2026',
  templateId: welcomeTemplate.id,
  recipients: recipients.map(r => r.toJSON()),
  status: 'draft'
});

// Send immediately
await broadcastingService.sendCampaign(campaign.id);

console.log('Campaign sent successfully!');
```

### Create Campaign with Specific Recipients

```typescript
// Select specific recipients
const targetEmails = [
  'john@example.com',
  'jane@example.com',
  'bob@example.com'
];

const selectedRecipients = [];
for (const email of targetEmails) {
  const recipient = await recipientService.getRecipientByEmail(email);
  if (recipient) {
    selectedRecipients.push(recipient.toJSON());
  }
}

const campaign = await broadcastingService.createCampaign({
  name: 'Targeted Campaign',
  templateId: newsletterTemplate.id,
  recipients: selectedRecipients,
  status: 'draft'
});
```

### Send Campaign with Error Handling

```typescript
try {
  await broadcastingService.sendCampaign(campaign.id);
  console.log('Campaign sent successfully');
  
  // Get immediate stats
  const stats = await broadcastingService.getCampaignStats(campaign.id);
  console.log(`Sent to ${stats.sent} recipients`);
} catch (error) {
  console.error('Failed to send campaign:', error.message);
  
  // Check campaign status
  const campaign = await broadcastingService.getCampaign(campaign.id);
  console.log('Campaign status:', campaign?.status);
}
```

## Scheduling

### Schedule One-Time Campaign

```typescript
// Create campaign
const campaign = await broadcastingService.createCampaign({
  name: 'Scheduled Newsletter',
  templateId: newsletterTemplate.id,
  recipients: recipients.map(r => r.toJSON()),
  status: 'scheduled',
  scheduledAt: new Date('2026-02-01T10:00:00Z')
});

// Schedule the send
await schedulerService.scheduleCampaign(
  campaign.id,
  {
    type: 'once',
    startDate: new Date('2026-02-01T10:00:00Z')
  },
  async () => {
    console.log('Executing scheduled campaign...');
    await broadcastingService.sendCampaign(campaign.id);
    console.log('Scheduled campaign sent!');
  }
);

console.log('Campaign scheduled for:', campaign.scheduledAt);
```

### Schedule Recurring Campaign

```typescript
// Weekly newsletter - Every Monday at 9 AM EST
await schedulerService.scheduleCampaign(
  campaign.id,
  {
    type: 'recurring',
    startDate: new Date(),
    cronExpression: '0 9 * * 1',
    timezone: 'America/New_York'
  },
  async () => {
    console.log('Sending weekly newsletter...');
    await broadcastingService.sendCampaign(campaign.id);
  }
);

// Monthly newsletter - First day of month at 10 AM
await schedulerService.scheduleCampaign(
  'monthly-campaign-id',
  {
    type: 'recurring',
    startDate: new Date(),
    cronExpression: '0 10 1 * *',
    timezone: 'UTC'
  },
  async () => {
    console.log('Sending monthly newsletter...');
    await broadcastingService.sendCampaign('monthly-campaign-id');
  }
);
```

### Manage Scheduled Campaigns

```typescript
// Pause a scheduled campaign
schedulerService.pauseSchedule(campaign.id);

// Resume a paused campaign
schedulerService.resumeSchedule(campaign.id);

// Cancel a scheduled campaign
schedulerService.cancelSchedule(campaign.id);

// Check if campaign is scheduled
const isScheduled = schedulerService.isScheduled(campaign.id);

// Get schedule details
const schedule = schedulerService.getSchedule(campaign.id);
```

## Tracking and Analytics

### Get Campaign Statistics

```typescript
// Wait a bit for emails to be processed
await new Promise(resolve => setTimeout(resolve, 5000));

// Get comprehensive stats
const stats = await broadcastingService.getCampaignStats(campaign.id);

console.log(`
Campaign Statistics:
-------------------
Total Recipients: ${stats.totalRecipients}
Sent: ${stats.sent} (${(stats.sent / stats.totalRecipients * 100).toFixed(1)}%)
Delivered: ${stats.delivered} (${(stats.delivered / stats.totalRecipients * 100).toFixed(1)}%)
Opened: ${stats.opened}
Clicked: ${stats.clicked}
Bounced: ${stats.bounced}
Failed: ${stats.failed}

Open Rate: ${stats.openRate.toFixed(2)}%
Click Rate: ${stats.clickRate.toFixed(2)}%
`);
```

### Get Detailed History

```typescript
// Get all mailing history for campaign
const history = await broadcastingService.getCampaignHistory(campaign.id);

// Group by status
const byStatus = history.reduce((acc, h) => {
  acc[h.status] = (acc[h.status] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log('Status breakdown:', byStatus);

// Find failed deliveries
const failed = history.filter(h => h.status === 'failed');
failed.forEach(h => {
  console.log(`Failed: ${h.recipientEmail} - ${h.error}`);
});
```

### Track Individual Recipient

```typescript
// Get recipient's campaign history
const recipientHistory = await broadcastingService.getRecipientHistory(recipientId);

console.log(`Recipient received ${recipientHistory.length} campaigns`);

recipientHistory.forEach(h => {
  console.log(`
    Campaign: ${h.campaignId}
    Status: ${h.status}
    Sent: ${h.sentAt}
    Opened: ${h.openedAt || 'Not opened'}
  `);
});
```

### Get Click Statistics

```typescript
const clickStats = trackingService.getClickStatsByUrl(campaign.id);

console.log('Click statistics by URL:');
clickStats.forEach((count, url) => {
  console.log(`  ${url}: ${count} clicks`);
});
```

## Advanced Use Cases

### A/B Testing

```typescript
// Create two template variants
const templateA = await templateService.createTemplate({
  name: 'Subject Test - Variant A',
  subject: 'Special Offer Inside!',
  htmlContent: '<h1>Check out our special offer</h1>',
  variables: []
});

const templateB = await templateService.createTemplate({
  name: 'Subject Test - Variant B',
  subject: 'Limited Time: Save 50%',
  htmlContent: '<h1>Limited time offer - Save 50%</h1>',
  variables: []
});

// Split recipients
const allRecipients = await recipientService.getActiveRecipients();
const half = Math.floor(allRecipients.length / 2);
const groupA = allRecipients.slice(0, half);
const groupB = allRecipients.slice(half);

// Create campaigns
const campaignA = await broadcastingService.createCampaign({
  name: 'A/B Test - Variant A',
  templateId: templateA.id,
  recipients: groupA.map(r => r.toJSON()),
  status: 'draft'
});

const campaignB = await broadcastingService.createCampaign({
  name: 'A/B Test - Variant B',
  templateId: templateB.id,
  recipients: groupB.map(r => r.toJSON()),
  status: 'draft'
});

// Send both
await broadcastingService.sendCampaign(campaignA.id);
await broadcastingService.sendCampaign(campaignB.id);

// Compare results after some time
setTimeout(async () => {
  const statsA = await broadcastingService.getCampaignStats(campaignA.id);
  const statsB = await broadcastingService.getCampaignStats(campaignB.id);
  
  console.log(`
    Variant A: ${statsA.openRate.toFixed(2)}% open rate
    Variant B: ${statsB.openRate.toFixed(2)}% open rate
    Winner: ${statsA.openRate > statsB.openRate ? 'A' : 'B'}
  `);
}, 3600000); // Check after 1 hour
```

### Drip Campaign

```typescript
// Create a series of emails
const drip1 = await templateService.createTemplate({
  name: 'Drip 1 - Welcome',
  subject: 'Welcome to our service!',
  htmlContent: '<h1>Welcome!</h1>',
  variables: []
});

const drip2 = await templateService.createTemplate({
  name: 'Drip 2 - Getting Started',
  subject: 'Getting started guide',
  htmlContent: '<h1>Let us help you get started</h1>',
  variables: []
});

const drip3 = await templateService.createTemplate({
  name: 'Drip 3 - Advanced Features',
  subject: 'Unlock advanced features',
  htmlContent: '<h1>Advanced features</h1>',
  variables: []
});

// Schedule drip sequence for new user
async function startDripCampaign(recipientEmail: string) {
  const recipient = await recipientService.getRecipientByEmail(recipientEmail);
  if (!recipient) return;
  
  const recipients = [recipient.toJSON()];
  
  // Day 0: Welcome email (immediate)
  const campaign1 = await broadcastingService.createCampaign({
    name: `Drip 1 - ${recipientEmail}`,
    templateId: drip1.id,
    recipients,
    status: 'draft'
  });
  await broadcastingService.sendCampaign(campaign1.id);
  
  // Day 3: Getting started
  const campaign2 = await broadcastingService.createCampaign({
    name: `Drip 2 - ${recipientEmail}`,
    templateId: drip2.id,
    recipients,
    status: 'scheduled'
  });
  
  const day3 = new Date();
  day3.setDate(day3.getDate() + 3);
  
  await schedulerService.scheduleCampaign(
    campaign2.id,
    { type: 'once', startDate: day3 },
    async () => await broadcastingService.sendCampaign(campaign2.id)
  );
  
  // Day 7: Advanced features
  const campaign3 = await broadcastingService.createCampaign({
    name: `Drip 3 - ${recipientEmail}`,
    templateId: drip3.id,
    recipients,
    status: 'scheduled'
  });
  
  const day7 = new Date();
  day7.setDate(day7.getDate() + 7);
  
  await schedulerService.scheduleCampaign(
    campaign3.id,
    { type: 'once', startDate: day7 },
    async () => await broadcastingService.sendCampaign(campaign3.id)
  );
}

// Start drip for new user
await startDripCampaign('newuser@example.com');
```

### Segmented Campaign

```typescript
// Get all recipients
const allRecipients = await recipientService.getAllRecipients();

// Segment by custom field
const segments = {
  developers: allRecipients.filter(r => r.customFields.role === 'Developer'),
  managers: allRecipients.filter(r => r.customFields.role === 'Manager'),
  executives: allRecipients.filter(r => r.customFields.role === 'Executive')
};

// Send different content to each segment
for (const [segment, recipients] of Object.entries(segments)) {
  const campaign = await broadcastingService.createCampaign({
    name: `Targeted Campaign - ${segment}`,
    templateId: getTemplateForSegment(segment),
    recipients: recipients.map(r => r.toJSON()),
    status: 'draft'
  });
  
  await broadcastingService.sendCampaign(campaign.id);
}

function getTemplateForSegment(segment: string): string {
  // Return appropriate template ID for each segment
  const templates: Record<string, string> = {
    developers: 'dev-template-id',
    managers: 'manager-template-id',
    executives: 'exec-template-id'
  };
  return templates[segment] || 'default-template-id';
}
```

### Monitor Campaign in Real-Time

```typescript
async function monitorCampaign(campaignId: string, duration: number = 3600000) {
  const startTime = Date.now();
  
  const interval = setInterval(async () => {
    const stats = await broadcastingService.getCampaignStats(campaignId);
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    
    console.clear();
    console.log(`
Campaign Monitor (${elapsed}s elapsed)
=====================================
Sent: ${stats.sent}/${stats.totalRecipients}
Delivered: ${stats.delivered}
Opened: ${stats.opened} (${stats.openRate.toFixed(2)}%)
Clicked: ${stats.clicked} (${stats.clickRate.toFixed(2)}%)
Bounced: ${stats.bounced}
Failed: ${stats.failed}
    `);
    
    if (Date.now() - startTime >= duration) {
      clearInterval(interval);
      console.log('\nMonitoring complete!');
    }
  }, 5000); // Update every 5 seconds
}

// Monitor campaign for 1 hour
await monitorCampaign(campaign.id, 3600000);
```
