import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sun, Moon, Monitor, Bell, Clock, Target, Wallet, Users, HandCoins, Save } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useNotifications();

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  const handleSave = () => {
    toast.success('Settings saved!');
    navigate('/more');
  };

  return (
    <div className="page-enter pb-6">
      <PageHeader title="Settings" showBack />

      <div className="px-4 space-y-6">
        {/* Appearance Section */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Appearance
          </h3>
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <Label className="text-sm text-muted-foreground mb-3 block">Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    theme === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-muted/50 hover:bg-muted'
                  )}
                >
                  <option.icon className={cn(
                    'h-6 w-6',
                    theme === option.value ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </h3>
          <div className="bg-card rounded-2xl p-4 shadow-card space-y-4">
            {/* Master Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Get reminders and alerts
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => updateSettings({ enabled: checked })}
              />
            </div>

            {settings.enabled && (
              <>
                <div className="border-t pt-4" />

                {/* Daily Reminder */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-sm">Daily Expense Reminder</Label>
                      <p className="text-xs text-muted-foreground">
                        Remind me to log expenses
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.dailyReminder}
                    onCheckedChange={(checked) => updateSettings({ dailyReminder: checked })}
                  />
                </div>

                {settings.dailyReminder && (
                  <div className="pl-12">
                    <Label className="text-xs text-muted-foreground">Reminder Time</Label>
                    <Input
                      type="time"
                      value={settings.reminderTime}
                      onChange={(e) => updateSettings({ reminderTime: e.target.value })}
                      className="w-32 mt-1"
                    />
                  </div>
                )}

                {/* Budget Alerts */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-expense/10">
                      <Wallet className="h-4 w-4 text-expense" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-sm">Budget Alerts</Label>
                      <p className="text-xs text-muted-foreground">
                        Alert when nearing budget limits
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.budgetAlerts}
                    onCheckedChange={(checked) => updateSettings({ budgetAlerts: checked })}
                  />
                </div>

                {/* Goal Reminders */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-savings/10">
                      <Target className="h-4 w-4 text-savings" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-sm">Goal Reminders</Label>
                      <p className="text-xs text-muted-foreground">
                        Remind about savings goals progress
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.goalReminders}
                    onCheckedChange={(checked) => updateSettings({ goalReminders: checked })}
                  />
                </div>

                {/* Loan Reminders */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-loan/10">
                      <HandCoins className="h-4 w-4 text-loan" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-sm">Loan Due Dates</Label>
                      <p className="text-xs text-muted-foreground">
                        Remind about loan repayments
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.loanReminders}
                    onCheckedChange={(checked) => updateSettings({ loanReminders: checked })}
                  />
                </div>

                {/* Committee Reminders */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-committee/10">
                      <Users className="h-4 w-4 text-committee" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-sm">Committee Payments</Label>
                      <p className="text-xs text-muted-foreground">
                        Remind about monthly contributions
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.committeeReminders}
                    onCheckedChange={(checked) => updateSettings({ committeeReminders: checked })}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full" size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};
