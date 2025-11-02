'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Download, Upload, RotateCcw, Lock, Unlock, AlertCircle } from 'lucide-react';
import {
  loadEncryptedConfig,
  saveEncryptedConfig,
  updateFeatures,
  resetToDefaultConfig,
  exportConfig,
  importConfig,
  type FeatureConfig
} from '@/lib/feature-config';

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<FeatureConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadedConfig = loadEncryptedConfig();
    setConfig(loadedConfig);
    setIsLoading(false);
  }, []);

  const handleToggle = (featureKey: keyof FeatureConfig['features']) => {
    if (!config) return;
    const updatedConfig = {
      ...config,
      features: {
        ...config.features,
        [featureKey]: !config.features[featureKey]
      },
      lastUpdated: new Date().toISOString()
    };
    setConfig(updatedConfig);
    saveEncryptedConfig(updatedConfig);
    showSavedMessage();
  };

  const handleSave = () => {
    if (!config) return;
    saveEncryptedConfig(config);
    showSavedMessage();
  };

  const showSavedMessage = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
      resetToDefaultConfig();
      const defaultConfig = loadEncryptedConfig();
      setConfig(defaultConfig);
      showSavedMessage();
    }
  };

  const handleExport = () => {
    const configJson = exportConfig();
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feature-config-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const success = importConfig(content);
        if (success) {
          const importedConfig = loadEncryptedConfig();
          setConfig(importedConfig);
          showSavedMessage();
          setError(null);
        } else {
          setError('Failed to import configuration. Please check the file format.');
        }
      } catch (err) {
        setError('Error reading file. Please try again.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  if (isLoading || !config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const features = [
    {
      key: 'premiumEnabled' as const,
      name: 'Premium Enabled',
      description: 'Enable premium content features',
      icon: Lock
    },
    {
      key: 'vipEnabled' as const,
      name: 'VIP Enabled',
      description: 'Enable VIP subscription tier',
      icon: Lock
    },
    {
      key: 'blogEnabled' as const,
      name: 'Blog Enabled',
      description: 'Enable blog functionality',
      icon: Unlock
    },
    {
      key: 'newsletterEnabled' as const,
      name: 'Newsletter Enabled',
      description: 'Enable newsletter subscriptions',
      icon: Unlock
    },
    {
      key: 'contactFormEnabled' as const,
      name: 'Contact Form Enabled',
      description: 'Enable contact form',
      icon: Unlock
    },
    {
      key: 'commentsEnabled' as const,
      name: 'Comments Enabled',
      description: 'Enable blog comments',
      icon: Unlock
    },
    {
      key: 'searchEnabled' as const,
      name: 'Search Enabled',
      description: 'Enable search functionality',
      icon: Unlock
    },
    {
      key: 'darkModeEnabled' as const,
      name: 'Dark Mode Enabled',
      description: 'Enable dark mode toggle',
      icon: Unlock
    },
    {
      key: 'analyticsEnabled' as const,
      name: 'Analytics Enabled',
      description: 'Enable analytics tracking',
      icon: Unlock
    }
  ];

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Settings className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Feature Settings
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Manage feature flags and access control settings. Changes are automatically saved and encrypted.
          </p>
        </div>

        {/* Success/Error Messages */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg flex items-center space-x-2"
          >
            <Save className="h-5 w-5" />
            <span>Settings saved successfully!</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg flex items-center space-x-2"
          >
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save All</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Config</span>
          </motion.button>

          <label className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>Import Config</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset to Default</span>
          </motion.button>
        </div>

        {/* Feature Flags */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Feature Flags
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Enable or disable specific features across the application
            </p>
          </div>

          <div className="p-6 space-y-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isEnabled = config.features[feature.key];
              return (
                <motion.div
                  key={feature.key}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${isEnabled ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <Icon className={`h-5 w-5 ${isEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {feature.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => handleToggle(feature.key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Additional Settings */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Access Control
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Premium Access Level
                </label>
                <select
                  value={config.features.premiumAccessLevel}
                  onChange={(e) => {
                    const updatedConfig = {
                      ...config,
                      features: {
                        ...config.features,
                        premiumAccessLevel: e.target.value as 'premium' | 'vip' | 'free'
                      },
                      lastUpdated: new Date().toISOString()
                    };
                    setConfig(updatedConfig);
                    saveEncryptedConfig(updatedConfig);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Config Info */}
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Version:</strong> {config.version} | 
            <strong> Last Updated:</strong> {new Date(config.lastUpdated).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
