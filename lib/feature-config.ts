// Feature configuration management with encryption
import { encrypt, decrypt } from './encryption';

export interface FeatureConfig {
  features: {
    premiumEnabled: boolean;
    premiumAccessLevel: 'premium' | 'vip' | 'free';
    vipEnabled: boolean;
    blogEnabled: boolean;
    contactFormEnabled: boolean;
    commentsEnabled: boolean;
    searchEnabled: boolean;
    darkModeEnabled: boolean;
    analyticsEnabled: boolean;
  };
  accessControl: {
    premiumRequired: string[];
    vipRequired: string[];
    freeAccess: string[];
  };
  subscriptionSettings: {
    trialDays: number;
    autoRenewEnabled: boolean;
    paymentMethods: string[];
    currency: string;
  };
  lastUpdated: string;
  version: string;
}

// Default configuration
export const DEFAULT_CONFIG: FeatureConfig = {
  features: {
    premiumEnabled: true,
    premiumAccessLevel: 'premium',
    vipEnabled: true,
    blogEnabled: true,
    contactFormEnabled: true,
    commentsEnabled: false,
    searchEnabled: true,
    darkModeEnabled: true,
    analyticsEnabled: true
  },
  accessControl: {
    premiumRequired: ['premium-content', 'advanced-tutorials', 'exclusive-resources'],
    vipRequired: ['enterprise-content', 'private-forums', 'direct-support'],
    freeAccess: ['basic-blog', 'public-docs', 'community-resources']
  },
  subscriptionSettings: {
    trialDays: 7,
    autoRenewEnabled: true,
    paymentMethods: ['card', 'paypal'],
    currency: 'USD'
  },
  lastUpdated: new Date().toISOString(),
  version: '1.0.0'
};

// Store encrypted config in localStorage
export function saveEncryptedConfig(config: FeatureConfig): void {
  if (typeof window === 'undefined') return;
  
  try {
    const jsonString = JSON.stringify(config);
    const encrypted = encrypt(jsonString);
    localStorage.setItem('feature_config_enc', encrypted);
    localStorage.setItem('feature_config_version', config.version);
  } catch (error) {
    console.error('Error saving encrypted config:', error);
  }
}

// Load and decrypt config from localStorage
export function loadEncryptedConfig(): FeatureConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  
  try {
    const encrypted = localStorage.getItem('feature_config_enc');
    if (!encrypted) {
      // Initialize with default config
      saveEncryptedConfig(DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }
    
    const decrypted = decrypt(encrypted);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Error loading encrypted config:', error);
    return DEFAULT_CONFIG;
  }
}

// Type for boolean-only features (excludes premiumAccessLevel which is a string)
type BooleanFeatureKey = Exclude<keyof FeatureConfig['features'], 'premiumAccessLevel'>;

// Get a specific feature flag
export function isFeatureEnabled(featureName: BooleanFeatureKey): boolean {
  const config = loadEncryptedConfig();
  return config.features[featureName] as boolean;
}

// Update a specific feature
export function updateFeature(featureName: BooleanFeatureKey, enabled: boolean): void {
  const config = loadEncryptedConfig();
  config.features[featureName] = enabled;
  config.lastUpdated = new Date().toISOString();
  saveEncryptedConfig(config);
}

// Update multiple features at once
export function updateFeatures(features: Partial<FeatureConfig['features']>): void {
  const config = loadEncryptedConfig();
  config.features = { ...config.features, ...features };
  config.lastUpdated = new Date().toISOString();
  saveEncryptedConfig(config);
}

// Check if content requires premium access
export function requiresPremiumAccess(contentSlug: string): boolean {
  const config = loadEncryptedConfig();
  return config.accessControl.premiumRequired.includes(contentSlug);
}

// Check if content requires VIP access
export function requiresVipAccess(contentSlug: string): boolean {
  const config = loadEncryptedConfig();
  return config.accessControl.vipRequired.includes(contentSlug);
}

// Check if content is free
export function isFreeContent(contentSlug: string): boolean {
  const config = loadEncryptedConfig();
  return config.accessControl.freeAccess.includes(contentSlug);
}

// Reset to default configuration
export function resetToDefaultConfig(): void {
  saveEncryptedConfig(DEFAULT_CONFIG);
}

// Export configuration for backup
export function exportConfig(): string {
  const config = loadEncryptedConfig();
  return JSON.stringify(config, null, 2);
}

// Import configuration from JSON string
export function importConfig(jsonString: string): boolean {
  try {
    const config = JSON.parse(jsonString) as FeatureConfig;
    config.lastUpdated = new Date().toISOString();
    saveEncryptedConfig(config);
    return true;
  } catch (error) {
    console.error('Error importing config:', error);
    return false;
  }
}
