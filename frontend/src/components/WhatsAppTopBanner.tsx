'use client';

import React, { useState, useEffect } from 'react';
import { WHATSAPP_CHANNEL_URL, WhatsAppIcon } from './WhatsAppCommunityCard';

export const WhatsAppTopBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem('sf_wa_banner_dismissed');
      if (!isDismissed) {
        setDismissed(false);
      }
    } catch {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('sf_wa_banner_dismissed', '1');
    } catch {}
  };

  if (dismissed) return null;

  return (
    <aside
      aria-label="WhatsApp Community Announcement"
      className="bg-emerald-600 text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 relative z-50 border-b border-emerald-700/40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
          </span>
          <p className="truncate font-medium">
            <span className="font-bold">WhatsApp Community:</span>{' '}
            <span className="opacity-95">
              Join for latest tech updates, job alerts, new tech news &amp; website releases!
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={WHATSAPP_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-0.5 rounded-full bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-[11px] transition-colors flex items-center gap-1 shadow-2xs"
          >
            <span>Join Now</span>
            <span aria-hidden="true">&rarr;</span>
          </a>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};
