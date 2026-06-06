import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  isContentProtectionEnabled,
  CONTENT_PROTECTED_CLASS,
  isCopyAllowedTarget,
} from '../utils/contentProtection';

/**
 * Deters casual copy, print, and in-tab capture. OS screenshots and DevTools cannot be fully blocked on the web.
 */
const ContentProtection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const enabled = isContentProtectionEnabled();
  const [shieldVisible, setShieldVisible] = useState(false);

  const hideShield = useCallback(() => setShieldVisible(false), []);
  const showShield = useCallback(() => {
    if (document.visibilityState === 'hidden') {
      setShieldVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add(CONTENT_PROTECTED_CLASS);

    const onCopy = (e: ClipboardEvent) => {
      if (!isCopyAllowedTarget(e.target)) e.preventDefault();
    };
    const onCut = (e: ClipboardEvent) => {
      if (!isCopyAllowedTarget(e.target)) e.preventDefault();
    };
    const onContextMenu = (e: MouseEvent) => {
      if (!isCopyAllowedTarget(e.target)) e.preventDefault();
    };
    const onDragStart = (e: DragEvent) => {
      if (!isCopyAllowedTarget(e.target)) e.preventDefault();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (isCopyAllowedTarget(e.target)) return;

      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;

      if (mod && ['c', 'x', 's', 'p', 'u', 'a'].includes(key)) {
        e.preventDefault();
        return;
      }
      if (mod && e.shiftKey && ['i', 'j', 'c'].includes(key)) {
        e.preventDefault();
        return;
      }
      if (key === 'f12' || (e.ctrlKey && e.shiftKey && key === 'c')) {
        e.preventDefault();
      }
      if (key === 'printscreen') {
        showShield();
        e.preventDefault();
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') showShield();
      else hideShield();
    };

    const onBlur = () => showShield();
    const onFocus = () => hideShield();

    document.addEventListener('copy', onCopy);
    document.addEventListener('cut', onCut);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);

    return () => {
      document.documentElement.classList.remove(CONTENT_PROTECTED_CLASS);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('cut', onCut);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [enabled, hideShield, showShield]);

  return (
    <>
      {children}
      {enabled && shieldVisible && (
        <Box
          role="presentation"
          aria-hidden
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 20000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            bgcolor: 'background.default',
            backgroundImage: (t) =>
              t.palette.mode === 'dark'
                ? 'radial-gradient(circle at 50% 40%, rgba(102,126,234,0.12), transparent 55%)'
                : 'radial-gradient(circle at 50% 40%, rgba(102,126,234,0.08), transparent 55%)',
            pointerEvents: 'auto',
            userSelect: 'none',
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.9 }} />
          <Typography variant="h6" fontWeight={700}>
            Content hidden
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={320}>
            Return to this tab to continue learning. Copying and screenshots are restricted on this app.
          </Typography>
        </Box>
      )}
    </>
  );
};

export default ContentProtection;
