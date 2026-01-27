import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Sun, Moon, Monitor, Bell, Clock, Target, Wallet, Users, HandCoins, Save, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useNotifications();
  const { isPinSet, setPin, changePin, removePin, lock } = useAuth();
  
  // PIN dialog states
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinDialogMode, setPinDialogMode] = useState<'set' | 'change' | 'remove'>('set');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  const handleSave = () => {
    toast.success('Settings saved!');
    navigate('/more');
  };

  const openPinDialog = (mode: 'set' | 'change' | 'remove') => {
    setPinDialogMode(mode);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setShowPins(false);
    setShowPinDialog(true);
  };

  const handlePinAction = async () => {
    setIsProcessing(true);

    try {
      if (pinDialogMode === 'set') {
        if (newPin.length < 4) {
          toast.error('PIN must be at least 4 digits');
          return;
        }
        if (newPin !== confirmPin) {
          toast.error('PINs do not match');
          return;
        }
        await setPin(newPin);
        toast.success('PIN set successfully! Your data is now protected.');
        setShowPinDialog(false);
      } else if (pinDialogMode === 'change') {
        if (newPin.length < 4) {
          toast.error('New PIN must be at least 4 digits');
          return;
        }
        if (newPin !== confirmPin) {
          toast.error('New PINs do not match');
          return;
        }
        const success = await changePin(currentPin, newPin);
        if (success) {
          toast.success('PIN changed successfully!');
          setShowPinDialog(false);
        } else {
          toast.error('Current PIN is incorrect');
        }
      } else if (pinDialogMode === 'remove') {
        const success = await removePin(currentPin);
        if (success) {
          toast.success('PIN removed. Your data is no longer protected.');
          setShowPinDialog(false);
        } else {
          toast.error('Current PIN is incorrect');
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="page-enter pb-6">
      <PageHeader title="Settings" showBack />

      <div className="px-4 space-y-6">
        {/* Security Section */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </h3>
          <div className="bg-card rounded-2xl p-4 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-sm">PIN Protection</Label>
                  <p className="text-xs text-muted-foreground">
                    {isPinSet ? 'Your data is protected' : 'Protect your financial data'}
                  </p>
                </div>
              </div>
              <Switch
                checked={isPinSet}
                onCheckedChange={(checked) => {
                  if (checked) {
                    openPinDialog('set');
                  } else {
                    openPinDialog('remove');
                  }
                }}
              />
            </div>

            {isPinSet && (
              <>
                <div className="border-t pt-4 space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openPinDialog('change')}
                    className="w-full"
                  >
                    Change PIN
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={lock}
                    className="w-full"
                  >
                    Lock App Now
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  App auto-locks after 5 minutes of inactivity
                </p>
              </>
            )}
          </div>
        </div>

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

      {/* PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pinDialogMode === 'set' && 'Set PIN'}
              {pinDialogMode === 'change' && 'Change PIN'}
              {pinDialogMode === 'remove' && 'Remove PIN'}
            </DialogTitle>
            <DialogDescription>
              {pinDialogMode === 'set' && 'Create a PIN to protect your financial data.'}
              {pinDialogMode === 'change' && 'Enter your current PIN and new PIN.'}
              {pinDialogMode === 'remove' && 'Enter your current PIN to remove protection.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {(pinDialogMode === 'change' || pinDialogMode === 'remove') && (
              <div className="space-y-2">
                <Label>Current PIN</Label>
                <div className="relative">
                  <Input
                    type={showPins ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="Enter current PIN"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPins(!showPins)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPins ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {(pinDialogMode === 'set' || pinDialogMode === 'change') && (
              <>
                <div className="space-y-2">
                  <Label>{pinDialogMode === 'change' ? 'New PIN' : 'PIN'}</Label>
                  <Input
                    type={showPins ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="Enter PIN (min 4 digits)"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Confirm PIN</Label>
                  <Input
                    type={showPins ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="Confirm PIN"
                  />
                </div>
              </>
            )}

            {pinDialogMode === 'set' && (
              <p className="text-xs text-muted-foreground">
                ⚠️ Remember your PIN! If forgotten, you'll need to clear app data to regain access.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPinDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePinAction} 
              disabled={isProcessing}
              className="flex-1"
              variant={pinDialogMode === 'remove' ? 'destructive' : 'default'}
            >
              {isProcessing ? 'Processing...' : (
                pinDialogMode === 'remove' ? 'Remove PIN' : 
                pinDialogMode === 'change' ? 'Change PIN' : 'Set PIN'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
