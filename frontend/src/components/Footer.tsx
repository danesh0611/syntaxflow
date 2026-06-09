import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-card-border/50 bg-card-bg/5 text-muted py-14 mt-auto overflow-hidden">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.4) 30%, rgba(139,92,246,0.4) 70%, transparent 100%)' }}
      />

      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 blur-[80px] opacity-10 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-xl font-black gradient-text">Syntax</span>
              <span className="text-xl font-black text-foreground">Flow</span>
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-glow shadow-lg shadow-accent/50" />
            </div>
            <p className="text-sm leading-relaxed text-muted/80 max-w-sm">
              A modern publishing platform dedicated to in-depth technology guides,
              DSA walkthroughs, developer tutorials, and systems architecture insights.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-foreground font-bold text-xs tracking-widest uppercase mb-5">Explore</h3>
            <ul className="text-sm space-y-3">
              <li>
                <Link href="/" className="hover:text-foreground hover:translate-x-1 inline-block transition-all duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-foreground hover:translate-x-1 inline-block transition-all duration-200">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-foreground hover:translate-x-1 inline-block transition-all duration-200">
                  Search
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-card-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-muted/60">
            © {currentYear} SyntaxFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <span className="text-muted/40 mr-2">Built with</span>
            <span className="inline-flex items-center gap-1.5 bg-card-bg border border-card-border/60 px-2.5 py-1 rounded-lg text-[10px] font-bold text-muted/70">
              Next.js
            </span>
            <span className="text-muted/40">·</span>
            <span className="inline-flex items-center gap-1.5 bg-card-bg border border-card-border/60 px-2.5 py-1 rounded-lg text-[10px] font-bold text-muted/70">
              Sanity
            </span>
            <span className="text-muted/40">·</span>
            <span className="inline-flex items-center gap-1.5 bg-card-bg border border-card-border/60 px-2.5 py-1 rounded-lg text-[10px] font-bold text-muted/70">
              Cloudflare
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
