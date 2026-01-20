// src/services/notificationService.ts

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  vibrate?: number[];
  data?: any;
}

class NotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Request notification permission from the user
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Show a notification
   */
  async show(payload: NotificationPayload): Promise<void> {
    const hasPermission = await this.requestPermission();
    
    if (!hasPermission) {
      console.warn('Notification permission denied');
      return;
    }

    const options: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/icon-192.png',
      tag: payload.tag,
      requireInteraction: payload.requireInteraction || false,
      vibrate: payload.vibrate || [200, 100, 200],
      data: payload.data,
    };

    // Use Service Worker if available for better reliability
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(payload.title, options);
      } catch (error) {
        console.error('Service Worker notification failed:', error);
        // Fallback to regular notification
        new Notification(payload.title, options);
      }
    } else {
      new Notification(payload.title, options);
    }
  }

  /**
   * Finance-specific notification methods
   */

  async notifyDailyReminder(totalExpenses: number, totalIncome: number) {
    await this.show({
      title: '📊 Daily Finance Summary',
      body: `Today's expenses: ₹${totalExpenses.toLocaleString()} | Income: ₹${totalIncome.toLocaleString()}`,
      tag: 'daily-reminder',
      vibrate: [200],
    });
  }

  async notifyExpenseAdded(amount: number, category: string) {
    await this.show({
      title: '💸 Expense Added',
      body: `₹${amount.toLocaleString()} spent on ${category}`,
      tag: 'expense-added',
      vibrate: [200, 100, 200],
    });
  }

  async notifyIncomeAdded(amount: number, source: string) {
    await this.show({
      title: '💰 Income Added',
      body: `₹${amount.toLocaleString()} received from ${source}`,
      tag: 'income-added',
      vibrate: [200],
    });
  }

  async notifyBudgetAlert(category: string, spent: number, budget: number) {
    const percentage = Math.round((spent / budget) * 100);
    await this.show({
      title: '⚠️ Budget Alert',
      body: `${percentage}% of ${category} budget used (₹${spent.toLocaleString()} / ₹${budget.toLocaleString()})`,
      tag: 'budget-alert',
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
    });
  }

  async notifyBudgetExceeded(category: string, spent: number, budget: number) {
    const overspent = spent - budget;
    await this.show({
      title: '🚨 Budget Exceeded!',
      body: `${category} budget exceeded by ₹${overspent.toLocaleString()}`,
      tag: 'budget-exceeded',
      requireInteraction: true,
      vibrate: [300, 100, 300, 100, 300],
    });
  }

  async notifyGoalProgress(goalName: string, current: number, target: number) {
    const percentage = Math.round((current / target) * 100);
    await this.show({
      title: '🎯 Goal Progress',
      body: `${goalName}: ${percentage}% complete (₹${current.toLocaleString()} / ₹${target.toLocaleString()})`,
      tag: 'goal-progress',
      vibrate: [200],
    });
  }

  async notifyGoalAchieved(goalName: string, amount: number) {
    await this.show({
      title: '🎉 Goal Achieved!',
      body: `Congratulations! You've achieved your ${goalName} goal of ₹${amount.toLocaleString()}`,
      tag: 'goal-achieved',
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200, 100, 200],
    });
  }

  async notifyLoanPaymentDue(loanName: string, amount: number, dueDate: string) {
    await this.show({
      title: '💳 Loan Payment Due',
      body: `${loanName}: ₹${amount.toLocaleString()} due on ${dueDate}`,
      tag: 'loan-due',
      requireInteraction: true,
      vibrate: [300, 100, 300],
    });
  }

  async notifyLoanPaymentOverdue(loanName: string, amount: number, daysPast: number) {
    await this.show({
      title: '🚨 Loan Payment Overdue!',
      body: `${loanName}: ₹${amount.toLocaleString()} is ${daysPast} days overdue`,
      tag: 'loan-overdue',
      requireInteraction: true,
      vibrate: [300, 100, 300, 100, 300, 100, 300],
    });
  }

  async notifyCommitteePaymentDue(committeeName: string, amount: number, dueDate: string) {
    await this.show({
      title: '🤝 Committee Payment Due',
      body: `${committeeName}: ₹${amount.toLocaleString()} due on ${dueDate}`,
      tag: 'committee-due',
      requireInteraction: true,
      vibrate: [300, 100, 300],
    });
  }

  async notifyCommitteeTurnReceived(committeeName: string, amount: number) {
    await this.show({
      title: '🎊 Committee Turn Received!',
      body: `You received ₹${amount.toLocaleString()} from ${committeeName}`,
      tag: 'committee-received',
      vibrate: [200, 100, 200, 100, 200],
    });
  }

  async notifySavingsTarget(targetName: string, remaining: number) {
    await this.show({
      title: '💎 Savings Target',
      body: `${targetName}: ₹${remaining.toLocaleString()} remaining to reach your goal`,
      tag: 'savings-target',
      vibrate: [200],
    });
  }

  /**
   * Schedule a notification for later
   */
  scheduleNotification(payload: NotificationPayload, delayMs: number) {
    setTimeout(() => {
      this.show(payload);
    }, delayMs);
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    return this.permission;
  }
}

// Export a singleton instance
export const notificationService = new NotificationService();
