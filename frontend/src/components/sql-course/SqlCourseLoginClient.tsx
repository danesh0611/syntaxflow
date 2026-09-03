'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const SqlCourseLoginClient: React.FC = () => {
  const router = useRouter();
  const [view, setView] = useState<'login' | 'forgot_request' | 'forgot_verify'>('login');

  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [notRegistered, setNotRegistered] = useState(false);

  // Handle Standard Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setNotRegistered(false);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid registered email address.');
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
        if (data.notRegistered) {
          setNotRegistered(true);
        }
        throw new Error(data.error || 'Login failed.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('sql_course_user', JSON.stringify(data.user));
      }

      router.push('/sql-course/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Forgot Password Request (Sends OTP email)
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/sql-course/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset code.');
      }

      setSuccessMessage(data.message || `A 6-digit reset code has been sent to ${email}.`);
      setView('forgot_verify');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reset Password with OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!otp.trim() || otp.trim().length < 4) {
      setErrorMessage('Please enter the 6-digit reset code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/sql-course/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('sql_course_user', JSON.stringify(data.user));
      }

      setSuccessMessage('Password reset successfully! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/sql-course/dashboard');
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password. Please check your code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Header />

      <main className="flex-1 flex items-center justify-center px-6 py-16 relative overflow-hidden">
        {/* Glow ambient background orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-accent/20 via-accent-2/15 to-accent-3/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="w-full max-w-md">
          {/* Card container */}
          <div className="rounded-3xl border border-card-border bg-card-bg/95 p-8 sm:p-10 shadow-2xl shadow-accent/5 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-accent-2 to-accent-3" />

            {/* View 1: Standard Login */}
            {view === 'login' && (
              <>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 text-2xl">
                    🔐
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                    Participant Portal
                  </h1>
                  <p className="text-xs sm:text-sm text-muted mt-2">
                    Enter your registered email and password to access your personalized course dashboard.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-medium">
                    <p>{errorMessage}</p>
                    {notRegistered && (
                      <div className="mt-3 pt-3 border-t border-rose-500/20">
                        <Link
                          href="/sql-course#register-section"
                          className="inline-flex items-center gap-1.5 font-bold text-accent hover:underline text-xs"
                        >
                          <span>👉 Not registered yet? Register free here</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label htmlFor="login-email" className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                      Registered Email Address <span className="text-accent">*</span>
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-card-bg border border-card-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-foreground placeholder:text-muted/60 text-sm transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="login-password" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                        Password <span className="text-accent">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => { setView('forgot_request'); setErrorMessage(null); setSuccessMessage(null); }}
                        className="text-xs font-semibold text-accent hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3.5 pr-12 rounded-xl bg-card-bg border border-card-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-foreground placeholder:text-muted/60 text-sm transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-foreground transition-colors"
                        title={showPassword ? 'Hide password' : 'Show password'}
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
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-accent via-accent-2 to-accent text-white font-bold text-sm sm:text-base shadow-xl shadow-accent/25 hover:shadow-accent/40 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Enter Course Dashboard</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-card-border text-center text-xs text-muted">
                  Haven&apos;t registered for the course yet?{' '}
                  <Link
                    href="/sql-course#register-section"
                    className="text-accent font-bold hover:underline ml-1"
                  >
                    Register for free
                  </Link>
                </div>
              </>
            )}

            {/* View 2: Forgot Password - Request OTP */}
            {view === 'forgot_request' && (
              <>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-2xl">
                    🔑
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-foreground">
                    Reset Password
                  </h1>
                  <p className="text-xs sm:text-sm text-muted mt-2">
                    Enter your registered email and we will send a 6-digit verification code to reset your password.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleRequestOtp} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                      Registered Email Address <span className="text-accent">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-card-bg border border-card-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-foreground placeholder:text-muted/60 text-sm transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-accent to-accent-2 text-white font-bold text-sm shadow-xl shadow-accent/25 hover:shadow-accent/40 active:scale-[0.99] disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Sending Code...</span>
                    ) : (
                      <>
                        <span>Send 6-Digit Reset Code</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-card-border text-center">
                  <button
                    type="button"
                    onClick={() => { setView('login'); setErrorMessage(null); }}
                    className="text-xs font-bold text-muted hover:text-foreground"
                  >
                    ← Back to Login
                  </button>
                </div>
              </>
            )}

            {/* View 3: Forgot Password - Verify OTP & Set New Password */}
            {view === 'forgot_verify' && (
              <>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-2xl">
                    📬
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-foreground">
                    Enter Verification Code
                  </h1>
                  <p className="text-xs sm:text-sm text-muted mt-2">
                    Enter the 6-digit code sent to <strong className="text-foreground">{email}</strong> and create your new password.
                  </p>
                </div>

                {successMessage && (
                  <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    {successMessage}
                  </div>
                )}

                {errorMessage && (
                  <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                      6-Digit Code <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 rounded-xl bg-card-bg border border-card-border focus:border-accent text-center text-xl font-mono tracking-widest text-foreground outline-none transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                        New Password <span className="text-accent">*</span>
                      </label>
                      <span className="text-[10px] text-muted">Min 6 chars</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-12 rounded-xl bg-card-bg border border-card-border focus:border-accent outline-none text-foreground text-sm transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-foreground"
                      >
                        {showNewPassword ? (
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
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-accent to-accent-2 text-white font-bold text-sm shadow-xl shadow-accent/25 hover:scale-[1.01] active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {isSubmitting ? (
                      <span>Resetting Password...</span>
                    ) : (
                      <>
                        <span>Reset Password & Login</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-card-border flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={isSubmitting}
                    className="font-bold text-accent hover:underline"
                  >
                    Resend Code
                  </button>
                  <button
                    type="button"
                    onClick={() => { setView('login'); setErrorMessage(null); }}
                    className="font-bold text-muted hover:text-foreground"
                  >
                    Back to Login
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SqlCourseLoginClient;
