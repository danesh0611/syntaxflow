'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail]     = useState('');
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Lifecycle */
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setEmail('');
      setStatus('idle');
      setMessage('');
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  /* Submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;
    setStatus('loading');
    setMessage('');
    try {
      const res  = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) { setStatus('success'); setMessage(data.message ?? 'Subscribed! 🚀'); }
      else        { setStatus('error');   setMessage(data.error  ?? 'Something went wrong.'); }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  if (!mounted) return null;

  return createPortal(
    /* Full-screen backdrop — rendered directly on document.body */
    <div
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{
        zIndex: 9999,
        background: `rgba(2,4,12,${isOpen ? 0.82 : 0})`,
        backdropFilter: `blur(${isOpen ? 16 : 0}px)`,
        WebkitBackdropFilter: `blur(${isOpen ? 16 : 0}px)`,
        transition: 'background 0.22s ease, backdrop-filter 0.22s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscribe-modal-title"
    >
      <div
        className="relative w-full max-w-sm"
        style={{
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          opacity: isOpen ? 1 : 0,
          transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease',
        }}
      >
        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            boxShadow: '0 24px 64px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.15)',
          }}
        >
          {/* Rainbow top line */}
          <div
            className="h-[3px] w-full"
            style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)' }}
          />

          <div className="p-7">
            {/* Row: icon + close */}
            <div className="flex items-start justify-between mb-5">
              {/* Icon pill */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  color: 'var(--accent)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }}
                />
                SyntaxFlow Newsletter
              </div>

              {/* Close button */}
              <button
                id="subscribe-modal-close"
                onClick={onClose}
                aria-label="Close"
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 active:scale-90 ml-2"
                style={{ color: 'var(--muted)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--card-border)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--foreground)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--muted)';
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {status === 'success' ? (
              /* Success */
              <div className="text-center py-3">
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p
                  id="subscribe-modal-title"
                  className="font-black text-lg mb-1"
                  style={{ color: 'var(--foreground)' }}
                >
                  You're in! 🎉
                </p>
                <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>
                  {message}
                </p>
                <button
                  id="subscribe-modal-done"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 active:scale-95"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                >
                  Done
                </button>
              </div>
            ) : (
              /* Form */
              <>
                <h2
                  id="subscribe-modal-title"
                  className="text-xl font-black tracking-tight mb-1"
                  style={{ color: 'var(--foreground)' }}
                >
                  Never miss an article
                </h2>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--muted)' }}>
                  Get notified for every new article — DSA, C++,
                  Python &amp; System Design. One email. No spam.
                </p>

                <form onSubmit={handleSubmit} noValidate className="space-y-3">
                  {/* Email input */}
                  <div className="relative">
                    <svg
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                      style={{ color: 'var(--muted)', opacity: 0.5 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input
                      id="subscribe-email"
                      ref={inputRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={status === 'loading'}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200 disabled:opacity-50"
                      style={{
                        background: 'var(--background)',
                        border: `1.5px solid ${status === 'error' ? 'rgba(239,68,68,0.5)' : 'var(--card-border)'}`,
                        color: 'var(--foreground)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)';
                        e.currentTarget.style.boxShadow  = '0 0 0 3px rgba(99,102,241,0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = status === 'error' ? 'rgba(239,68,68,0.5)' : 'var(--card-border)';
                        e.currentTarget.style.boxShadow  = 'none';
                      }}
                    />
                  </div>

                  {/* Error */}
                  {status === 'error' && (
                    <p className="text-xs flex items-center gap-1.5" style={{ color: '#f87171' }}>
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {message}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    id="subscribe-submit"
                    type="submit"
                    disabled={status === 'loading' || !email}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
                      boxShadow: email && status !== 'loading' ? '0 6px 20px -6px rgba(99,102,241,0.6)' : 'none',
                    }}
                  >
                    {status === 'loading' ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Subscribing…
                      </>
                    ) : (
                      'Subscribe →'
                    )}
                  </button>
                </form>

                <p
                  className="mt-3 text-center text-[11px]"
                  style={{ color: 'var(--muted)', opacity: 0.55 }}
                >
                  No spam · Unsubscribe anytime
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
