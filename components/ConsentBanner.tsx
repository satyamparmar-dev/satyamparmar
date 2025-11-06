"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "ga_consent";

type ConsentValue = "granted" | "denied";

function updateConsent(value: ConsentValue) {
  if (typeof window === "undefined" || !("gtag" in window)) return;
  // @ts-ignore
  window.gtag("consent", "update", { analytics_storage: value });
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ConsentValue | null;
      if (!saved) setVisible(true);
      else updateConsent(saved);
    } catch {}
  }, []);

  const accept = () => {
    try { localStorage.setItem(STORAGE_KEY, "granted"); } catch {}
    updateConsent("granted");
    setVisible(false);
  };

  const reject = () => {
    try { localStorage.setItem(STORAGE_KEY, "denied"); } catch {}
    updateConsent("denied");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-4 border-t border-gray-200 bg-white px-4 py-3 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <p className="text-gray-700 dark:text-gray-200">
        We use cookies for analytics to improve your experience. You can accept or reject analytics cookies.
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <button onClick={reject} className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">Reject</button>
        <button onClick={accept} className="rounded-md bg-sky-600 px-3 py-1.5 text-white hover:bg-sky-700">Accept</button>
      </div>
    </div>
  );
}
