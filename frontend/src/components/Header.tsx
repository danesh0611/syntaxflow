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
  const [coreMenuOpen, setCoreMenuOpen] = useState(false);
  const [isCourseParticipant, setIsCourseParticipant] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuOpen(false);
    setCoreMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
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
    const isDark = nextTheme === 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (isDark) {
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
        className={`sticky top-0 z-50 w-full transition-all duration-200 ${
          scrolled
            ? 'border-b border-card-border bg-background/85 backdrop-blur-md shadow-xs'
            : 'border-b border-card-border/40 bg-background/70 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
          {/* Brand Logo - Engineering & Placement Hub */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-mono font-bold text-sm tracking-tighter shadow-xs group-hover:opacity-90 transition-opacity">
              SF
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-foreground tracking-tight">
                SyntaxFlow
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-muted border-l border-card-border pl-1.5 py-0.5">
                Tech &amp; Placements
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-muted">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                pathname === '/'
                  ? 'text-foreground bg-card-bg border border-card-border shadow-xs font-semibold'
                  : 'hover:text-foreground hover:bg-card-border/30'
              }`}
            >
              Articles
            </Link>
            <Link
              href="/#categories"
              className="px-3 py-1.5 rounded-lg hover:text-foreground hover:bg-card-border/30 transition-colors"
            >
              Topics
            </Link>

            {/* Core Subjects Link */}
            <Link
              href="/core-subjects"
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                pathname === '/core-subjects'
                  ? 'text-foreground bg-card-bg border border-card-border shadow-xs font-semibold'
                  : 'hover:text-foreground hover:bg-card-border/30'
              }`}
            >
              Core Subjects
            </Link>
            <Link
              href="/dsa-sheet"
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                pathname === '/dsa-sheet'
                  ? 'text-foreground bg-card-bg border border-card-border shadow-xs font-semibold'
                  : 'hover:text-foreground hover:bg-card-border/30'
              }`}
            >
              <span>DSA Sheet</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border border-card-border bg-card-bg text-muted-foreground">
                100
              </span>
            </Link>
            {isCourseParticipant ? (
              <Link
                href="/sql-course/dashboard"
                className="px-3 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-500/10 transition-colors flex items-center gap-1.5"
              >
                <span>SQL Dashboard</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </Link>
            ) : (
              <Link
                href="/sql-course"
                className="px-3 py-1.5 rounded-lg text-accent font-semibold hover:bg-accent/10 transition-colors flex items-center gap-1.5"
              >
                <span>SQL Course</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border border-accent/20 bg-accent/5 text-accent">
                  Free
                </span>
              </Link>
            )}

            <div className="w-px h-4 bg-card-border mx-1" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-card-border/40 transition-colors cursor-pointer"
              aria-label="Toggle dark mode"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Search Pill */}
            <Link
              href="/search"
              className="flex items-center gap-2 text-xs font-medium text-muted hover:text-foreground bg-card-bg border border-card-border hover:border-card-border-hover px-2.5 py-1.5 rounded-lg transition-colors ml-1"
            >
              <svg className="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search</span>
              <kbd className="hidden lg:inline-block font-mono text-[10px] text-muted border border-card-border rounded px-1">
                /
              </kbd>
            </Link>

            {/* Subscribe Button */}
            <button
              id="header-subscribe-btn"
              onClick={() => setSubscribeOpen(true)}
              className="ml-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-foreground text-background hover:opacity-90 active:scale-98 transition-all cursor-pointer"
            >
              Subscribe
            </button>
          </nav>

          {/* Mobile Actions Bar */}
          <div className="flex md:hidden items-center gap-1">
            <Link
              href="/search"
              className="p-2 rounded-lg text-muted hover:text-foreground transition-colors"
              aria-label="Search"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted hover:text-foreground transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-muted hover:text-foreground border border-card-border bg-card-bg transition-colors ml-1"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-card-border bg-background/95 backdrop-blur-xl px-4 py-4 space-y-2 animate-fade-in shadow-lg">
            <Link
              href="/"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-card-border/30 transition-colors"
            >
              <span>Articles</span>
              <span className="text-xs text-muted">Latest</span>
            </Link>

            <Link
              href="/#categories"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-card-border/30 transition-colors"
            >
              <span>Topics</span>
              <span className="text-xs text-muted">Browse</span>
            </Link>

            {/* Mobile Core Subjects */}
            <Link
              href="/core-subjects"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-card-border/30 transition-colors"
            >
              <span>Core Subjects</span>
              <span className="text-xs text-muted">SRW &amp; FLA &rarr;</span>
            </Link>

            <Link
              href="/dsa-sheet"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-card-border/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>DSA Sheet & Tracker</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border border-card-border bg-card-bg text-muted-foreground">
                  100
                </span>
              </div>
              <span className="text-xs text-muted">Practice</span>
            </Link>

            {isCourseParticipant ? (
              <Link
                href="/sql-course/dashboard"
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
              >
                <span>Participant Dashboard</span>
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                  Active
                </span>
              </Link>
            ) : (
              <Link
                href="/sql-course"
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-accent bg-accent/10 border border-accent/20"
              >
                <span>SQL Course for Placements</span>
                <span className="text-[10px] uppercase font-bold text-accent">
                  Free
                </span>
              </Link>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSubscribeOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-background bg-foreground mt-2 transition-opacity"
            >
              <span>Subscribe to Newsletter</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        )}
      </header>

      {/* Subscribe Modal */}
      <SubscribeModal isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </>
  );
};
