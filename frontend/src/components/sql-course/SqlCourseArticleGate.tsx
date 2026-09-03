'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface SqlCourseArticleGateProps {
  isSqlCategory: boolean;
  children: React.ReactNode;
}

export const SqlCourseArticleGate: React.FC<SqlCourseArticleGateProps> = ({
  isSqlCategory,
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isLocked, setIsLocked] = useState(false);

  // Form State for inline registration / login
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check auth on mount
  useEffect(() => {
    if (!isSqlCategory) {
      setIsAuthenticated(true);
      return;
    }

    try {
      const user = localStorage.getItem('sql_course_user');
      if (user) {
        setIsAuthenticated(true);
        return;
      }
      setIsAuthenticated(false);
    } catch {
      setIsAuthenticated(false);
    }
  }, [isSqlCategory]);

  // 20-second preview timer for non-registered users
  useEffect(() => {
    if (!isSqlCategory || isAuthenticated === true || isAuthenticated === null) {
      return;
    }

    if (timeLeft <= 0) {
      setIsLocked(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsLocked(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSqlCategory, isAuthenticated, timeLeft]);

  // Handle inline registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Please set a password of at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/sql-course/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      const registeredUser = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        registrationId: data.registrationId || 'SF-SQL-0428',
        registeredAt: new Date().toISOString(),
        status: 'confirmed',
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('sql_course_user', JSON.stringify(registeredUser));
      }

      setIsAuthenticated(true);
      setIsLocked(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle inline login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter your registered email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/sql-course/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('sql_course_user', JSON.stringify(data.user));
      }

      setIsAuthenticated(true);
      setIsLocked(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not SQL category or already authenticated permanently
  if (!isSqlCategory || isAuthenticated === true) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* 20-Second Floating Preview Badge while active */}
      {!isLocked && timeLeft > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-fade-in">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-neutral-950/90 text-white border border-accent/40 shadow-2xl backdrop-blur-md text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>
              Free Preview: <strong className="font-mono text-accent">{timeLeft}s</strong> remaining
            </span>
            <button
              onClick={() => setIsLocked(true)}
              className="font-bold underline text-accent hover:text-accent-2 ml-1"
            >
              Register Free
            </button>
          </div>
        </div>
      )}

      {/* Render article content */}
      <div className={isLocked ? 'filter blur-md pointer-events-none select-none max-h-[400px] overflow-hidden' : ''}>
        {children}
      </div>

      {/* 20-Second Expiry Registration Modal Overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 pb-12 px-4 bg-background/60 backdrop-blur-md animate-fade-in">
          <div className="sticky top-24 w-full max-w-lg rounded-3xl border-2 border-accent/40 bg-card-bg/95 p-8 sm:p-10 shadow-2xl shadow-accent/15 backdrop-blur-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-accent-2 to-accent-3" />

            <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto mb-4 text-2xl">
              🎓
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/25 mb-2">
              Free SQL Course Access
            </span>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mb-2">
              Enjoying this SQL Lesson?
            </h2>

            <p className="text-xs sm:text-sm text-muted mb-6 leading-relaxed">
              Set a password and register for free to unlock this complete article and access all 9 placement syllabus levels.
            </p>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Mode Switcher */}
            <div className="flex border-b border-card-border mb-6">
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMessage(null); }}
                className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-all ${
                  mode === 'register' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                Register (Set Password)
              </button>
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(null); }}
                className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-all ${
                  mode === 'login' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                Already Registered? Log In
              </button>
            </div>

            {mode === 'register' ? (
              /* Inline Registration */
              <form onSubmit={handleRegister} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-card-bg border border-card-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-foreground placeholder:text-muted/60 text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-accent">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-card-bg border border-card-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-foreground placeholder:text-muted/60 text-sm transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                      Create Password <span className="text-accent">*</span>
                    </label>
                    <span className="text-[10px] text-muted">Min 6 chars</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-card-bg border border-card-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-foreground placeholder:text-muted/60 text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-accent to-accent-2 text-white font-bold text-sm shadow-lg shadow-accent/25 hover:scale-[1.02] active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Unlocking Article...</span>
                  ) : (
                    <>
                      <span>Set Password & Unlock Article</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Inline Login */
              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    Registered Email Address <span className="text-accent">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-card-bg border border-card-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-foreground placeholder:text-muted/60 text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    Password <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-card-bg border border-card-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-foreground placeholder:text-muted/60 text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-accent to-accent-2 text-white font-bold text-sm shadow-lg shadow-accent/25 hover:scale-[1.02] active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Verifying Access...</span>
                  ) : (
                    <>
                      <span>Log In & Continue Reading</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-card-border/50 text-xs text-muted">
              <Link href="/" className="hover:underline">
                ← Return to Home
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SqlCourseArticleGate;
