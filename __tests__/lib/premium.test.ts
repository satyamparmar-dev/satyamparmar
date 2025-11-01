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

// Create a mock localStorage that we can control
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  get length() {
    return Object.keys(mockLocalStorage.store).length;
  },
  key: jest.fn((index: number) => {
    const keys = Object.keys(mockLocalStorage.store);
    return keys[index] || null;
  }),
};

// Set up initial implementations
mockLocalStorage.getItem.mockImplementation((key: string) => {
  return mockLocalStorage.store[key] || null;
});
mockLocalStorage.setItem.mockImplementation((key: string, value: string) => {
  mockLocalStorage.store[key] = value.toString();
});
mockLocalStorage.removeItem.mockImplementation((key: string) => {
  delete mockLocalStorage.store[key];
});
mockLocalStorage.clear.mockImplementation(() => {
  mockLocalStorage.store = {};
});

beforeEach(() => {
  // Reset cookie value
  document.cookie = '';
  
  // Clear localStorage store
  mockLocalStorage.store = {};
  
  // Clear call history (but keep implementations)
  mockLocalStorage.getItem.mockClear();
  mockLocalStorage.setItem.mockClear();
  mockLocalStorage.removeItem.mockClear();
  mockLocalStorage.clear.mockClear();
  
  // Ensure implementations are correct (they should persist but ensure they're set)
  mockLocalStorage.getItem.mockImplementation((key: string) => {
    return mockLocalStorage.store[key] || null;
  });
  mockLocalStorage.setItem.mockImplementation((key: string, value: string) => {
    mockLocalStorage.store[key] = value.toString();
  });
  mockLocalStorage.removeItem.mockImplementation((key: string) => {
    delete mockLocalStorage.store[key];
  });
  mockLocalStorage.clear.mockImplementation(() => {
    mockLocalStorage.store = {};
  });

  // Override window.localStorage with our mock
  // Delete the old one first (if it exists) to allow redefinition
  try {
    delete (window as any).localStorage;
  } catch (e) {
    // Ignore if can't delete
  }
  
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
    configurable: true,
  });

  // Reset console.error to avoid noise in tests
  jest.spyOn(console, 'error').mockImplementation(() => {});
  
  // Don't call jest.clearAllMocks() as it might interfere with our localStorage mock
});

afterEach(() => {
  // Restore console.error spy only (don't restore localStorage mocks)
  const consoleErrorSpy = jest.spyOn(console, 'error');
  consoleErrorSpy.mockRestore();
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

      // Ensure getItem implementation is active BEFORE setting store value
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        return mockLocalStorage.store[key] || null;
      });

      // Set the value in the store
      mockLocalStorage.store['premium_user'] = JSON.stringify(premiumData);

      // Verify the mock is set up correctly
      expect(window.localStorage).toBe(mockLocalStorage);
      expect(mockLocalStorage.getItem('premium_user')).toBe(JSON.stringify(premiumData));

      const result = isPremiumUser(email);
      expect(result).toBe(true);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('premium_user');
    });

    it('should return false for non-premium user', () => {
      mockLocalStorage.store = {};

      const result = isPremiumUser('test@example.com');
      expect(result).toBe(false);
    });

    it('should return false when localStorage is empty', () => {
      mockLocalStorage.store = {};

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

      mockLocalStorage.store['premium_user'] = JSON.stringify(premiumData);

      const result = isPremiumUser(email);
      expect(result).toBe(false);
    });

    it('should handle invalid localStorage data', () => {
      mockLocalStorage.store['premium_user'] = 'invalid-json';

      const result = isPremiumUser('test@example.com');
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    it('should return false on server-side (SSR)', () => {
      // Simulate server-side environment - temporarily remove window
      const originalWindow = global.window;
      // @ts-ignore
      global.window = undefined;

      const result = isPremiumUser('test@example.com');
      expect(result).toBe(false);
      
      // Restore window
      global.window = originalWindow;
    });

    it('should match email case-insensitively', () => {
      const email = 'Test@Example.com';
      const hash = hashUserIdentifier(email.toLowerCase());
      const premiumData = {
        hash,
        isActive: true,
        subscriptionType: 'premium',
      };

      mockLocalStorage.store['premium_user'] = JSON.stringify(premiumData);

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
      document.cookie = ''; // Reset before test
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

      expect(document.cookie).toContain('premium_user=');
      expect(document.cookie).toContain('expires=');
      expect(document.cookie).toContain('path=/');
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

      expect(document.cookie).toContain('expires=');
    });
  });

  describe('clearPremiumUser()', () => {
    it('should remove premium data from localStorage', () => {
      clearPremiumUser();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('premium_user');
    });

    it('should clear premium cookie', () => {
      // Set initial cookie - our mock stores it
      document.cookie = 'premium_user=test';
      expect(document.cookie).toBe('premium_user=test');
      
      clearPremiumUser();

      // After clearing, cookie should be cleared
      expect(document.cookie).toContain('premium_user=;');
      expect(document.cookie).toContain('expires=Thu, 01 Jan 1970');
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

      mockLocalStorage.store['premium_user'] = JSON.stringify(userData);

      const result = getCurrentPremiumUser();
      expect(result).toEqual(userData);
    });

    it('should return null when no premium data exists', () => {
      mockLocalStorage.store = {};

      const result = getCurrentPremiumUser();
      expect(result).toBeNull();
    });

    it('should handle invalid JSON data', () => {
      mockLocalStorage.store['premium_user'] = 'invalid-json';

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

      mockLocalStorage.store['premium_user'] = JSON.stringify(userData);

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

      mockLocalStorage.store['premium_user'] = JSON.stringify(userData);

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

      mockLocalStorage.store['premium_user'] = JSON.stringify(userData);

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

      mockLocalStorage.store['premium_user'] = JSON.stringify(userData);

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

      mockLocalStorage.store['premium_user'] = JSON.stringify(userData);

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

      mockLocalStorage.store['premium_user'] = JSON.stringify(userData);

      const result = canAccessContent('premium');
      expect(result).toBe(false);
    });

    it('should deny access when no user is logged in', () => {
      mockLocalStorage.store = {};

      const result = canAccessContent('premium');
      expect(result).toBe(false);
    });
  });
});

