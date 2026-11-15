'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setEmail('');
      setStatus('idle');
      setMessage('');
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message ?? 'Subscribed to the dispatch!');
      } else {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        isOpen ? 'bg-black/60 backdrop-blur-xs opacity-100' : 'bg-transparent opacity-0 pointer-events-none'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscribe-modal-title"
    >
      <div
        className={`relative w-full max-w-sm rounded-xl bg-card-bg border border-card-border p-6 shadow-xl transition-all duration-200 ${
          isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-2 opacity-0'
        }`}
      >
        {/* Header row */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-card-border">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-xs bg-foreground" />
            <span className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
              SyntaxFlow Dispatch
            </span>
          </div>
          <button
            id="subscribe-modal-close"
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-card-border/40 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {status === 'success' ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 id="subscribe-modal-title" className="text-base font-bold text-foreground">
              Subscription Confirmed
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              {message}
            </p>
            <button
              id="subscribe-modal-done"
              onClick={onClose}
              className="mt-2 w-full py-2 rounded-lg text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <div>
            <h2 id="subscribe-modal-title" className="text-lg font-bold text-foreground mb-1">
              Read Every Release
            </h2>
            <p className="text-xs text-muted leading-relaxed mb-5">
              Receive new systems guides, algorithm explanations, and technical reviews directly in your inbox. No promotions or spam.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-3">
              <div>
                <input
                  id="subscribe-email"
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@company.com"
                  required
                  disabled={status === 'loading'}
                  className="w-full px-3 py-2 rounded-lg text-xs font-medium bg-background border border-card-border focus:border-foreground text-foreground placeholder:text-muted/50 outline-none transition-colors"
                />
              </div>

              {status === 'error' && (
                <p className="text-xs text-rose-500 font-medium">
                  {message}
                </p>
              )}

              <button
                id="subscribe-submit"
                type="submit"
                disabled={status === 'loading' || !email}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-foreground text-background hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
              >
                {status === 'loading' ? 'Joining dispatch…' : 'Subscribe to Dispatch →'}
              </button>
            </form>

            <p className="mt-3 text-center text-[10px] text-muted">
              One-click unsubscribe at any time.
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
