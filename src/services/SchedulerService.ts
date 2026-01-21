import cron from 'node-cron';
import { ScheduleConfig } from '../types';

/**
 * Service for scheduling email campaigns
 */
export class SchedulerService {
  private scheduledTasks: Map<string, cron.ScheduledTask> = new Map();
  private schedules: Map<string, ScheduleConfig> = new Map();

  /**
   * Schedule a campaign
   */
  async scheduleCampaign(
    campaignId: string,
    config: ScheduleConfig,
    callback: () => Promise<void>
  ): Promise<void> {
    // Cancel existing schedule if any
    this.cancelSchedule(campaignId);

    this.schedules.set(campaignId, config);

    if (config.type === 'once') {
      // Schedule one-time execution
      const delay = config.startDate.getTime() - Date.now();
      
      if (delay <= 0) {
        throw new Error('Start date must be in the future');
      }

      const timeout = setTimeout(async () => {
        try {
          await callback();
          this.schedules.delete(campaignId);
        } catch (error) {
          console.error(`Failed to execute scheduled campaign ${campaignId}:`, error);
        }
      }, delay);

      // Store timeout reference (wrapped in a compatible object)
      this.scheduledTasks.set(campaignId, {
        stop: () => clearTimeout(timeout),
        start: () => {},
        destroy: () => clearTimeout(timeout)
      } as any);
    } else if (config.type === 'recurring' && config.cronExpression) {
      // Schedule recurring execution
      if (!cron.validate(config.cronExpression)) {
        throw new Error('Invalid cron expression');
      }

      const task = cron.schedule(
        config.cronExpression,
        async () => {
          try {
            await callback();
          } catch (error) {
            console.error(`Failed to execute recurring campaign ${campaignId}:`, error);
          }
        },
        {
          scheduled: true,
          timezone: config.timezone || 'UTC'
        }
      );

      this.scheduledTasks.set(campaignId, task);
    } else {
      throw new Error('Invalid schedule configuration');
    }
  }

  /**
   * Cancel scheduled campaign
   */
  cancelSchedule(campaignId: string): boolean {
    const task = this.scheduledTasks.get(campaignId);
    
    if (task) {
      task.stop();
      this.scheduledTasks.delete(campaignId);
      this.schedules.delete(campaignId);
      return true;
    }

    return false;
  }

  /**
   * Get schedule for campaign
   */
  getSchedule(campaignId: string): ScheduleConfig | undefined {
    return this.schedules.get(campaignId);
  }

  /**
   * Get all scheduled campaigns
   */
  getAllSchedules(): Map<string, ScheduleConfig> {
    return new Map(this.schedules);
  }

  /**
   * Check if campaign is scheduled
   */
  isScheduled(campaignId: string): boolean {
    return this.scheduledTasks.has(campaignId);
  }

  /**
   * Pause scheduled campaign
   */
  pauseSchedule(campaignId: string): boolean {
    const task = this.scheduledTasks.get(campaignId);
    
    if (task) {
      task.stop();
      return true;
    }

    return false;
  }

  /**
   * Resume scheduled campaign
   */
  resumeSchedule(campaignId: string): boolean {
    const task = this.scheduledTasks.get(campaignId);
    
    if (task) {
      task.start();
      return true;
    }

    return false;
  }

  /**
   * Validate cron expression
   */
  validateCronExpression(expression: string): boolean {
    return cron.validate(expression);
  }

  /**
   * Stop all scheduled tasks
   */
  stopAll(): void {
    for (const task of this.scheduledTasks.values()) {
      task.stop();
    }
    this.scheduledTasks.clear();
    this.schedules.clear();
  }
}
