import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationService } from '@/services/notificationService';

interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  reminderTime: string; // HH:mm format
  budgetAlerts: boolean;
  goalReminders: boolean;
  loanReminders: boolean;
  committeeReminders: boolean;
}

interface NotificationContextType {
  settings: NotificationSettings;
  updateSettings: (updates: Partial<NotificationSettings>) => void;
  checkDueReminders: () => void;
  requestPermission: () => Promise<boolean>;
  isSupported: boolean;
  hasPermission: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATION_KEY = 'family-finance-notifications';
const LAST_REMINDER_KEY = 'family-finance-last-reminder';

const defaultSettings: NotificationSettings = {
  enabled: true,
  dailyReminder: true,
  reminderTime: '20:00',
  budgetAlerts: true,
  goalReminders: true,
  loanReminders: true,
  committeeReminders: true,
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(NOTIFICATION_KEY);
      if (saved) {
        try {
          return { ...defaultSettings, ...JSON.parse(saved) };
        } catch {
          return defaultSettings;
        }
      }
    }
    return defaultSettings;
  });

  const [hasPermission, setHasPermission] = useState(false);
  const isSupported = notificationService.isSupported();

  // Check permission on mount
  useEffect(() => {
    if (isSupported) {
      setHasPermission(notificationService.getPermission() === 'granted');
    }
  }, [isSupported]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(settings));
  }, [settings]);

  // Set up daily reminder check
  useEffect(() => {
    if (!settings.enabled || !settings.dailyReminder || !hasPermission) {
      return;
    }

    const checkDailyReminder = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const today = now.toDateString();
      
      const lastReminder = localStorage.getItem(LAST_REMINDER_KEY);
      
      // If it's the reminder time and we haven't sent one today
      if (currentTime === settings.reminderTime && lastReminder !== today) {
        sendDailyReminder();
        localStorage.setItem(LAST_REMINDER_KEY, today);
      }
    };

    // Check every minute
    const interval = setInterval(checkDailyReminder, 60000);
    
    // Check immediately
    checkDailyReminder();

    return () => clearInterval(interval);
  }, [settings.enabled, settings.dailyReminder, settings.reminderTime, hasPermission]);

  const sendDailyReminder = () => {
    // Get today's transactions from localStorage or your data source
    // This is a simplified example - adjust based on your data structure
    try {
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const today = new Date().toDateString();
      
      const todayTransactions = transactions.filter((t: any) => 
        new Date(t.date).toDateString() === today
      );

      const totalIncome = todayTransactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const totalExpenses = todayTransactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      notificationService.notifyDailyReminder(totalExpenses, totalIncome);
    } catch (error) {
      console.error('Failed to send daily reminder:', error);
    }
  };

  const updateSettings = (updates: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    
    // If enabling notifications, request permission
    if (updates.enabled && !hasPermission) {
      requestPermission();
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Notifications are not supported in this browser');
      return false;
    }

    const granted = await notificationService.requestPermission();
    setHasPermission(granted);
    
    if (granted) {
      // Show a welcome notification
      notificationService.show({
        title: '🎉 Notifications Enabled!',
        body: 'You will now receive reminders and alerts for your finances',
        tag: 'welcome',
        vibrate: [200, 100, 200],
      });
    }

    return granted;
  };

  const checkDueReminders = () => {
    if (!settings.enabled || !hasPermission) {
      return;
    }

    try {
      // Check for due loans
      if (settings.loanReminders) {
        const loans = JSON.parse(localStorage.getItem('loans') || '[]');
        const today = new Date();
        
        loans.forEach((loan: any) => {
          if (loan.nextPaymentDate) {
            const dueDate = new Date(loan.nextPaymentDate);
            const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            // Notify 3 days before
            if (daysUntilDue === 3) {
              notificationService.notifyLoanPaymentDue(
                loan.name,
                loan.monthlyPayment,
                loan.nextPaymentDate
              );
            }
            
            // Notify if overdue
            if (daysUntilDue < 0) {
              notificationService.notifyLoanPaymentOverdue(
                loan.name,
                loan.monthlyPayment,
                Math.abs(daysUntilDue)
              );
            }
          }
        });
      }

      // Check for committee payments
      if (settings.committeeReminders) {
        const committees = JSON.parse(localStorage.getItem('committees') || '[]');
        const today = new Date();
        
        committees.forEach((committee: any) => {
          if (committee.nextPaymentDate) {
            const dueDate = new Date(committee.nextPaymentDate);
            const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            // Notify 3 days before
            if (daysUntilDue === 3) {
              notificationService.notifyCommitteePaymentDue(
                committee.name,
                committee.monthlyAmount,
                committee.nextPaymentDate
              );
            }
          }
        });
      }

      // Check budget alerts
      if (settings.budgetAlerts) {
        const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        budgets.forEach((budget: any) => {
          const monthTransactions = transactions.filter((t: any) => {
            const tDate = new Date(t.date);
            return t.category === budget.category && 
                   t.type === 'expense' &&
                   tDate.getMonth() === currentMonth &&
                   tDate.getFullYear() === currentYear;
          });

          const spent = monthTransactions.reduce((sum: number, t: any) => sum + t.amount, 0);
          const percentage = (spent / budget.limit) * 100;

          // Alert at 80%
          if (percentage >= 80 && percentage < 100) {
            notificationService.notifyBudgetAlert(budget.category, spent, budget.limit);
          }
          
          // Alert when exceeded
          if (percentage >= 100) {
            notificationService.notifyBudgetExceeded(budget.category, spent, budget.limit);
          }
        });
      }

      // Check goal progress
      if (settings.goalReminders) {
        const goals = JSON.parse(localStorage.getItem('goals') || '[]');
        
        goals.forEach((goal: any) => {
          const percentage = (goal.current / goal.target) * 100;
          
          // Notify at milestones: 25%, 50%, 75%, 90%, 100%
          const milestones = [25, 50, 75, 90];
          milestones.forEach(milestone => {
            const lastNotified = localStorage.getItem(`goal-${goal.id}-${milestone}`);
            if (percentage >= milestone && !lastNotified) {
              notificationService.notifyGoalProgress(goal.name, goal.current, goal.target);
              localStorage.setItem(`goal-${goal.id}-${milestone}`, 'true');
            }
          });

          // Goal achieved
          if (percentage >= 100) {
            const achieved = localStorage.getItem(`goal-${goal.id}-achieved`);
            if (!achieved) {
              notificationService.notifyGoalAchieved(goal.name, goal.target);
              localStorage.setItem(`goal-${goal.id}-achieved`, 'true');
            }
          }
        });
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  };

  // Run reminder checks periodically
  useEffect(() => {
    if (settings.enabled && hasPermission) {
      // Check immediately
      checkDueReminders();
      
      // Then check every hour
      const interval = setInterval(checkDueReminders, 60 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [settings.enabled, hasPermission]);

  return (
    <NotificationContext.Provider 
      value={{ 
        settings, 
        updateSettings, 
        checkDueReminders,
        requestPermission,
        isSupported,
        hasPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
