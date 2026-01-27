import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface LockScreenProps {
  mode: 'unlock' | 'setup';
}

export function LockScreen({ mode }: LockScreenProps) {
  const { unlock, setPin } = useAuth();
  const [pin, setPinValue] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleUnlock = async () => {
    if (pin.length < 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be at least 4 digits",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const success = await unlock(pin);
    setIsLoading(false);

    if (!success) {
      setAttempts(prev => prev + 1);
      toast({
        title: "Incorrect PIN",
        description: attempts >= 2 ? "Multiple failed attempts. Please try again carefully." : "Please try again",
        variant: "destructive",
      });
      setPinValue('');
    }
  };

  const handleSetPin = async () => {
    if (pin.length < 4) {
      toast({
        title: "PIN too short",
        description: "PIN must be at least 4 digits",
        variant: "destructive",
      });
      return;
    }

    if (pin !== confirmPin) {
      toast({
        title: "PINs don't match",
        description: "Please make sure both PINs are the same",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await setPin(pin);
    setIsLoading(false);

    toast({
      title: "PIN Set Successfully",
      description: "Your data is now protected with a PIN",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (mode === 'unlock') {
        handleUnlock();
      } else if (confirmPin.length >= 4) {
        handleSetPin();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10">
            {mode === 'setup' ? (
              <ShieldCheck className="h-12 w-12 text-primary" />
            ) : (
              <Lock className="h-12 w-12 text-primary" />
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            {mode === 'setup' ? 'Secure Your Data' : 'Family Finance'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {mode === 'setup' 
              ? 'Create a PIN to protect your financial data' 
              : 'Enter your PIN to unlock'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Input
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={mode === 'setup' ? 'Create a PIN (min 4 digits)' : 'Enter PIN'}
              value={pin}
              onChange={(e) => setPinValue(e.target.value.replace(/\D/g, '').slice(0, 8))}
              onKeyDown={handleKeyDown}
              className="text-center text-xl tracking-widest pr-10"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {mode === 'setup' && (
            <div className="relative">
              <Input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Confirm PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                onKeyDown={handleKeyDown}
                className="text-center text-xl tracking-widest pr-10"
              />
            </div>
          )}

          <Button 
            onClick={mode === 'unlock' ? handleUnlock : handleSetPin}
            disabled={isLoading || pin.length < 4 || (mode === 'setup' && confirmPin.length < 4)}
            className="w-full"
          >
            {isLoading ? 'Please wait...' : mode === 'setup' ? 'Set PIN' : 'Unlock'}
          </Button>

          {mode === 'setup' && (
            <p className="text-xs text-muted-foreground">
              ⚠️ Remember your PIN! If forgotten, you'll need to clear app data.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
