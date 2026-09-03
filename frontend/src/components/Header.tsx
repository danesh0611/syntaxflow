'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SubscribeModal } from '@/components/SubscribeModal';

export const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCourseParticipant, setIsCourseParticipant] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(currentTheme);
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    try {
      const user = localStorage.getItem('sql_course_user');
      if (user) {
        setIsCourseParticipant(true);
      }
    } catch {}
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'border-b border-card-border/60 bg-background/90 backdrop-blur-2xl shadow-xl shadow-black/5'
            : 'border-b border-transparent bg-background/40 backdrop-blur-md'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="relative flex items-baseline gap-0">
              <span className="text-xl sm:text-[1.35rem] font-black gradient-text tracking-tight">
                Syntax
              </span>
              <span className="text-xl sm:text-[1.35rem] font-black text-foreground tracking-tight">
                Flow
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-lg shadow-accent/60 flex-shrink-0" />
          </Link>

          {/* Desktop Navigation (>= 768px) */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-muted">
            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl hover:text-foreground hover:bg-card-border/30 transition-all duration-200"
            >
              Home
            </Link>
            <Link
              href="/#categories"
              className="px-3.5 py-2 rounded-xl hover:text-foreground hover:bg-card-border/30 transition-all duration-200"
            >
              Categories
            </Link>
            {isCourseParticipant ? (
              <Link
                href="/sql-course/dashboard"
                className="px-3.5 py-2 rounded-xl text-accent font-bold hover:bg-accent/10 transition-all duration-200 flex items-center gap-1.5"
              >
                <span>Dashboard</span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500 text-white leading-none">
                  Active
                </span>
              </Link>
            ) : (
              <Link
                href="/sql-course"
                className="px-3.5 py-2 rounded-xl text-accent font-bold hover:bg-accent/10 transition-all duration-200 flex items-center gap-1.5"
              >
                <span>SQL Course</span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-md bg-accent text-white leading-none">
                  Free
                </span>
              </Link>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 mx-0.5 rounded-xl text-muted hover:text-foreground hover:bg-card-border/30 active:scale-95 transition-all duration-200"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Subscribe button */}
            <button
              id="header-subscribe-btn"
              onClick={() => setSubscribeOpen(true)}
              className="p-2.5 rounded-xl text-muted hover:text-foreground hover:bg-card-border/30 active:scale-95 transition-all duration-200"
              aria-label="Subscribe to SyntaxFlow"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            <Link
              href="/search"
              className="ml-2 flex items-center gap-1.5 text-xs font-bold bg-accent text-white px-4 py-2 rounded-xl hover:bg-accent/90 active:scale-95 transition-all duration-200 shadow-lg shadow-accent/25"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </Link>
          </nav>

          {/* Mobile Actions Bar (< 768px) */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Search Icon Button */}
            <Link
              href="/search"
              className="p-2.5 rounded-xl text-muted hover:text-foreground active:scale-95 transition"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-muted hover:text-foreground active:scale-95 transition"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-muted hover:text-foreground bg-card-border/20 active:scale-95 transition ml-1"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-card-border/60 bg-background/98 backdrop-blur-3xl px-5 py-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl">
            <Link
              href="/"
              className="flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-foreground bg-card-bg/50 border border-card-border/50 hover:bg-card-border/30 transition"
            >
              <span>Home</span>
              <span className="text-xs text-muted">Explore</span>
            </Link>

            <Link
              href="/#categories"
              className="flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-foreground bg-card-bg/50 border border-card-border/50 hover:bg-card-border/30 transition"
            >
              <span>Categories</span>
              <span className="text-xs text-muted">All Topics</span>
            </Link>

            {isCourseParticipant ? (
              <Link
                href="/sql-course/dashboard"
                className="flex items-center justify-between px-4 py-3 rounded-xl font-bold text-accent bg-accent/10 border border-accent/25 hover:bg-accent/15 transition"
              >
                <span>Participant Dashboard</span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-emerald-500 text-white">
                  Active
                </span>
              </Link>
            ) : (
              <Link
                href="/sql-course"
                className="flex items-center justify-between px-4 py-3 rounded-xl font-bold text-accent bg-accent/10 border border-accent/25 hover:bg-accent/15 transition"
              >
                <span>SQL Course for Placements</span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-accent text-white">
                  Free
                </span>
              </Link>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSubscribeOpen(true);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-foreground bg-card-bg/50 border border-card-border/50 hover:bg-card-border/30 transition"
            >
              <span>Subscribe to Newsletter</span>
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        )}

        {/* Bottom subtle accent border on scroll */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)' }}
        />
      </header>

      {/* Subscribe Modal */}
      <SubscribeModal isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </>
  );
};
