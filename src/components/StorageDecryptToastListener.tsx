import React, { useEffect } from 'react';
import { STORAGE_DECRYPT_FAILED_EVENT } from '../auth/encryptedStorage';
import { useToast } from './ToastProvider';

/**
 * Shows a one-time-style warning when encryptedStorage clears a corrupt legacy blob.
 */
const StorageDecryptToastListener: React.FC = () => {
  const { showWarning } = useToast();

  useEffect(() => {
    const onFailed = () => {
      showWarning('Session expired. Please sign in again.');
    };
    window.addEventListener(STORAGE_DECRYPT_FAILED_EVENT, onFailed);
    return () => window.removeEventListener(STORAGE_DECRYPT_FAILED_EVENT, onFailed);
  }, [showWarning]);

  return null;
};

export default StorageDecryptToastListener;
