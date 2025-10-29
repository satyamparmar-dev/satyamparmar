// Simple encryption for premium user data
// This provides basic obfuscation - not military-grade security
// For a static site, this is a reasonable approach

const ENCRYPTION_KEY = 'premium-blog-key-2024';

export function encrypt(text: string): string {
  try {
    // Simple XOR encryption (not secure for sensitive data)
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(result); // Base64 encode
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
}

export function decrypt(encryptedText: string): string {
  try {
    const decoded = atob(encryptedText); // Base64 decode
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText;
  }
}

// Hash function for user verification
export function hashUserIdentifier(identifier: string): string {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}
