/**
 * Unit tests for encryption utilities (lib/encryption.ts)
 * 
 * Priority: P1 (High)
 * Coverage Target: ≥85%
 */

import { encrypt, decrypt, hashUserIdentifier } from '@/lib/encryption';

describe('Encryption Utilities', () => {
  describe('encrypt()', () => {
    it('should encrypt text correctly', () => {
      const text = 'test-email@example.com';
      const encrypted = encrypt(text);
      
      expect(encrypted).not.toBe(text);
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should return Base64 encoded string', () => {
      const text = 'test';
      const encrypted = encrypt(text);
      
      // Base64 strings are alphanumeric with +, /, and = padding
      expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    it('should handle empty strings', () => {
      const encrypted = encrypt('');
      expect(typeof encrypted).toBe('string');
    });

    it('should handle special characters', () => {
      const text = 'test@example.com#2025$%';
      const encrypted = encrypt(text);
      
      expect(encrypted).not.toBe(text);
      expect(typeof encrypted).toBe('string');
    });

    it('should handle encryption errors gracefully', () => {
      // Mock btoa to throw error
      const originalBtoa = global.btoa;
      global.btoa = jest.fn(() => {
        throw new Error('Encoding error');
      });

      const result = encrypt('test');
      expect(result).toBe('test'); // Should return original on error
      expect(console.error).toHaveBeenCalled();

      // Restore
      global.btoa = originalBtoa;
    });
  });

  describe('decrypt()', () => {
    it('should decrypt encrypted text correctly', () => {
      const text = 'test-email@example.com';
      const encrypted = encrypt(text);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(text);
    });

    it('should reverse encryption', () => {
      const originalText = 'Hello World!';
      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(originalText);
    });

    it('should handle invalid encrypted strings', () => {
      const invalidEncrypted = 'not-valid-base64!!!';
      
      // Mock atob to throw error
      const originalAtob = global.atob;
      global.atob = jest.fn(() => {
        throw new Error('Invalid base64');
      });

      const result = decrypt(invalidEncrypted);
      expect(result).toBe(invalidEncrypted); // Should return original on error
      expect(console.error).toHaveBeenCalled();

      // Restore
      global.atob = originalAtob;
    });

    it('should handle decryption errors gracefully', () => {
      const invalidEncrypted = 'invalid';
      
      // Mock atob to return invalid string
      const originalAtob = global.atob;
      global.atob = jest.fn(() => 'invalid');

      // Decryption should still work (XOR is symmetric)
      const result = decrypt(invalidEncrypted);
      expect(typeof result).toBe('string');

      // Restore
      global.atob = originalAtob;
    });

    it('should handle empty strings', () => {
      const encrypted = encrypt('');
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe('');
    });

    it('should maintain data integrity', () => {
      const testCases = [
        'simple',
        'email@example.com',
        'Hello World 123',
        'Special!@#$%^&*()',
        'Unicode: 你好世界',
      ];

      testCases.forEach(text => {
        const encrypted = encrypt(text);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(text);
      });
    });
  });

  describe('hashUserIdentifier()', () => {
    it('should generate consistent hash for same input', () => {
      const identifier = 'test@example.com';
      const hash1 = hashUserIdentifier(identifier);
      const hash2 = hashUserIdentifier(identifier);
      
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = hashUserIdentifier('test1@example.com');
      const hash2 = hashUserIdentifier('test2@example.com');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty strings', () => {
      const hash = hashUserIdentifier('');
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should handle special characters', () => {
      const hash = hashUserIdentifier('test@example.com#2025');
      expect(typeof hash).toBe('string');
      expect(hash).toMatch(/^[a-z0-9]+$/); // Base36 (alphanumeric lowercase)
    });

    it('should return alphanumeric string', () => {
      const hash = hashUserIdentifier('test@example.com');
      expect(hash).toMatch(/^[a-z0-9]+$/); // Base36 encoding
    });

    it('should be case-sensitive for input', () => {
      const hash1 = hashUserIdentifier('Test@Example.com');
      const hash2 = hashUserIdentifier('test@example.com');
      
      // Case should affect hash
      expect(hash1).not.toBe(hash2);
    });

    it('should handle long identifiers', () => {
      const longIdentifier = 'a'.repeat(1000);
      const hash = hashUserIdentifier(longIdentifier);
      
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });
  });
});

