'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Article } from '@/lib/types';
import { ArticleCard } from '@/components/ArticleCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CORE_SUBJECTS } from '@/lib/coreSubjectsData';

interface CoreSubjectsClientProps {
  initialArticles: Article[];
}

export default function CoreSubjectsClient({ initialArticles }: CoreSubjectsClientProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Articles across all core subjects
  const allCoreArticles = useMemo(() => {
    const list = initialArticles.filter((a) =>
      CORE_SUBJECTS.some((sub) => sub.match(a))
    );
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt?.toLowerCase().includes(q) ||
        a.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [initialArticles, searchQuery]);

  return (
    <>
      <Header />
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 mb-6 text-xs font-mono text-muted">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="text-muted/40">/</span>
          <span className="text-foreground font-semibold">Core Subjects</span>
        </div>

        {/* Hero Section */}
        <section className="mb-10 sm:mb-12 border-b border-card-border pb-8 sm:pb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              Curriculum &amp; Technical Interviews
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
            Core Engineering Subjects
          </h1>
          <p className="text-sm sm:text-base text-muted mt-2 max-w-2xl leading-relaxed">
            Select any subject below to open its dedicated notes, visual architecture breakdowns, state machines, and university exam guides.
          </p>

          {/* ── THE 3 CORE SUBJECT CARDS (Direct Links) ──────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {CORE_SUBJECTS.map((sub) => {
              const count = initialArticles.filter(sub.match).length;

              return (
                <Link
                  key={sub.id}
                  href={`/core-subjects/${sub.slug}`}
                  className="group p-6 rounded-2xl border border-card-border bg-card-bg/70 hover:bg-card-bg hover:border-foreground/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded border ${sub.badgeColor}`}>
                        {sub.code} &middot; {sub.badge}
                      </span>
                      <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-card-border/50 text-foreground/80 group-hover:bg-foreground group-hover:text-background transition-colors">
                        {count} {count === 1 ? 'Article' : 'Articles'}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold tracking-tight text-foreground group-hover:text-foreground transition-colors">
                      {sub.title}
                    </h2>
                    
                    <p className="text-xs sm:text-sm font-medium text-foreground/70 mt-1">
                      {sub.tagline}
                    </p>

                    <p className="text-xs text-muted mt-2.5 leading-relaxed line-clamp-3">
                      {sub.description}
                    </p>

                    {/* Topics preview */}
                    <div className="mt-4 pt-4 border-t border-card-border/60">
                      <div className="flex flex-wrap gap-1.5">
                        {sub.topics.slice(0, 3).map((topic, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-background border border-card-border text-muted font-medium"
                          >
                            {topic}
                          </span>
                        ))}
                        {sub.topics.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded text-muted">
                            +{sub.topics.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-6 border-t border-card-border/60 flex items-center justify-between text-xs font-semibold text-accent group-hover:underline">
                    <span>Open {sub.code} Guides</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── ALL CORE SUBJECT ARTICLES DIRECTORY ────────────────────────── */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>All Core Subject Guides</span>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-card-border/40 text-muted">
                  {allCoreArticles.length} Total
                </span>
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Browse all lecture notes across Computer Networks, Short Range Wireless, and Automata Theory
              </p>
            </div>

            {/* Search Filter */}
            <div className="w-full sm:w-72">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter all core subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-background border border-card-border rounded-xl pl-9 pr-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:border-foreground transition-colors shadow-xs"
                />
                <svg
                  className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {allCoreArticles.length === 0 ? (
            <div className="py-16 bg-card-bg border border-dashed border-card-border rounded-2xl text-center px-4">
              <p className="text-base font-semibold text-foreground">No core subject guides match your search</p>
              <p className="text-xs text-muted mt-1">Try clearing your search query to see all guides.</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCoreArticles.map((article, i) => (
                <ArticleCard key={article.id} article={article} index={i} />
              ))}
            </div>
          )}
        </section>

      </main>
      <Footer />
    </>
  );
}
