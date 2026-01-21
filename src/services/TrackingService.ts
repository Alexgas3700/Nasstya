import { v4 as uuidv4 } from 'uuid';
import { TrackingPixelData } from '../types';

/**
 * Service for tracking email opens and clicks
 */
export class TrackingService {
  private trackingEvents: Map<string, TrackingPixelData> = new Map();
  private baseUrl: string;

  constructor(baseUrl: string = 'https://tracking.example.com') {
    this.baseUrl = baseUrl;
  }

  /**
   * Add tracking pixel to email HTML
   */
  addTrackingPixel(html: string, campaignId: string, recipientId: string): string {
    const trackingId = uuidv4();
    const pixelUrl = `${this.baseUrl}/track/open/${trackingId}`;
    
    // Store tracking data
    this.trackingEvents.set(trackingId, {
      campaignId,
      recipientId,
      type: 'open',
      timestamp: new Date()
    });

    // Add tracking pixel at the end of HTML
    const trackingPixel = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;" />`;
    
    // Insert before closing body tag or at the end
    if (html.includes('</body>')) {
      return html.replace('</body>', `${trackingPixel}</body>`);
    } else {
      return html + trackingPixel;
    }
  }

  /**
   * Add click tracking to links
   */
  addClickTracking(html: string, campaignId: string, recipientId: string): string {
    const linkRegex = /<a\s+([^>]*href=["']([^"']+)["'][^>]*)>/gi;
    
    return html.replace(linkRegex, (match, attributes, url) => {
      const trackingId = uuidv4();
      const trackedUrl = `${this.baseUrl}/track/click/${trackingId}`;
      
      // Store tracking data with original URL
      this.trackingEvents.set(trackingId, {
        campaignId,
        recipientId,
        type: 'click',
        url,
        timestamp: new Date()
      });

      return `<a ${attributes.replace(url, trackedUrl)}>`;
    });
  }

  /**
   * Add both open and click tracking
   */
  addFullTracking(html: string, campaignId: string, recipientId: string): string {
    let tracked = this.addClickTracking(html, campaignId, recipientId);
    tracked = this.addTrackingPixel(tracked, campaignId, recipientId);
    return tracked;
  }

  /**
   * Record tracking event (open or click)
   */
  async recordEvent(trackingId: string): Promise<TrackingPixelData | undefined> {
    const event = this.trackingEvents.get(trackingId);
    
    if (event) {
      event.timestamp = new Date();
      return event;
    }

    return undefined;
  }

  /**
   * Get tracking data by ID
   */
  getTrackingData(trackingId: string): TrackingPixelData | undefined {
    return this.trackingEvents.get(trackingId);
  }

  /**
   * Get all tracking events for campaign
   */
  getCampaignTrackingEvents(campaignId: string): TrackingPixelData[] {
    return Array.from(this.trackingEvents.values()).filter(
      event => event.campaignId === campaignId
    );
  }

  /**
   * Get all tracking events for recipient
   */
  getRecipientTrackingEvents(recipientId: string): TrackingPixelData[] {
    return Array.from(this.trackingEvents.values()).filter(
      event => event.recipientId === recipientId
    );
  }

  /**
   * Get open events for campaign
   */
  getCampaignOpenEvents(campaignId: string): TrackingPixelData[] {
    return this.getCampaignTrackingEvents(campaignId).filter(
      event => event.type === 'open'
    );
  }

  /**
   * Get click events for campaign
   */
  getCampaignClickEvents(campaignId: string): TrackingPixelData[] {
    return this.getCampaignTrackingEvents(campaignId).filter(
      event => event.type === 'click'
    );
  }

  /**
   * Get click statistics by URL
   */
  getClickStatsByUrl(campaignId: string): Map<string, number> {
    const clickEvents = this.getCampaignClickEvents(campaignId);
    const stats = new Map<string, number>();

    for (const event of clickEvents) {
      if (event.url) {
        const count = stats.get(event.url) || 0;
        stats.set(event.url, count + 1);
      }
    }

    return stats;
  }

  /**
   * Clear tracking data for campaign
   */
  clearCampaignTracking(campaignId: string): void {
    const toDelete: string[] = [];
    
    for (const [id, event] of this.trackingEvents.entries()) {
      if (event.campaignId === campaignId) {
        toDelete.push(id);
      }
    }

    for (const id of toDelete) {
      this.trackingEvents.delete(id);
    }
  }

  /**
   * Set base URL for tracking
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}
