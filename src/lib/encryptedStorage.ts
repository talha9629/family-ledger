/**
 * Encrypted localStorage wrapper for financial data
 * Uses AES-GCM encryption with keys derived from user PIN
 */

import { encryptData, decryptData } from './crypto';

const ENCRYPTED_PREFIX = 'ENC:';

/**
 * Check if data is encrypted (has encryption prefix)
 */
export function isEncrypted(data: string): boolean {
  return data.startsWith(ENCRYPTED_PREFIX);
}

/**
 * Save data to localStorage, optionally encrypted
 * @param key - localStorage key
 * @param data - JSON string to store
 * @param encryptionKey - CryptoKey for encryption (null = store unencrypted)
 */
export async function saveEncrypted(
  key: string, 
  data: string, 
  encryptionKey: CryptoKey | null
): Promise<void> {
  if (encryptionKey) {
    const encrypted = await encryptData(data, encryptionKey);
    localStorage.setItem(key, ENCRYPTED_PREFIX + encrypted);
  } else {
    localStorage.setItem(key, data);
  }
}

/**
 * Load data from localStorage, decrypting if necessary
 * @param key - localStorage key
 * @param encryptionKey - CryptoKey for decryption (null = assume unencrypted)
 * @returns Decrypted JSON string, or null if decryption fails
 */
export async function loadEncrypted(
  key: string, 
  encryptionKey: CryptoKey | null
): Promise<string | null> {
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  
  if (isEncrypted(stored)) {
    if (!encryptionKey) {
      // Data is encrypted but no key provided - cannot decrypt
      return null;
    }
    const encryptedData = stored.slice(ENCRYPTED_PREFIX.length);
    return await decryptData(encryptedData, encryptionKey);
  }
  
  // Data is not encrypted, return as-is
  return stored;
}

/**
 * Migrate unencrypted data to encrypted format
 * Called when user first sets up a PIN
 * @param key - localStorage key
 * @param encryptionKey - CryptoKey to use for encryption
 * @returns true if migration successful
 */
export async function migrateToEncrypted(
  key: string, 
  encryptionKey: CryptoKey
): Promise<boolean> {
  const stored = localStorage.getItem(key);
  if (!stored || isEncrypted(stored)) {
    return true; // Nothing to migrate or already encrypted
  }
  
  try {
    const encrypted = await encryptData(stored, encryptionKey);
    localStorage.setItem(key, ENCRYPTED_PREFIX + encrypted);
    return true;
  } catch {
    return false;
  }
}

/**
 * Re-encrypt data with a new key (for PIN change)
 * @param key - localStorage key
 * @param oldKey - Old CryptoKey for decryption
 * @param newKey - New CryptoKey for encryption
 * @returns true if re-encryption successful
 */
export async function reEncrypt(
  key: string,
  oldKey: CryptoKey,
  newKey: CryptoKey
): Promise<boolean> {
  try {
    const decrypted = await loadEncrypted(key, oldKey);
    if (!decrypted) return false;
    
    await saveEncrypted(key, decrypted, newKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Decrypt and save as unencrypted (for PIN removal)
 * @param key - localStorage key
 * @param encryptionKey - CryptoKey for decryption
 * @returns true if migration successful
 */
export async function migrateToUnencrypted(
  key: string,
  encryptionKey: CryptoKey
): Promise<boolean> {
  const stored = localStorage.getItem(key);
  if (!stored || !isEncrypted(stored)) {
    return true; // Nothing to migrate or already unencrypted
  }
  
  try {
    const decrypted = await loadEncrypted(key, encryptionKey);
    if (!decrypted) return false;
    
    localStorage.setItem(key, decrypted);
    return true;
  } catch {
    return false;
  }
}
