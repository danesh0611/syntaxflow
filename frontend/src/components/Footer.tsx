'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail]     = useState('');
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg]         = useState('');
  const inputRef              = useRef<HTMLInputElement>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;
    setStatus('loading');
    setMsg('');
    try {
      const res  = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) { setStatus('success'); setMsg(data.message ?? 'Subscribed!'); }
      else        { setStatus('error');   setMsg(data.error ?? 'Something went wrong.'); }
    } catch {
      setStatus('error'); setMsg('Network error. Please try again.');
    }
  };

  return (
    <footer className="relative border-t border-card-border/50 bg-card-bg/5 text-muted py-14 mt-auto overflow-hidden">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.4) 30%, rgba(139,92,246,0.4) 70%, transparent 100%)' }}
      />

      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 blur-[80px] opacity-10 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-xl font-black gradient-text">Syntax</span>
              <span className="text-xl font-black text-foreground">Flow</span>
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-glow shadow-lg shadow-accent/50" />
            </div>
            <p className="text-sm leading-relaxed text-muted/80 max-w-sm mb-6">
              A modern publishing platform dedicated to in-depth technology guides,
              DSA walkthroughs, developer tutorials, and systems architecture insights.
            </p>

            {/* Newsletter inline form */}
            {status === 'success' ? (
              <div className="flex items-center gap-2.5 text-sm">
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}
                >
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-foreground font-semibold">{msg}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} noValidate className="flex flex-col gap-2 max-w-sm">
                <p className="text-xs font-bold text-muted/70 uppercase tracking-widest mb-1">Get Notified of New Articles</p>
                <div className="flex gap-2">
                  <input
                    id="footer-subscribe-email"
                    ref={inputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={status === 'loading'}
                    className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl text-sm font-medium text-foreground placeholder:text-muted/40 outline-none transition-all duration-200 disabled:opacity-60"
                    style={{
                      background: 'var(--card-bg)',
                      border: status === 'error' ? '1.5px solid rgba(239,68,68,0.5)' : '1.5px solid var(--card-border)',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = status === 'error' ? 'rgba(239,68,68,0.5)' : 'var(--card-border)'; }}
                  />
                  <button
                    id="footer-subscribe-btn"
                    type="submit"
                    disabled={status === 'loading' || !email}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-white flex-shrink-0 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 6px 20px -6px rgba(99,102,241,0.5)' }}
                  >
                    {status === 'loading' ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : 'Subscribe'}
                  </button>
                </div>
                {status === 'error' && (
                  <p className="text-xs text-red-400">{msg}</p>
                )}
                <p className="text-[11px] text-muted/50">No spam. Unsubscribe anytime.</p>
              </form>
            )}
          </div>

          {/* Links */}
          <div>
            <h3 className="text-foreground font-bold text-xs tracking-widest uppercase mb-5">Explore</h3>
            <ul className="text-sm space-y-3">
              <li>
                <Link href="/" className="hover:text-foreground hover:translate-x-1 inline-block transition-all duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-foreground hover:translate-x-1 inline-block transition-all duration-200">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-foreground hover:translate-x-1 inline-block transition-all duration-200">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-foreground font-bold text-xs tracking-widest uppercase mb-5">Connect</h3>
            <ul className="text-sm space-y-3">
              <li>
                <a
                  href="https://www.linkedin.com/in/chakradhar-danesh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-foreground hover:translate-x-1 transition-all duration-200"
                >
                  <svg className="w-4 h-4 text-muted/80 group-hover:text-[#0a66c2] fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-card-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-muted/60">
            © {currentYear} SyntaxFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <span className="text-muted/40 mr-2">Built with</span>
            <span className="inline-flex items-center gap-1.5 bg-card-bg border border-card-border/60 px-2.5 py-1 rounded-lg text-[10px] font-bold text-muted/70">
              Next.js
            </span>
            <span className="text-muted/40">·</span>
            <span className="inline-flex items-center gap-1.5 bg-card-bg border border-card-border/60 px-2.5 py-1 rounded-lg text-[10px] font-bold text-muted/70">
              Sanity
            </span>
            <span className="text-muted/40">·</span>
            <span className="inline-flex items-center gap-1.5 bg-card-bg border border-card-border/60 px-2.5 py-1 rounded-lg text-[10px] font-bold text-muted/70">
              Cloudflare
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
