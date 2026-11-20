'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;
    setStatus('loading');
    setMsg('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMsg(data.message ?? 'Subscribed to the dispatch!');
      } else {
        setStatus('error');
        setMsg(data.error ?? 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMsg('Network error. Please try again.');
    }
  };

  return (
    <footer className="border-t border-card-border bg-card-bg/40 text-muted py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand & Newsletter */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-foreground text-background flex items-center justify-center font-mono font-bold text-xs">
                SF
              </div>
              <span className="text-base font-bold text-foreground tracking-tight">
                SyntaxFlow
              </span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-muted max-w-sm mb-6">
              The all-in-one placement and engineering platform: coding round editorials, 100 FAANG problem tracker, self-paced SQL curriculum, and semester engineering guides.
            </p>

            {/* Newsletter form */}
            {status === 'success' ? (
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{msg}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} noValidate className="flex flex-col gap-2 max-w-sm">
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted">
                  The SyntaxFlow Dispatch
                </p>
                <div className="flex gap-2">
                  <input
                    id="footer-subscribe-email"
                    ref={inputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    required
                    disabled={status === 'loading'}
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg text-xs font-medium text-foreground bg-card-bg border border-card-border focus:border-foreground placeholder:text-muted/50 outline-none transition-colors disabled:opacity-60"
                  />
                  <button
                    id="footer-subscribe-btn"
                    type="submit"
                    disabled={status === 'loading' || !email}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-foreground text-background hover:opacity-90 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                  <p className="text-xs text-rose-500">{msg}</p>
                )}
                <p className="text-[11px] text-muted">Curated technical reading. No spam, ever.</p>
              </form>
            )}
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-foreground font-semibold text-xs tracking-wider uppercase mb-4 font-mono">
              Resources
            </h3>
            <ul className="text-xs space-y-2.5">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  All Articles
                </Link>
              </li>
              <li>
                <Link href="/dsa-sheet" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                  <span>100 FAANG DSA Sheet</span>
                </Link>
              </li>
              <li>
                <Link href="/sql-course" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                  <span>SQL Interview Mastery</span>
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-foreground transition-colors">
                  Search Archive
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & About Links */}
          <div>
            <h3 className="text-foreground font-semibold text-xs tracking-wider uppercase mb-4 font-mono">
              About &amp; Legal
            </h3>
            <ul className="text-xs space-y-2.5">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/syntaxflowarticles"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors text-accent pt-1"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <span>LinkedIn</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Colophon bottom bar */}
        <div className="border-t border-card-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© {currentYear} SyntaxFlow. Published for software engineers.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
