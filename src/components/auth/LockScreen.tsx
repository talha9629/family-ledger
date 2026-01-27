import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface LockScreenProps {
  mode: 'unlock' | 'setup';
}

// Rate limiting constants
const MAX_ATTEMPTS = 5;
const BASE_LOCKOUT_SECONDS = 30;
const LOCKOUT_STORAGE_KEY = 'finance-app-lockout';

interface LockoutState {
  attempts: number;
  lockoutUntil: number | null;
}

function getLockoutState(): LockoutState {
  try {
    const stored = localStorage.getItem(LOCKOUT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return { attempts: 0, lockoutUntil: null };
}

function saveLockoutState(state: LockoutState): void {
  localStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify(state));
}

function clearLockoutState(): void {
  localStorage.removeItem(LOCKOUT_STORAGE_KEY);
}

function calculateLockoutDuration(attempts: number): number {
  // Exponential backoff: 30s, 60s, 120s, 240s, 480s...
  return BASE_LOCKOUT_SECONDS * Math.pow(2, Math.max(0, attempts - MAX_ATTEMPTS));
}

export function LockScreen({ mode }: LockScreenProps) {
  const { unlock, setPin } = useAuth();
  const [pin, setPinValue] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutState, setLockoutState] = useState<LockoutState>(getLockoutState);
  const [remainingLockout, setRemainingLockout] = useState(0);

  // Check and update lockout timer
  useEffect(() => {
    if (!lockoutState.lockoutUntil) {
      setRemainingLockout(0);
      return;
    }

    const updateRemaining = () => {
      const now = Date.now();
      if (lockoutState.lockoutUntil && now < lockoutState.lockoutUntil) {
        setRemainingLockout(Math.ceil((lockoutState.lockoutUntil - now) / 1000));
      } else {
        setRemainingLockout(0);
        // Lockout expired, keep attempt count but clear lockout time
        const newState = { ...lockoutState, lockoutUntil: null };
        setLockoutState(newState);
        saveLockoutState(newState);
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [lockoutState.lockoutUntil]);

  const isLockedOut = remainingLockout > 0;

  const handleUnlock = async () => {
    if (isLockedOut) return;

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

    if (success) {
      // Clear lockout state on successful unlock
      clearLockoutState();
      setLockoutState({ attempts: 0, lockoutUntil: null });
    } else {
      const newAttempts = lockoutState.attempts + 1;
      let newLockoutUntil: number | null = null;

      // Apply lockout after MAX_ATTEMPTS
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutSeconds = calculateLockoutDuration(newAttempts);
        newLockoutUntil = Date.now() + lockoutSeconds * 1000;
      }

      const newState = { attempts: newAttempts, lockoutUntil: newLockoutUntil };
      setLockoutState(newState);
      saveLockoutState(newState);

      const attemptsRemaining = MAX_ATTEMPTS - newAttempts;
      
      if (newLockoutUntil) {
        toast({
          title: "Too many failed attempts",
          description: `Please wait ${calculateLockoutDuration(newAttempts)} seconds before trying again`,
          variant: "destructive",
        });
      } else if (attemptsRemaining <= 2 && attemptsRemaining > 0) {
        toast({
          title: "Incorrect PIN",
          description: `${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining before lockout`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Incorrect PIN",
          description: "Please try again",
          variant: "destructive",
        });
      }
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
    if (e.key === 'Enter' && !isLockedOut) {
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
          <div className={`p-4 rounded-full ${isLockedOut ? 'bg-destructive/10' : 'bg-primary/10'}`}>
            {isLockedOut ? (
              <AlertTriangle className="h-12 w-12 text-destructive" />
            ) : mode === 'setup' ? (
              <ShieldCheck className="h-12 w-12 text-primary" />
            ) : (
              <Lock className="h-12 w-12 text-primary" />
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            {isLockedOut ? 'Temporarily Locked' : mode === 'setup' ? 'Secure Your Data' : 'Family Finance'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isLockedOut 
              ? `Too many failed attempts. Please wait ${remainingLockout} seconds.`
              : mode === 'setup' 
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
              disabled={isLockedOut}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLockedOut}
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
            disabled={isLoading || isLockedOut || pin.length < 4 || (mode === 'setup' && confirmPin.length < 4)}
            className="w-full"
          >
            {isLoading ? 'Please wait...' : isLockedOut ? `Wait ${remainingLockout}s` : mode === 'setup' ? 'Set PIN' : 'Unlock'}
          </Button>

          {mode === 'setup' && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                ⚠️ Remember your PIN! If forgotten, you'll need to clear app data.
              </p>
              <div className="p-3 bg-muted/50 rounded-lg text-left">
                <p className="text-xs text-muted-foreground">
                  <strong>Security Note:</strong> This PIN provides a convenience lock for your app. 
                  For maximum security, also enable your device's screen lock and disk encryption. 
                  Physical access to an unlocked device could allow data access.
                </p>
              </div>
            </div>
          )}

          {mode === 'unlock' && lockoutState.attempts > 0 && !isLockedOut && (
            <p className="text-xs text-muted-foreground">
              {MAX_ATTEMPTS - lockoutState.attempts} attempt{MAX_ATTEMPTS - lockoutState.attempts === 1 ? '' : 's'} remaining
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
