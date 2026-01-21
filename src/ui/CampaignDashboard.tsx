import React, { useState, useEffect } from 'react';

interface Campaign {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
  sentAt?: Date;
}

interface CampaignStats {
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

interface CampaignDashboardProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaignId: string) => void;
  onGetStats: (campaignId: string) => Promise<CampaignStats>;
}

/**
 * Campaign Dashboard Component for n8n
 */
export const CampaignDashboard: React.FC<CampaignDashboardProps> = ({
  campaigns,
  onSelectCampaign,
  onGetStats
}) => {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCampaignClick = async (campaignId: string) => {
    setSelectedCampaign(campaignId);
    setLoading(true);
    
    try {
      const campaignStats = await onGetStats(campaignId);
      setStats(campaignStats);
    } catch (error) {
      console.error('Failed to load campaign stats:', error);
    } finally {
      setLoading(false);
    }
    
    onSelectCampaign(campaignId);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      draft: 'status-draft',
      scheduled: 'status-scheduled',
      sending: 'status-sending',
      completed: 'status-completed',
      failed: 'status-failed'
    };

    return (
      <span className={`status-badge ${statusClasses[status] || ''}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="campaign-dashboard">
      <h2>Campaign Dashboard</h2>

      <div className="dashboard-layout">
        <div className="campaigns-list">
          <h3>Campaigns</h3>
          {campaigns.length === 0 ? (
            <p className="empty-state">No campaigns yet</p>
          ) : (
            <ul>
              {campaigns.map(campaign => (
                <li
                  key={campaign.id}
                  className={selectedCampaign === campaign.id ? 'selected' : ''}
                  onClick={() => handleCampaignClick(campaign.id)}
                >
                  <div className="campaign-item">
                    <div className="campaign-name">{campaign.name}</div>
                    <div className="campaign-meta">
                      {getStatusBadge(campaign.status)}
                      <span className="campaign-date">
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="campaign-details">
          {loading ? (
            <div className="loading">Loading statistics...</div>
          ) : selectedCampaign && stats ? (
            <div className="stats-container">
              <h3>Campaign Statistics</h3>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Total Recipients</div>
                  <div className="stat-value">{stats.totalRecipients}</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Sent</div>
                  <div className="stat-value">{stats.sent}</div>
                  <div className="stat-percentage">
                    {((stats.sent / stats.totalRecipients) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Delivered</div>
                  <div className="stat-value">{stats.delivered}</div>
                  <div className="stat-percentage">
                    {((stats.delivered / stats.totalRecipients) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="stat-card highlight">
                  <div className="stat-label">Opened</div>
                  <div className="stat-value">{stats.opened}</div>
                  <div className="stat-percentage">
                    Open Rate: {stats.openRate.toFixed(1)}%
                  </div>
                </div>

                <div className="stat-card highlight">
                  <div className="stat-label">Clicked</div>
                  <div className="stat-value">{stats.clicked}</div>
                  <div className="stat-percentage">
                    Click Rate: {stats.clickRate.toFixed(1)}%
                  </div>
                </div>

                <div className="stat-card warning">
                  <div className="stat-label">Bounced</div>
                  <div className="stat-value">{stats.bounced}</div>
                </div>

                <div className="stat-card error">
                  <div className="stat-label">Failed</div>
                  <div className="stat-value">{stats.failed}</div>
                </div>
              </div>

              <div className="progress-bar">
                <div className="progress-section delivered" style={{ width: `${(stats.delivered / stats.totalRecipients) * 100}%` }}>
                  Delivered
                </div>
                <div className="progress-section bounced" style={{ width: `${(stats.bounced / stats.totalRecipients) * 100}%` }}>
                  Bounced
                </div>
                <div className="progress-section failed" style={{ width: `${(stats.failed / stats.totalRecipients) * 100}%` }}>
                  Failed
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              Select a campaign to view statistics
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
