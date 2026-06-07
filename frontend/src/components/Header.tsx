import React from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-card-border bg-background/70 backdrop-blur-md transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
            Syntax<span className="text-foreground font-semibold">Flow</span>
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse"></span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-semibold text-muted">
          <Link 
            href="/" 
            className="hover:text-foreground transition-colors duration-200"
          >
            Home
          </Link>
          <Link 
            href="/#categories" 
            className="hover:text-foreground transition-colors duration-200"
          >
            Categories
          </Link>
          <Link 
            href="/search" 
            className="flex items-center gap-1.5 hover:text-foreground transition-colors duration-200 bg-card-border/40 hover:bg-card-border/80 px-3 py-1.5 rounded-lg border border-card-border/50 text-xs"
          >
            <svg 
              className="w-3.5 h-3.5 text-muted" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </Link>
        </nav>
      </div>
    </header>
  );
};
