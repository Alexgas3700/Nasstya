/**
 * n8n Email Broadcasting Module
 * Main entry point for the email broadcasting functionality
 */

export { EmailBroadcastingService } from './services/EmailBroadcastingService';
export { TemplateService } from './services/TemplateService';
export { RecipientService } from './services/RecipientService';
export { SchedulerService } from './services/SchedulerService';
export { TrackingService } from './services/TrackingService';

export { SMTPProvider } from './api/SMTPProvider';
export { SendGridProvider } from './api/SendGridProvider';
export { MailgunProvider } from './api/MailgunProvider';

export { Template } from './models/Template';
export { Recipient } from './models/Recipient';
export { Campaign } from './models/Campaign';
export { MailingHistory } from './models/MailingHistory';

export * from './types';
