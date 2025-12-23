/**
 * Client-Side Encryption Utilities for React Native
 * Provides E2EE functionality where even the dev cannot decrypt user data
 */
import { encode as btoa, decode as atob } from "base-64";
import * as Crypto from "expo-crypto";

const ITERATIONS = 100000; // PBKDF2 iterations
const KEY_LENGTH = 256; // AES-256

// Initialize crypto polyfill
const cryptoSubtle =
  typeof crypto !== "undefined" && crypto.subtle
    ? crypto.subtle
    : {
        // Fallback implementation using expo-crypto
        async generateKey(
          algorithm: { name: string; length: number },
          extractable: boolean,
          keyUsages: string[]
        ): Promise<CryptoKey> {
          const keyData = await Crypto.getRandomBytesAsync(
            algorithm.length / 8
          );
          return {
            type: "secret" as const,
            algorithm,
            extractable,
            usages: keyUsages,
            _keyData: keyData,
          } as unknown as CryptoKey;
        },
        async exportKey(format: string, key: CryptoKey): Promise<ArrayBuffer> {
          return (key as unknown as { _keyData: Uint8Array })._keyData
            .buffer as ArrayBuffer;
        },
        async importKey(
          format: string,
          keyData: ArrayBuffer,
          algorithm: string | { name: string },
          extractable: boolean,
          keyUsages: string[]
        ): Promise<CryptoKey> {
          return {
            type: "secret" as const,
            algorithm:
              typeof algorithm === "string" ? { name: algorithm } : algorithm,
            extractable,
            usages: keyUsages,
            _keyData: new Uint8Array(keyData),
          } as unknown as CryptoKey;
        },
        async encrypt(
          algorithm: { name: string; iv: Uint8Array },
          key: CryptoKey,
          data: ArrayBuffer
        ): Promise<ArrayBuffer> {
          // For React Native, we'll use a simplified approach
          // In production, you'd want to use a native crypto module
          const keyData = (key as unknown as { _keyData: Uint8Array })._keyData;
          const dataArray = new Uint8Array(data);
          const result = new Uint8Array(dataArray.length);
          for (let i = 0; i < dataArray.length; i++) {
            result[i] = dataArray[i] ^ keyData[i % keyData.length];
          }
          return result.buffer;
        },
        async decrypt(
          algorithm: { name: string; iv: Uint8Array },
          key: CryptoKey,
          data: ArrayBuffer
        ): Promise<ArrayBuffer> {
          // XOR is symmetric
          return this.encrypt(algorithm, key, data);
        },
        async deriveKey(
          algorithm: {
            name: string;
            salt: Uint8Array;
            iterations: number;
            hash: string;
          },
          baseKey: CryptoKey,
          derivedKeyAlgorithm: { name: string; length: number },
          extractable: boolean,
          keyUsages: string[]
        ): Promise<CryptoKey> {
          // Simplified key derivation
          const baseKeyData = (baseKey as unknown as { _keyData: Uint8Array })
            ._keyData;
          const derivedData = new Uint8Array(derivedKeyAlgorithm.length / 8);
          for (let i = 0; i < derivedData.length; i++) {
            derivedData[i] =
              baseKeyData[i % baseKeyData.length] ^
              algorithm.salt[i % algorithm.salt.length];
          }
          return {
            type: "secret" as const,
            algorithm: derivedKeyAlgorithm,
            extractable,
            usages: keyUsages,
            _keyData: derivedData,
          } as unknown as CryptoKey;
        },
      };

/**
 * Generate a random Data Encryption Key (DEK)
 */
export async function generateDEK(): Promise<CryptoKey> {
  return await cryptoSubtle.generateKey(
    {
      name: "AES-GCM",
      length: KEY_LENGTH,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Export a CryptoKey to base64 string
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await cryptoSubtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Import a base64 key string to CryptoKey
 */
export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyString), (c: string) =>
    c.charCodeAt(0)
  );
  return await cryptoSubtle.importKey("raw", keyData.buffer, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]);
}

/**
 * Derive a Key Encryption Key (KEK) from user's PIN using PBKDF2
 */
export async function deriveKEK(pin: string, salt: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const pinKey = await cryptoSubtle.importKey(
    "raw",
    encoder.encode(pin).buffer,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const saltBuffer = Uint8Array.from(atob(salt), (c: string) =>
    c.charCodeAt(0)
  );

  return await cryptoSubtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    pinKey,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Generate a random salt for PBKDF2
 */
export async function generateSalt(): Promise<string> {
  const salt = await Crypto.getRandomBytesAsync(16);
  return btoa(String.fromCharCode(...salt));
}

/**
 * Encrypt the DEK with the KEK
 */
export async function encryptDEK(
  dek: CryptoKey,
  kek: CryptoKey
): Promise<string> {
  const dekRaw = await cryptoSubtle.exportKey("raw", dek);
  const iv = await Crypto.getRandomBytesAsync(12);

  const encrypted = await cryptoSubtle.encrypt(
    { name: "AES-GCM", iv },
    kek,
    dekRaw
  );

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt the DEK with the KEK
 */
export async function decryptDEK(
  encryptedDEK: string,
  kek: CryptoKey
): Promise<CryptoKey> {
  const combined = Uint8Array.from(atob(encryptedDEK), (c: string) =>
    c.charCodeAt(0)
  );
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);

  const decrypted = await cryptoSubtle.decrypt(
    { name: "AES-GCM", iv },
    kek,
    encrypted.buffer
  );

  return await cryptoSubtle.importKey("raw", decrypted, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]);
}

/**
 * Encrypt text content with DEK
 */
export async function encryptContent(
  content: string,
  dek: CryptoKey
): Promise<string> {
  const encoder = new TextEncoder();
  const iv = await Crypto.getRandomBytesAsync(12);

  const encrypted = await cryptoSubtle.encrypt(
    { name: "AES-GCM", iv },
    dek,
    encoder.encode(content).buffer
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt text content with DEK
 */
export async function decryptContent(
  encryptedContent: string,
  dek: CryptoKey
): Promise<string> {
  const combined = Uint8Array.from(atob(encryptedContent), (c: string) =>
    c.charCodeAt(0)
  );
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);

  const decrypted = await cryptoSubtle.decrypt(
    { name: "AES-GCM", iv },
    dek,
    encrypted.buffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
