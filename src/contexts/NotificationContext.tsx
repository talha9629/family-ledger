import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATION_KEY = 'family-finance-notifications';

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

  useEffect(() => {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const checkDueReminders = () => {
    // This is a placeholder - in a real app with backend, 
    // you'd check for due loans, committee payments, etc.
    // For now, we store the preference locally
  };

  return (
    <NotificationContext.Provider value={{ settings, updateSettings, checkDueReminders }}>
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
