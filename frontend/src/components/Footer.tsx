import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-card-border bg-card-bg/10 text-muted py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Syntax<span className="text-foreground font-semibold">Flow</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted/80">
              SyntaxFlow is a modern publishing platform dedicated to in-depth technology guides, deep-dives, developer tutorials, and systems architecture insights.
            </p>
          </div>
          <div>
            <h3 className="text-foreground font-semibold text-sm tracking-wider uppercase mb-4">Explore</h3>
            <ul className="text-sm space-y-2.5">
              <li><Link href="/" className="hover:text-foreground transition-colors duration-200">Home</Link></li>
              <li><Link href="/#categories" className="hover:text-foreground transition-colors duration-200">Categories</Link></li>
              <li><Link href="/search" className="hover:text-foreground transition-colors duration-200">Search</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-card-border/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-muted/65">&copy; {currentYear} SyntaxFlow. All rights reserved.</p>
          <div className="flex gap-4 text-muted/65">
            <span className="hover:text-foreground cursor-pointer transition">Terms</span>
            <span className="hover:text-foreground cursor-pointer transition">Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
