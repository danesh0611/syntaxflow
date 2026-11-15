'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Article, Category } from '@/lib/types';
import { ArticleCard } from '@/components/ArticleCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface ArticlesDirectoryClientProps {
  initialArticles: Article[];
  initialCategories: Category[];
}

export default function ArticlesDirectoryClient({
  initialArticles,
  initialCategories,
}: ArticlesDirectoryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [directoryViewMode, setDirectoryViewMode] = useState<'grid' | 'compact'>('grid');

  const filteredArticles = useMemo(() => {
    let list = initialArticles;
    if (selectedCategory) {
      list = list.filter(
        (a) => a.category?.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
      );
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt?.toLowerCase().includes(q) ||
          a.category?.toLowerCase().includes(q) ||
          a.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [initialArticles, selectedCategory, searchFilter]);

  return (
    <>
      <Header />
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-xs font-mono text-muted">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="text-muted/40">/</span>
          <span className="text-foreground font-semibold">Articles Directory</span>
        </div>

        {/* Directory Header */}
        <section className="mb-8 border-b border-card-border pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="font-mono text-xs uppercase tracking-wider text-muted">
                  Full Knowledge Base
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                All Articles &amp; Guides
              </h1>
              <p className="text-sm text-muted mt-1.5 max-w-xl leading-relaxed">
                Filter through {initialArticles.length} detailed technical solutions, semester lecture guides, and career roadmaps.
              </p>
            </div>

            {/* Search Input & View Switcher */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative">
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter articles..."
                  className="w-48 sm:w-64 px-3 py-1.5 pl-8 rounded-md bg-card-bg border border-card-border text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-foreground transition-colors"
                />
                <svg
                  className="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchFilter && (
                  <button
                    onClick={() => setSearchFilter('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-foreground cursor-pointer px-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-card-bg border border-card-border rounded-md p-0.5">
                <button
                  onClick={() => setDirectoryViewMode('grid')}
                  title="Grid view"
                  className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                    directoryViewMode === 'grid'
                      ? 'bg-foreground text-background'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </button>
                <button
                  onClick={() => setDirectoryViewMode('compact')}
                  title="List view"
                  className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                    directoryViewMode === 'compact'
                      ? 'bg-foreground text-background'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mt-5 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === ''
                  ? 'bg-foreground text-background'
                  : 'bg-card-bg border border-card-border text-muted hover:text-foreground hover:border-card-border-hover'
              }`}
            >
              All Categories ({initialArticles.length})
            </button>
            {initialCategories.map((cat) => {
              const count = initialArticles.filter(
                (a) => a.category?.trim().toLowerCase() === cat.name?.trim().toLowerCase()
              ).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory.trim().toLowerCase() === cat.name.trim().toLowerCase()
                      ? 'bg-foreground text-background'
                      : 'bg-card-bg border border-card-border text-muted hover:text-foreground hover:border-card-border-hover'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </section>

        {/* Filter Indicator */}
        {(selectedCategory || searchFilter) && (
          <div className="flex items-center gap-2 mb-6 text-xs font-mono">
            <span className="text-muted">Filtering:</span>
            {selectedCategory && (
              <span className="px-2 py-0.5 rounded bg-accent/10 border border-accent/25 text-accent flex items-center gap-1">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('')} className="hover:text-foreground cursor-pointer">✕</button>
              </span>
            )}
            {searchFilter && (
              <span className="px-2 py-0.5 rounded bg-card-bg border border-card-border text-foreground flex items-center gap-1">
                &ldquo;{searchFilter}&rdquo;
                <button onClick={() => setSearchFilter('')} className="hover:text-foreground cursor-pointer">✕</button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCategory('');
                setSearchFilter('');
              }}
              className="text-xs text-muted hover:text-foreground underline cursor-pointer ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Articles List / Grid */}
        {filteredArticles.length === 0 ? (
          <div className="py-16 bg-card-bg border border-dashed border-card-border rounded-xl text-center">
            <p className="text-sm font-semibold text-foreground">No articles match your criteria</p>
            <p className="text-xs text-muted mt-1">Try clearing your search query or selecting another category.</p>
            <button
              onClick={() => {
                setSelectedCategory('');
                setSearchFilter('');
              }}
              className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer"
            >
              Show all articles
            </button>
          </div>
        ) : directoryViewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredArticles.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-card-border border-y border-card-border">
            {filteredArticles.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} variant="row" />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
