/**
 * Cryptographic utilities for encrypting/decrypting localStorage data
 * Uses Web Crypto API with AES-GCM encryption
 */

const SALT_KEY = 'finance-app-salt';
const IV_LENGTH = 12; // 96 bits for AES-GCM

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Store salt in localStorage (base64 encoded)
 */
export function storeSalt(salt: Uint8Array): void {
  localStorage.setItem(SALT_KEY, btoa(String.fromCharCode(...salt)));
}

/**
 * Retrieve salt from localStorage
 */
export function getSalt(): Uint8Array | null {
  const stored = localStorage.getItem(SALT_KEY);
  if (!stored) return null;
  try {
    const binary = atob(stored);
    return new Uint8Array([...binary].map(c => c.charCodeAt(0)));
  } catch {
    return null;
  }
}

/**
 * Derive an encryption key from a PIN using PBKDF2
 */
export async function deriveKeyFromPin(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const pinBuffer = encoder.encode(pin);
  
  // Import PIN as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    pinBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  // Derive AES-GCM key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-GCM
 */
export async function encryptData(data: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  );
  
  // Combine IV + encrypted data and encode as base64
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt data using AES-GCM
 */
export async function decryptData(encryptedData: string, key: CryptoKey): Promise<string | null> {
  try {
    const combined = new Uint8Array(
      [...atob(encryptedData)].map(c => c.charCodeAt(0))
    );
    
    const iv = combined.slice(0, IV_LENGTH);
    const data = combined.slice(IV_LENGTH);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

/**
 * Hash a PIN for verification (stored separately from encrypted data)
 */
export async function hashPin(pin: string, salt: Uint8Array): Promise<string> {
  const encoder = new TextEncoder();
  const data = new Uint8Array([...encoder.encode(pin), ...salt]);
  
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

/**
 * Verify a PIN against stored hash
 */
export async function verifyPin(pin: string, salt: Uint8Array, storedHash: string): Promise<boolean> {
  const computedHash = await hashPin(pin, salt);
  return computedHash === storedHash;
}
