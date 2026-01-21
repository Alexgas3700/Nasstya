import { EmailProvider } from '../api/EmailProvider';
import { SMTPProvider } from '../api/SMTPProvider';
import { SendGridProvider } from '../api/SendGridProvider';
import { MailgunProvider } from '../api/MailgunProvider';
import { Campaign } from '../models/Campaign';
import { MailingHistory } from '../models/MailingHistory';
import { TemplateService } from './TemplateService';
import { RecipientService } from './RecipientService';
import { TrackingService } from './TrackingService';
import { EmailConfig, CampaignData, EmailMessage } from '../types';

/**
 * Main service for email broadcasting
 */
export class EmailBroadcastingService {
  private provider: EmailProvider;
  private templateService: TemplateService;
  private recipientService: RecipientService;
  private trackingService: TrackingService;
  private campaigns: Map<string, Campaign> = new Map();
  private mailingHistory: Map<string, MailingHistory> = new Map();

  constructor(
    emailConfig: EmailConfig,
    templateService: TemplateService,
    recipientService: RecipientService,
    trackingService: TrackingService
  ) {
    this.provider = this.createProvider(emailConfig);
    this.templateService = templateService;
    this.recipientService = recipientService;
    this.trackingService = trackingService;
  }

  /**
   * Create email provider based on configuration
   */
  private createProvider(config: EmailConfig): EmailProvider {
    switch (config.provider) {
      case 'smtp':
        return new SMTPProvider(config.config);
      case 'sendgrid':
        return new SendGridProvider(config.config);
      case 'mailgun':
        return new MailgunProvider(config.config);
      default:
        throw new Error(`Unsupported email provider: ${config.provider}`);
    }
  }

  /**
   * Create a new campaign
   */
  async createCampaign(data: CampaignData): Promise<Campaign> {
    const campaign = new Campaign(data);
    const validation = campaign.validate();

    if (!validation.valid) {
      throw new Error(`Campaign validation failed: ${validation.errors.join(', ')}`);
    }

    // Verify template exists
    const template = await this.templateService.getTemplate(campaign.templateId);
    if (!template) {
      throw new Error(`Template with ID ${campaign.templateId} not found`);
    }

    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(id: string): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  /**
   * Get all campaigns
   */
  async getAllCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }

  /**
   * Update campaign
   */
  async updateCampaign(id: string, data: Partial<CampaignData>): Promise<Campaign> {
    const campaign = this.campaigns.get(id);
    
    if (!campaign) {
      throw new Error(`Campaign with ID ${id} not found`);
    }

    if (campaign.status !== 'draft') {
      throw new Error('Only draft campaigns can be updated');
    }

    campaign.update(data);
    return campaign;
  }

  /**
   * Send campaign immediately
   */
  async sendCampaign(campaignId: string): Promise<void> {
    const campaign = this.campaigns.get(campaignId);
    
    if (!campaign) {
      throw new Error(`Campaign with ID ${campaignId} not found`);
    }

    if (campaign.status === 'sending' || campaign.status === 'completed') {
      throw new Error('Campaign is already being sent or has been completed');
    }

    campaign.startSending();

    try {
      await this.processCampaign(campaign);
      campaign.complete();
    } catch (error) {
      campaign.fail();
      throw error;
    }
  }

  /**
   * Process campaign and send emails
   */
  private async processCampaign(campaign: Campaign): Promise<void> {
    const template = await this.templateService.getTemplate(campaign.templateId);
    
    if (!template) {
      throw new Error(`Template with ID ${campaign.templateId} not found`);
    }

    const activeRecipients = campaign.recipients.filter(r => r.status === 'active');

    for (const recipientData of activeRecipients) {
      const history = new MailingHistory({
        campaignId: campaign.id,
        recipientId: recipientData.id!,
        recipientEmail: recipientData.email,
        status: 'pending'
      });

      this.mailingHistory.set(history.id, history);

      try {
        // Get recipient for variable substitution
        const recipient = await this.recipientService.getRecipient(recipientData.id!);
        
        if (!recipient) {
          throw new Error('Recipient not found');
        }

        // Render template with recipient variables
        const rendered = await this.templateService.renderTemplate(
          campaign.templateId,
          recipient.getVariables()
        );

        // Add tracking pixel
        const trackedHtml = this.trackingService.addTrackingPixel(
          rendered.html,
          campaign.id,
          recipientData.id!
        );

        // Create email message
        const message: EmailMessage = {
          from: 'noreply@example.com', // Should be configurable
          to: recipientData.email,
          subject: rendered.subject,
          html: trackedHtml,
          text: rendered.text
        };

        // Send email
        const result = await this.provider.sendEmail(message);

        if (result.success) {
          history.markSent(result.messageId);
        } else {
          history.markFailed(result.error || 'Unknown error');
        }
      } catch (error) {
        history.markFailed(error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(campaignId: string) {
    const histories = Array.from(this.mailingHistory.values()).filter(
      h => h.campaignId === campaignId
    );

    const total = histories.length;
    const sent = histories.filter(h => h.status === 'sent' || h.status === 'delivered' || h.status === 'opened' || h.status === 'clicked').length;
    const delivered = histories.filter(h => h.status === 'delivered' || h.status === 'opened' || h.status === 'clicked').length;
    const opened = histories.filter(h => h.status === 'opened' || h.status === 'clicked').length;
    const clicked = histories.filter(h => h.status === 'clicked').length;
    const bounced = histories.filter(h => h.status === 'bounced').length;
    const failed = histories.filter(h => h.status === 'failed').length;

    return {
      campaignId,
      totalRecipients: total,
      sent,
      delivered,
      opened,
      clicked,
      bounced,
      failed,
      openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
      clickRate: delivered > 0 ? (clicked / delivered) * 100 : 0
    };
  }

  /**
   * Get mailing history for campaign
   */
  async getCampaignHistory(campaignId: string): Promise<MailingHistory[]> {
    return Array.from(this.mailingHistory.values()).filter(
      h => h.campaignId === campaignId
    );
  }

  /**
   * Get mailing history for recipient
   */
  async getRecipientHistory(recipientId: string): Promise<MailingHistory[]> {
    return Array.from(this.mailingHistory.values()).filter(
      h => h.recipientId === recipientId
    );
  }

  /**
   * Verify email provider connection
   */
  async verifyConnection(): Promise<boolean> {
    return this.provider.verifyConnection();
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return this.provider.getProviderName();
  }
}
