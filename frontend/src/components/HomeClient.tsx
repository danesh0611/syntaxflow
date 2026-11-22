'use client';

import { useState, useRef, useMemo } from 'react';
import { Article, Category } from '@/lib/types';
import { ArticleCard } from '@/components/ArticleCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

interface HomeClientProps {
  initialArticles: Article[];
  initialCategories: Category[];
}

export default function HomeClient({ initialArticles, initialCategories }: HomeClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [activeDsaFilter, setActiveDsaFilter] = useState<string>('all');
  const [directoryViewMode, setDirectoryViewMode] = useState<'grid' | 'compact'>('grid');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const directoryRef = useRef<HTMLElement>(null);
  const dsaSectionRef = useRef<HTMLElement>(null);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setTimeout(() => {
      directoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // 1. Coding Round & DSA Articles
  const dsaArticles = useMemo(() => {
    return initialArticles.filter(
      (a) =>
        a.category?.toLowerCase().includes('data structure') ||
        a.category?.toLowerCase().includes('algorithm') ||
        a.category?.toLowerCase().includes('dsa') ||
        a.tags?.some((t) => /dsa|leetcode/i.test(t))
    );
  }, [initialArticles]);

  // Filtered DSA subset for the DSA section
  const filteredDsaArticles = useMemo(() => {
    if (activeDsaFilter === 'all') return dsaArticles;
    const filter = activeDsaFilter.toLowerCase();
    return dsaArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(filter) ||
        a.tags?.some((t) => t.toLowerCase().includes(filter)) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(filter))
    );
  }, [dsaArticles, activeDsaFilter]);

  // 2. Core Engineering Subjects Highlight (Only 2 articles shown on homepage)
  const coreEngineeringSpotlight = useMemo(() => {
    return initialArticles.filter((a) => {
      const cat = a.category?.trim().toLowerCase() || '';
      return (
        cat === 'short range wireless communication' ||
        cat === 'formal language automata' ||
        cat.includes('wireless') ||
        cat.includes('automata')
      );
    }).slice(0, 2);
  }, [initialArticles]);

  // 3. Python & Machine Learning
  const pythonMlArticles = useMemo(() => {
    return initialArticles.filter(
      (a) =>
        (a.category?.toLowerCase().includes('python') ||
        a.category?.toLowerCase().includes('machine learning') ||
        /python|cluster|k-means/i.test(a.title)) &&
        !(a.category?.toLowerCase().includes('data structure') ||
        a.category?.toLowerCase().includes('algorithm') ||
        a.tags?.some((t) => /dsa|leetcode/i.test(t)))
    );
  }, [initialArticles]);

  // 4. Industry Realities & Resume Projects
  const industryArticles = useMemo(() => {
    return initialArticles.filter(
      (a) =>
        (a.category?.toLowerCase().includes('global') ||
        a.category?.toLowerCase().includes('projects') ||
        /scam|layoffs|profitable|trust platform|outage|outlook/i.test(a.title)) &&
        !(a.category?.toLowerCase().includes('data structure') ||
        a.category?.toLowerCase().includes('algorithm') ||
        a.tags?.some((t) => /dsa|leetcode/i.test(t)))
    );
  }, [initialArticles]);

  // 5. Filtered Articles for Complete Search Directory
  const directoryArticles = useMemo(() => {
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

        {/* ── 1. HERO ────────────────────────────────────────────── */}
        <section className="mb-12 sm:mb-16 border-b border-card-border pb-10 sm:pb-12 animate-fade-in">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-3 mb-6 text-xs font-mono text-muted">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="font-semibold text-foreground">SyntaxFlow</span>
              <span className="text-muted/50">/</span>
              <span>Engineering &amp; Placement Preparation</span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[11px] text-muted">
              <span>DSA Solutions</span>
              <span>&bull;</span>
              <span>100 FAANG Sheet</span>
              <span>&bull;</span>
              <span>SQL Course</span>
              <span>&bull;</span>
              <span>Core Subjects</span>
            </div>
          </div>

          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
              Technical Placement Prep &amp; Core Engineering
            </h1>
            <p className="text-sm sm:text-base text-muted leading-relaxed max-w-2xl">
              High-yield DSA editorials with dry-run tables, an interactive 100 FAANG tracker, a structured SQL interview curriculum, and semester guides for wireless and systems architecture.
            </p>
          </div>

          {/* Quick Hub Launch Cards */}
          <h2 className="sr-only">Placement Preparation Hubs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-8">
            {/* Tool 1: DSA Sheet */}
            <Link
              href="/dsa-sheet"
              className="group p-4 sm:p-5 rounded-xl bg-card-bg border border-card-border hover:border-card-border-hover hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded uppercase">
                    TRACKER
                  </span>
                  <span className="text-muted group-hover:text-accent group-hover:translate-x-1 transition-all text-xs font-bold">&rarr;</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                  100 FAANG DSA Sheet
                </h3>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">
                  Checklist with live LeetCode stats, company tags, and editorial links.
                </p>
              </div>
            </Link>

            {/* Tool 2: SQL Placement Course */}
            <Link
              href="/sql-course"
              className="group p-4 sm:p-5 rounded-xl bg-card-bg border border-card-border hover:border-emerald-500/30 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded uppercase">
                    COURSE
                  </span>
                  <span className="text-muted group-hover:text-emerald-500 group-hover:translate-x-1 transition-all text-xs font-bold">&rarr;</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  SQL for Tech Interviews
                </h3>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">
                  9 placement levels, window functions, CTEs, and 100+ real interview schemas.
                </p>
              </div>
            </Link>

            {/* Tool 3: Algorithmic Solutions */}
            <button
              onClick={() => {
                dsaSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="group p-4 sm:p-5 rounded-xl bg-card-bg border border-card-border hover:border-card-border-hover hover:-translate-y-1 hover:shadow-md text-left transition-all duration-200 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded uppercase">
                    EDITORIALS
                  </span>
                  <span className="text-muted group-hover:text-accent group-hover:translate-y-1 transition-all text-xs font-bold">&darr;</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                  DSA Solutions ({dsaArticles.length})
                </h3>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">
                  Step-by-step dry runs, brute force to optimal code, and edge case trade-offs.
                </p>
              </div>
            </button>

            {/* Tool 4: Core Subjects (Opens Dedicated Page with SRW & FLA) */}
            <Link
              href="/core-subjects"
              className="group p-4 sm:p-5 rounded-xl bg-card-bg border border-card-border hover:border-amber-500/30 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-[10px] font-bold text-amber-900 dark:text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded uppercase">
                    SUBJECTS
                  </span>
                  <span className="text-muted group-hover:text-amber-500 group-hover:translate-x-1 transition-all text-xs font-bold">&rarr;</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                  Core Subjects
                </h3>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">
                  Dedicated hub for SRW (Wireless) and FLA (Automata Theory) guides.
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* ── CALLOUT: CONTRIBUTE YOUR WORK ── */}
        <div className="mb-12 p-5 sm:p-6 rounded-xl bg-card-bg border border-card-border flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-muted">
              <span className="font-semibold text-foreground">Write for Syntax Flow</span>
              <span>&bull;</span>
              <span>Contributor Program</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Share your technical write-ups and placement guides
            </h2>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Publishing 1 article earns you a <strong>Contributor Medal</strong> and features you on the website for a month. Publishing 20 articles earns an official <strong>Technical Writing Certificate</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
            <Link
              href="/contribute"
              className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold bg-foreground text-background hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Contribute an Article</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* ── 2. SECTION: CODING ROUNDS & DSA EDITORIALS ─────────────── */}
        <section ref={dsaSectionRef} className="mb-12 sm:mb-16" style={{ scrollMarginTop: '80px' }}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-card-border pb-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="font-mono text-xs uppercase tracking-wider text-muted">
                  Coding Rounds &middot; DSA
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Algorithmic Editorials &amp; Dry Runs
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-1 max-w-xl">
                Brute-force to optimal C++ with step-by-step dry-run tables and complexity trade-offs.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/dsa-sheet"
                className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
              >
                100 FAANG Tracker &rarr;
              </Link>
            </div>
          </div>

          {/* Sub-topic Filter Chips for DSA */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
            {[
              { label: 'All', filter: 'all' },
              { label: 'Sliding Window', filter: 'window' },
              { label: 'Stacks & Queues', filter: 'stack' },
              { label: 'Trees & BST', filter: 'tree' },
              { label: 'Dynamic Programming', filter: 'dynamic' },
              { label: 'Heaps', filter: 'heap' },
              { label: 'Strings', filter: 'string' },
            ].map((tab) => (
              <button
                key={tab.filter}
                onClick={() => setActiveDsaFilter(tab.filter)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeDsaFilter === tab.filter
                    ? 'bg-foreground text-background'
                    : 'bg-card-bg border border-card-border text-muted hover:text-foreground hover:border-card-border-hover'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Curated DSA Cards */}
          {filteredDsaArticles.length === 0 ? (
            <div className="py-12 bg-card-bg border border-dashed border-card-border rounded-lg text-center">
              <p className="text-sm font-medium text-foreground">No matching DSA questions under this topic</p>
              <button
                onClick={() => setActiveDsaFilter('all')}
                className="mt-2 text-xs font-medium text-accent hover:underline cursor-pointer"
              >
                Show all DSA questions
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDsaArticles.slice(0, 6).map((article, i) => (
                <ArticleCard key={article.id} article={article} index={i} />
              ))}
            </div>
          )}

          {/* Expand / View All DSA Footer */}
          <div className="mt-5 pt-3 border-t border-card-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted">
            <span>Showing {Math.min(6, filteredDsaArticles.length)} of {dsaArticles.length} DSA guides</span>
            <button
              onClick={() => handleCategorySelect('Data Structures and algorithms')}
              className="font-medium text-accent hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>View all {dsaArticles.length} DSA solutions in Directory &rarr;</span>
            </button>
          </div>
        </section>

        {/* ── 3. SECTION: CORE SUBJECTS SPOTLIGHT (ONLY 1 OR 2 ARTICLES + BUTTON TO NEW PAGE) ──── */}
        <section className="mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-card-border pb-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="font-mono text-xs uppercase tracking-wider text-muted">
                  University Curriculum &middot; Core Engineering
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Core Subjects
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-1 max-w-xl">
                Dedicated curriculum for Short Range Wireless (SRW) and Formal Languages &amp; Automata Theory (FLA).
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href="/core-subjects"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-foreground text-background hover:opacity-90 hover:-translate-y-0.5 active:scale-98 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span>View Core Subjects (SRW &amp; FLA)</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>

          {/* 1-2 Highlighted Core Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {coreEngineeringSpotlight.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>
        </section>

        {/* ── 4. SECTION: PYTHON, ML & RESUME PROJECTS ───────────────── */}
        <section className="mb-12 sm:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Python & Machine Learning */}
            <div className="lg:col-span-6 space-y-4">
              <div className="border-b border-card-border pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="font-mono text-xs uppercase tracking-wider text-muted">
                    Software &middot; Machine Learning
                  </span>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  Python Fundamentals &amp; Machine Learning
                </h3>
              </div>

              <div className="space-y-2.5">
                {pythonMlArticles.slice(0, 3).map((article, i) => (
                  <ArticleCard key={article.id} article={article} index={i} variant="row" />
                ))}
              </div>
            </div>

            {/* Right: Industry Happenings & Resume Projects */}
            <div className="lg:col-span-6 space-y-4">
              <div className="border-b border-card-border pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="font-mono text-xs uppercase tracking-wider text-muted">
                    Industry &middot; Projects
                  </span>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  Tech Market &amp; Portfolio Projects
                </h3>
              </div>

              <div className="space-y-2.5">
                {industryArticles.slice(0, 3).map((article, i) => (
                  <ArticleCard key={article.id} article={article} index={i} variant="row" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. SPOTLIGHT: SQL PLACEMENT BLUEPRINT ──────────────────── */}
        <section className="mb-12 sm:mb-16">
          <div className="group rounded-xl border border-card-border bg-card-bg hover:border-emerald-500/40 p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all duration-200 hover:shadow-xs">
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-800 dark:text-emerald-300 font-semibold">Self-Paced Course &middot; Free</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                SQL for Technical Interviews
              </h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                9 structured levels covering Window Functions (<code className="text-foreground">ROW_NUMBER</code>, <code className="text-foreground">DENSE_RANK</code>), Multi-Table Joins, Recursive CTEs, Index Traps, and 100+ real interview schemas.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href="/sql-course"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 hover:-translate-y-0.5 active:scale-98 transition-all shadow-xs"
              >
                <span>View SQL Course</span>
                <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── 6. COMPLETE SEARCHABLE DIRECTORY ───────────────────────── */}
        <section
          id="directory"
          ref={directoryRef}
          className="border-t border-card-border pt-10 sm:pt-12 pb-8"
          style={{ scrollMarginTop: '80px' }}
        >
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>{selectedCategory ? `${selectedCategory}` : 'Complete Subject Directory'}</span>
                <span className="font-mono text-xs text-muted">
                  ({directoryArticles.length})
                </span>
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Instant search across all interview solutions, semester subjects, and technical tutorials.
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
                  className="w-48 sm:w-60 px-3 py-1.5 pl-8 rounded-md bg-card-bg border border-card-border text-xs text-foreground placeholder:text-muted/50 focus:outline-none focus:border-foreground transition-colors"
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

          {/* Active Filter Indicator */}
          {(selectedCategory || searchFilter) && (
            <div className="flex items-center gap-2 mb-4 text-xs font-mono">
              <span className="text-muted">Filtering:</span>
              {selectedCategory && (
                <span className="px-2 py-0.5 rounded bg-accent/10 border border-accent/25 text-accent flex items-center gap-1">
                  Topic: {selectedCategory}
                  <button onClick={() => setSelectedCategory('')} className="hover:text-foreground cursor-pointer">×</button>
                </span>
              )}
              {searchFilter && (
                <span className="px-2 py-0.5 rounded bg-card-bg border border-card-border text-foreground flex items-center gap-1">
                  &ldquo;{searchFilter}&rdquo;
                  <button onClick={() => setSearchFilter('')} className="hover:text-foreground cursor-pointer">×</button>
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

          {/* Topic Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === ''
                  ? 'bg-foreground text-background'
                  : 'bg-card-bg border border-card-border text-muted hover:text-foreground hover:border-card-border-hover'
              }`}
            >
              All Content ({initialArticles.length})
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

          {/* Directory Listings */}
          {directoryArticles.length === 0 ? (
            <div className="py-16 bg-card-bg border border-dashed border-card-border rounded-xl text-center">
              <p className="text-sm font-semibold text-foreground">No matching content found</p>
              <p className="text-xs text-muted mt-1">Try another search keyword or pick a topic pill above.</p>
              {(selectedCategory || searchFilter) && (
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSearchFilter('');
                  }}
                  className="mt-3 text-xs font-semibold text-accent hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : directoryViewMode === 'compact' ? (
            <div className="space-y-2">
              {directoryArticles.map((article, i) => (
                <ArticleCard key={article.id} article={article} index={i} variant="row" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {directoryArticles.map((article, i) => (
                <ArticleCard key={article.id} article={article} index={i} variant="card" />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
