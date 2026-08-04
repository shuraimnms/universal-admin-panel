import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.CROSSREF_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || 'fallback-encryption-key-12345';

export function encrypt(text: string): string {
  if (!text) return text;
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

export function decrypt(cipherText: string): string {
  if (!cipherText) return cipherText;
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Failed to decrypt:', error);
    return cipherText;
  }
}
