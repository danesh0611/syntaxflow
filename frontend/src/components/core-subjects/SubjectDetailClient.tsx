'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Article } from '@/lib/types';
import { ArticleCard } from '@/components/ArticleCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CORE_SUBJECTS, getSubjectBySlug, getArticleUnitNumber } from '@/lib/coreSubjectsData';

interface SubjectDetailClientProps {
  subjectSlug: string;
  allArticles: Article[];
}

export default function SubjectDetailClient({ subjectSlug, allArticles }: SubjectDetailClientProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');

  const subject = useMemo(() => {
    return getSubjectBySlug(subjectSlug) || CORE_SUBJECTS[0];
  }, [subjectSlug]);

  // Base articles matching this subject
  const baseSubjectArticles = useMemo(() => {
    return allArticles.filter(subject.match);
  }, [allArticles, subject]);

  // Article count per unit (1 to 5)
  const unitCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    baseSubjectArticles.forEach((a) => {
      const u = getArticleUnitNumber(a, subject.id);
      counts[u] = (counts[u] || 0) + 1;
    });
    return counts;
  }, [baseSubjectArticles, subject.id]);

  // Articles filtered by both unit selection and optional search query
  const displayedArticles = useMemo(() => {
    let list = baseSubjectArticles;

    // Filter by unit if a specific unit is chosen
    if (selectedUnit !== 'all') {
      const unitNum = parseInt(selectedUnit.replace('unit-', ''), 10);
      list = list.filter((a) => getArticleUnitNumber(a, subject.id) === unitNum);
    }

    // Filter by search query
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt?.toLowerCase().includes(q) ||
        a.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [baseSubjectArticles, selectedUnit, searchQuery, subject.id]);

  const otherSubjects = useMemo(() => {
    return CORE_SUBJECTS.filter((s) => s.id !== subject.id);
  }, [subject.id]);

  return (
    <>
      <Header />
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-6 text-xs font-mono text-muted">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="text-muted/40">/</span>
          <Link href="/core-subjects" className="hover:text-foreground transition-colors">
            Core Subjects
          </Link>
          <span className="text-muted/40">/</span>
          <span className="text-foreground font-semibold">{subject.title}</span>
        </nav>

        {/* Quick Subject Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 border-b border-card-border/60 scrollbar-none">
          <Link
            href="/core-subjects"
            className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap bg-card-bg/60 border border-card-border text-muted hover:text-foreground hover:border-card-border-hover transition-colors"
          >
            &larr; All Subjects
          </Link>
          {CORE_SUBJECTS.map((sub) => {
            const isActive = sub.id === subject.id;
            const count = allArticles.filter(sub.match).length;
            return (
              <Link
                key={sub.id}
                href={`/core-subjects/${sub.slug}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-foreground text-background font-semibold shadow-xs'
                    : 'bg-card-bg border border-card-border text-muted hover:text-foreground hover:border-card-border-hover'
                }`}
              >
                <span>{sub.code}: {sub.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-background/20 text-background' : 'bg-card-border/60 text-muted'
                  }`}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Hero Section for This Subject */}
        <section className="mb-10 sm:mb-12 border-b border-card-border pb-8 sm:pb-10">
          <div className="p-6 sm:p-8 rounded-2xl bg-card-bg border border-card-border shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded-md border ${subject.badgeColor}`}>
                    {subject.code} &middot; {subject.badge}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-card-border/40 text-muted">
                    {allArticles.filter(subject.match).length} Study Guides
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
                  {subject.title}
                </h1>

                <p className="text-base sm:text-lg font-medium text-foreground/80">
                  {subject.tagline}
                </p>

                <p className="text-sm text-muted leading-relaxed pt-1">
                  {subject.description}
                </p>
              </div>

              {/* In-subject Search */}
              <div className="w-full lg:w-72 flex-shrink-0">
                <label htmlFor="subject-search" className="block text-xs font-mono font-medium text-muted uppercase tracking-wider mb-2">
                  Search {subject.code} Guides
                </label>
                <div className="relative">
                  <input
                    id="subject-search"
                    type="text"
                    placeholder={`Filter ${subject.code} guides...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs bg-background border border-card-border rounded-xl pl-9 pr-3 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:border-foreground transition-colors shadow-xs"
                  />
                  <svg
                    className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2"
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
          </div>
        </section>

        {/* Unit Selector (Unit 1 to Unit 5) */}
        {subject.units && subject.units.length > 0 && (
          <section className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-card-border pb-3">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                  Course Curriculum Modules
                </h3>
                <p className="text-xs text-muted">
                  Select a unit to filter lecture notes, diagrams, and exam preparation material
                </p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-semibold self-start sm:self-auto">
                5 Units Available
              </span>
            </div>

            {/* 5 Unit Buttons + All Units Option */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {/* All Units Option */}
              <button
                type="button"
                onClick={() => setSelectedUnit('all')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  selectedUnit === 'all'
                    ? 'bg-foreground text-background border-foreground shadow-sm'
                    : 'bg-card-bg border-card-border text-muted hover:text-foreground hover:border-card-border-hover'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase">All</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                      selectedUnit === 'all'
                        ? 'bg-background/20 text-background'
                        : 'bg-card-border/60 text-muted'
                    }`}
                  >
                    {baseSubjectArticles.length}
                  </span>
                </div>
                <span className="text-xs font-semibold truncate">All Units</span>
              </button>

              {/* Units 1, 2, 3, 4, 5 */}
              {subject.units.map((unit) => {
                const isActive = selectedUnit === unit.id;
                const count = unitCounts[unit.number] || 0;
                return (
                  <button
                    key={unit.id}
                    type="button"
                    onClick={() => setSelectedUnit(unit.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-card-bg border-card-border text-muted hover:text-foreground hover:border-card-border-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold uppercase">{unit.name}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : count > 0
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                            : 'bg-card-border/60 text-muted'
                        }`}
                      >
                        {count}
                      </span>
                    </div>
                    <span className="text-xs font-semibold truncate" title={unit.title}>
                      {unit.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Unit Description Banner */}
            {selectedUnit !== 'all' && (() => {
              const activeUnit = subject.units?.find((u) => u.id === selectedUnit);
              if (!activeUnit) return null;
              return (
                <div className="p-4 sm:p-5 rounded-2xl bg-card-bg/60 border border-card-border flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                        {activeUnit.name}
                      </span>
                      <h4 className="text-sm font-bold text-foreground">
                        {activeUnit.title}
                      </h4>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      {activeUnit.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-mono text-muted bg-background border border-card-border px-2.5 py-1 rounded">
                      {unitCounts[activeUnit.number] || 0} {unitCounts[activeUnit.number] === 1 ? 'Article' : 'Articles'}
                    </span>
                  </div>
                </div>
              );
            })()}
          </section>
        )}

        {/* Articles List for this Subject */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>
                {selectedUnit === 'all'
                  ? `${subject.title} Study Guides & Notes`
                  : `${subject.units?.find((u) => u.id === selectedUnit)?.name || 'Unit'}: ${
                      subject.units?.find((u) => u.id === selectedUnit)?.title || 'Study Guides'
                    }`}
              </span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-card-border/40 text-muted">
                {displayedArticles.length}
              </span>
            </h2>
            {(searchQuery || selectedUnit !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedUnit('all');
                }}
                className="text-xs text-muted hover:text-foreground underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          {displayedArticles.length === 0 ? (
            <div className="py-16 bg-card-bg border border-dashed border-card-border rounded-2xl text-center px-4">
              {selectedUnit !== 'all' && (unitCounts[parseInt(selectedUnit.replace('unit-', ''), 10)] || 0) === 0 ? (
                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    No articles published in {subject.units?.find((u) => u.id === selectedUnit)?.name || 'this unit'} yet
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Study guides for {subject.units?.find((u) => u.id === selectedUnit)?.name || 'this unit'} are currently in progress. You can access all completed guides under Unit 1.
                  </p>
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={() => setSelectedUnit('unit-1')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
                    >
                      &larr; View Unit 1 Guides ({unitCounts[1] || 0} Articles)
                    </button>
                    <button
                      onClick={() => setSelectedUnit('all')}
                      className="px-4 py-2 rounded-xl text-xs font-medium border border-card-border bg-card-bg hover:bg-card-bg/80 text-foreground transition-colors cursor-pointer"
                    >
                      View All Units
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-md mx-auto space-y-2">
                  <p className="text-base font-semibold text-foreground">
                    No guides match your search query in this section
                  </p>
                  <p className="text-xs text-muted">
                    Try searching with different keywords or reset your filters.
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                  >
                    Clear search filter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedArticles.map((article, i) => (
                <ArticleCard key={article.id} article={article} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Explore Other Core Subjects */}
        <section className="mt-16 pt-10 border-t border-card-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-foreground">Other Core Engineering Subjects</h3>
              <p className="text-xs text-muted mt-0.5">Explore additional university curriculum and interview modules</p>
            </div>
            <Link
              href="/core-subjects"
              className="text-xs font-semibold text-foreground hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherSubjects.map((sub) => {
              const count = allArticles.filter(sub.match).length;
              return (
                <Link
                  key={sub.id}
                  href={`/core-subjects/${sub.slug}`}
                  className="group p-5 rounded-2xl border border-card-border bg-card-bg/60 hover:bg-card-bg hover:border-card-border-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${sub.badgeColor}`}>
                        {sub.code} &middot; {sub.badge}
                      </span>
                      <span className="text-xs font-mono text-muted">
                        {count} {count === 1 ? 'Article' : 'Articles'}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-foreground group-hover:text-foreground transition-colors">
                      {sub.title}
                    </h4>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      {sub.tagline}
                    </p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-card-border/60 flex items-center justify-between text-xs font-medium text-foreground/80 group-hover:text-foreground">
                    <span>Open {sub.code} Guides &rarr;</span>
                    <span className="font-mono text-[11px] text-muted">{count} guides</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
