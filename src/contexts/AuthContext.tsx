import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  generateSalt, 
  storeSalt, 
  getSalt, 
  deriveKeyFromPin, 
  hashPin, 
  verifyPin 
} from '@/lib/crypto';

const PIN_HASH_KEY = 'finance-app-pin-hash';
const AUTO_LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

interface AuthContextType {
  isLocked: boolean;
  isPinSet: boolean;
  encryptionKey: CryptoKey | null;
  unlock: (pin: string) => Promise<boolean>;
  setPin: (pin: string) => Promise<void>;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
  removePin: (currentPin: string) => Promise<boolean>;
  lock: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(true);
  const [isPinSet, setIsPinSet] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Check if PIN is set on mount
  useEffect(() => {
    const pinHash = localStorage.getItem(PIN_HASH_KEY);
    const salt = getSalt();
    setIsPinSet(!!pinHash && !!salt);
    
    // If no PIN is set, don't lock the app
    if (!pinHash || !salt) {
      setIsLocked(false);
    }
  }, []);

  // Auto-lock after inactivity
  useEffect(() => {
    if (!isPinSet || isLocked) return;

    const checkInactivity = setInterval(() => {
      if (Date.now() - lastActivity > AUTO_LOCK_TIMEOUT) {
        setIsLocked(true);
        setEncryptionKey(null);
      }
    }, 1000);

    return () => clearInterval(checkInactivity);
  }, [isPinSet, isLocked, lastActivity]);

  // Track user activity
  useEffect(() => {
    if (!isPinSet) return;

    const updateActivity = () => setLastActivity(Date.now());
    
    window.addEventListener('click', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('touchstart', updateActivity);
    window.addEventListener('scroll', updateActivity);

    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, [isPinSet]);

  const unlock = useCallback(async (pin: string): Promise<boolean> => {
    const salt = getSalt();
    const storedHash = localStorage.getItem(PIN_HASH_KEY);
    
    if (!salt || !storedHash) {
      return false;
    }

    const isValid = await verifyPin(pin, salt, storedHash);
    
    if (isValid) {
      const key = await deriveKeyFromPin(pin, salt);
      setEncryptionKey(key);
      setIsLocked(false);
      setLastActivity(Date.now());
      return true;
    }
    
    return false;
  }, []);

  const setPin = useCallback(async (pin: string): Promise<void> => {
    const salt = generateSalt();
    storeSalt(salt);
    
    const pinHash = await hashPin(pin, salt);
    localStorage.setItem(PIN_HASH_KEY, pinHash);
    
    const key = await deriveKeyFromPin(pin, salt);
    setEncryptionKey(key);
    setIsPinSet(true);
    setIsLocked(false);
    setLastActivity(Date.now());
  }, []);

  const changePin = useCallback(async (oldPin: string, newPin: string): Promise<boolean> => {
    const salt = getSalt();
    const storedHash = localStorage.getItem(PIN_HASH_KEY);
    
    if (!salt || !storedHash) {
      return false;
    }

    const isValid = await verifyPin(oldPin, salt, storedHash);
    
    if (!isValid) {
      return false;
    }

    // Generate new salt and hash for new PIN
    const newSalt = generateSalt();
    storeSalt(newSalt);
    
    const newPinHash = await hashPin(newPin, newSalt);
    localStorage.setItem(PIN_HASH_KEY, newPinHash);
    
    const newKey = await deriveKeyFromPin(newPin, newSalt);
    setEncryptionKey(newKey);
    setLastActivity(Date.now());
    
    return true;
  }, []);

  const removePin = useCallback(async (currentPin: string): Promise<boolean> => {
    const salt = getSalt();
    const storedHash = localStorage.getItem(PIN_HASH_KEY);
    
    if (!salt || !storedHash) {
      return true; // Already no PIN
    }

    const isValid = await verifyPin(currentPin, salt, storedHash);
    
    if (!isValid) {
      return false;
    }

    localStorage.removeItem(PIN_HASH_KEY);
    localStorage.removeItem('finance-app-salt');
    setEncryptionKey(null);
    setIsPinSet(false);
    setIsLocked(false);
    
    return true;
  }, []);

  const lock = useCallback(() => {
    if (isPinSet) {
      setIsLocked(true);
      setEncryptionKey(null);
    }
  }, [isPinSet]);

  return (
    <AuthContext.Provider value={{
      isLocked,
      isPinSet,
      encryptionKey,
      unlock,
      setPin,
      changePin,
      removePin,
      lock,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
