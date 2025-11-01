/**
 * Unit tests for premium content system (lib/premium.ts)
 * 
 * Priority: P0 (Critical)
 * Coverage Target: ≥95%
 * 
 * Note: These tests mock localStorage and browser APIs
 */

import {
  isPremiumUser,
  setPremiumUser,
  clearPremiumUser,
  getCurrentPremiumUser,
  canAccessContent,
  type PremiumUser,
} from '@/lib/premium';
import { hashUserIdentifier } from '@/lib/encryption';

// Mock localStorage before tests
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

const mockCookie = jest.fn();

beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks();
  
  // Setup localStorage mock
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  // Setup document.cookie mock
  Object.defineProperty(document, 'cookie', {
    get: () => '',
    set: mockCookie,
    configurable: true,
  });

  // Reset console.error to avoid noise in tests
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Premium Content System', () => {
  describe('isPremiumUser()', () => {
    it('should return true for valid premium user', () => {
      const email = 'test@example.com';
      const hash = hashUserIdentifier(email.toLowerCase());
      const premiumData = {
        hash,
        isActive: true,
        subscriptionType: 'premium',
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(premiumData));

      const result = isPremiumUser(email);
      expect(result).toBe(true);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('premium_user');
    });

    it('should return false for non-premium user', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = isPremiumUser('test@example.com');
      expect(result).toBe(false);
    });

    it('should return false when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = isPremiumUser('test@example.com');
      expect(result).toBe(false);
    });

    it('should return false for inactive premium user', () => {
      const email = 'test@example.com';
      const hash = hashUserIdentifier(email.toLowerCase());
      const premiumData = {
        hash,
        isActive: false, // Inactive
        subscriptionType: 'premium',
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(premiumData));

      const result = isPremiumUser(email);
      expect(result).toBe(false);
    });

    it('should handle invalid localStorage data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      const result = isPremiumUser('test@example.com');
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    it('should return false on server-side (SSR)', () => {
      // Simulate server-side environment
      Object.defineProperty(window, 'window', {
        value: undefined,
        writable: true,
      });

      const result = isPremiumUser('test@example.com');
      expect(result).toBe(false);
    });

    it('should match email case-insensitively', () => {
      const email = 'Test@Example.com';
      const hash = hashUserIdentifier(email.toLowerCase());
      const premiumData = {
        hash,
        isActive: true,
        subscriptionType: 'premium',
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(premiumData));

      const result1 = isPremiumUser('test@example.com');
      const result2 = isPremiumUser('TEST@EXAMPLE.COM');
      const result3 = isPremiumUser('Test@Example.com');

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
    });
  });

  describe('setPremiumUser()', () => {
    it('should store user data in localStorage', () => {
      const user: PremiumUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        subscriptionType: 'premium',
        startDate: '2025-01-01',
        isActive: true,
      };

      setPremiumUser(user);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'premium_user',
        expect.stringContaining('"isActive":true')
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'premium_user',
        expect.stringContaining('"subscriptionType":"premium"')
      );
    });

    it('should set cookie with correct expiration', () => {
      const user: PremiumUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        subscriptionType: 'premium',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        isActive: true,
      };

      setPremiumUser(user);

      expect(mockCookie).toHaveBeenCalled();
      expect(mockCookie.mock.calls[0][0]).toContain('premium_user=');
      expect(mockCookie.mock.calls[0][0]).toContain('expires=');
      expect(mockCookie.mock.calls[0][0]).toContain('path=/');
    });

    it('should hash email identifier', () => {
      const user: PremiumUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        subscriptionType: 'premium',
        startDate: '2025-01-01',
        isActive: true,
      };

      setPremiumUser(user);

      const storedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      const expectedHash = hashUserIdentifier(user.email.toLowerCase());
      expect(storedData.hash).toBe(expectedHash);
    });

    it('should handle localStorage errors', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const user: PremiumUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        subscriptionType: 'premium',
        startDate: '2025-01-01',
        isActive: true,
      };

      expect(() => setPremiumUser(user)).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should use default expiration if endDate is missing', () => {
      const user: PremiumUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        subscriptionType: 'premium',
        startDate: '2025-01-01',
        isActive: true,
      };

      setPremiumUser(user);

      expect(mockCookie).toHaveBeenCalled();
      expect(mockCookie.mock.calls[0][0]).toContain('expires=');
    });
  });

  describe('clearPremiumUser()', () => {
    it('should remove premium data from localStorage', () => {
      clearPremiumUser();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('premium_user');
    });

    it('should clear premium cookie', () => {
      clearPremiumUser();

      expect(mockCookie).toHaveBeenCalled();
      expect(mockCookie.mock.calls[0][0]).toContain('premium_user=;');
      expect(mockCookie.mock.calls[0][0]).toContain('expires=Thu, 01 Jan 1970');
    });
  });

  describe('getCurrentPremiumUser()', () => {
    it('should return premium user data when available', () => {
      const userData = {
        hash: 'abc123',
        isActive: true,
        subscriptionType: 'premium',
        name: 'Test User',
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(userData));

      const result = getCurrentPremiumUser();
      expect(result).toEqual(userData);
    });

    it('should return null when no premium data exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = getCurrentPremiumUser();
      expect(result).toBeNull();
    });

    it('should handle invalid JSON data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      const result = getCurrentPremiumUser();
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('canAccessContent()', () => {
    it('should allow premium user to access premium content', () => {
      const userData = {
        hash: 'abc123',
        isActive: true,
        subscriptionType: 'premium',
        endDate: '2025-12-31',
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(userData));

      const result = canAccessContent('premium');
      expect(result).toBe(true);
    });

    it('should allow VIP user to access premium content', () => {
      const userData = {
        hash: 'abc123',
        isActive: true,
        subscriptionType: 'vip',
        endDate: '2025-12-31',
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(userData));

      const result = canAccessContent('premium');
      expect(result).toBe(true);
    });

    it('should allow VIP user to access VIP content', () => {
      const userData = {
        hash: 'abc123',
        isActive: true,
        subscriptionType: 'vip',
        endDate: '2025-12-31',
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(userData));

      const result = canAccessContent('vip');
      expect(result).toBe(true);
    });

    it('should deny premium user access to VIP content', () => {
      const userData = {
        hash: 'abc123',
        isActive: true,
        subscriptionType: 'premium', // Not VIP
        endDate: '2025-12-31',
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(userData));

      const result = canAccessContent('vip');
      expect(result).toBe(false);
    });

    it('should deny access for expired subscriptions', () => {
      const userData = {
        hash: 'abc123',
        isActive: true,
        subscriptionType: 'premium',
        endDate: '2020-01-01', // Expired
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(userData));

      const result = canAccessContent('premium');
      expect(result).toBe(false);
    });

    it('should deny access for inactive users', () => {
      const userData = {
        hash: 'abc123',
        isActive: false,
        subscriptionType: 'premium',
        endDate: '2025-12-31',
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(userData));

      const result = canAccessContent('premium');
      expect(result).toBe(false);
    });

    it('should deny access when no user is logged in', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = canAccessContent('premium');
      expect(result).toBe(false);
    });
  });
});

