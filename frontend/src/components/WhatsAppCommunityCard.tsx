'use client';

import React from 'react';

export const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb9nkyB4Y9lqHPPzes3G';

export function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

interface WhatsAppCommunityCardProps {
  variant?: 'banner' | 'compact' | 'footer';
  className?: string;
}

export const WhatsAppCommunityCard: React.FC<WhatsAppCommunityCardProps> = ({
  variant = 'banner',
  className = '',
}) => {
  if (variant === 'compact') {
    return (
      <div
        className={`p-5 rounded-xl bg-card-bg border border-emerald-500/20 dark:border-emerald-500/30 hover:border-emerald-500/40 transition-all shadow-xs relative overflow-hidden ${className}`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Official WhatsApp Community
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground">
              Get Instant Tech &amp; Placement Updates
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Join our WhatsApp community for the latest tech updates, off-campus job openings, breaking tech news, and new tutorial releases.
            </p>
          </div>

          <a
            href={WHATSAPP_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xs hover:shadow transition-all flex-shrink-0 cursor-pointer active:scale-98"
          >
            <WhatsAppIcon className="w-4 h-4 fill-white" />
            <span>Join WhatsApp Community</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-[#25D366] text-white flex items-center justify-center flex-shrink-0">
            <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
          </div>
          <span className="text-xs font-bold text-foreground">
            SyntaxFlow WhatsApp Channel
          </span>
        </div>
        <p className="text-xs text-muted leading-relaxed mb-3">
          Get real-time job alerts, latest tech trends, breaking news, and site updates directly on your phone.
        </p>
        <a
          href={WHATSAPP_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
        >
          <span>Join Community Channel</span>
          <span>&rarr;</span>
        </a>
      </div>
    );
  }

  // Default 'banner' variant (ideal for Homepage)
  return (
    <section
      aria-label="Join our WhatsApp community"
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-card-bg via-card-bg to-emerald-500/5 border border-emerald-500/20 dark:border-emerald-500/30 p-6 sm:p-8 shadow-xs hover:border-emerald-500/40 transition-all ${className}`}
    >
      {/* Decorative background glow */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Community
            </span>
            <span className="text-xs font-mono text-muted hidden sm:inline">
              SyntaxFlow Broadcast Channel
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground tracking-tight leading-snug">
            Join Our WhatsApp Community
          </h2>

          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            Never miss an important update. Stay informed with direct, real-time alerts on your phone for tech developments, recruitment, and new learning resources.
          </p>

          {/* 4 Feature Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <div className="flex items-start gap-2 text-xs text-foreground/90 bg-card-bg/60 border border-card-border/80 rounded-lg p-2.5">
              <span className="text-emerald-500 font-bold">⚡</span>
              <div>
                <strong className="font-semibold text-foreground">Latest Tech Updates</strong>
                <p className="text-[11px] text-muted">Core engineering guides, architecture &amp; tools</p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-foreground/90 bg-card-bg/60 border border-card-border/80 rounded-lg p-2.5">
              <span className="text-emerald-500 font-bold">💼</span>
              <div>
                <strong className="font-semibold text-foreground">Job &amp; Placement Updates</strong>
                <p className="text-[11px] text-muted">Off-campus drives, tech internships &amp; FAANG roles</p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-foreground/90 bg-card-bg/60 border border-card-border/80 rounded-lg p-2.5">
              <span className="text-emerald-500 font-bold">📰</span>
              <div>
                <strong className="font-semibold text-foreground">New Tech News</strong>
                <p className="text-[11px] text-muted">Curated industry insights, AI news &amp; market shifts</p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-foreground/90 bg-card-bg/60 border border-card-border/80 rounded-lg p-2.5">
              <span className="text-emerald-500 font-bold">🚀</span>
              <div>
                <strong className="font-semibold text-foreground">Website Updates</strong>
                <p className="text-[11px] text-muted">100 FAANG solutions, SQL courses &amp; fresh tutorials</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-center gap-3 pt-2 lg:pt-0 flex-shrink-0">
          <a
            href={WHATSAPP_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-sm hover:shadow-md transition-all active:scale-98 w-full sm:w-auto text-center cursor-pointer"
          >
            <WhatsAppIcon className="w-5 h-5 fill-white" />
            <span>Join WhatsApp Community</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>

          <div className="flex items-center gap-2 text-[11px] text-muted">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Direct WhatsApp Channel &bull; Zero spam &bull; Free</span>
          </div>
        </div>
      </div>
    </section>
  );
};
