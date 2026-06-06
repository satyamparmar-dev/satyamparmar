import { useEffect } from 'react';

const APP_NAME = 'Satyverse';

/**
 * Sets document.title to "<title> — Satyverse" while the component is mounted.
 * Restores the previous title on unmount.
 * Pass an empty string while data is loading — the tab will show just "Satyverse"
 * and update once the real title is ready.
 */
export const usePageTitle = (title: string) => {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — ${APP_NAME}` : APP_NAME;
    return () => {
      document.title = prev;
    };
  }, [title]);
};
