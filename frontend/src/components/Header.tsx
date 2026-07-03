'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

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

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? 'border-b border-card-border/60 bg-background/85 backdrop-blur-2xl shadow-xl shadow-accent/5'
          : 'border-b border-transparent bg-background/30 backdrop-blur-md'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex items-baseline gap-0">
            <span className="text-[1.35rem] font-black gradient-text tracking-tight">
              Syntax
            </span>
            <span className="text-[1.35rem] font-black text-foreground tracking-tight">
              Flow
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse-glow shadow-lg shadow-accent/60 flex-shrink-0" />
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-0.5 text-sm font-semibold text-muted">
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
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 mx-1 rounded-xl text-muted hover:text-foreground hover:bg-card-border/30 active:scale-95 transition-all duration-200"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <svg className="w-4.5 h-4.5 animate-fade-in" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : theme === 'light' ? (
              <svg className="w-4.5 h-4.5 animate-fade-in" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <div className="w-4.5 h-4.5" />
            )}
          </button>

          <Link
            href="/search"
            className="ml-2 flex items-center gap-1.5 text-xs font-bold bg-accent text-white px-4 py-2 rounded-xl hover:bg-accent/90 active:scale-95 transition-all duration-200 shadow-lg shadow-accent/30"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </Link>
        </nav>
      </div>

      {/* Gradient line when scrolled */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)' }}
      />
    </header>
  );
};
