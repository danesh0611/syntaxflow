'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Article } from '@/lib/types';
import { ArticleCard } from '@/components/ArticleCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CORE_SUBJECTS, SubjectConfig } from '@/lib/coreSubjectsData';

interface SubjectDetailClientProps {
  subject: SubjectConfig;
  allArticles: Article[];
}

export default function SubjectDetailClient({ subject, allArticles }: SubjectDetailClientProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Articles filtered for this subject
  const subjectArticles = useMemo(() => {
    const list = allArticles.filter(subject.match);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt?.toLowerCase().includes(q) ||
        a.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [allArticles, subject, searchQuery]);

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
                  Search {subject.code} Topics
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

            {/* Syllabus Coverage Tags */}
            <div className="mt-6 pt-6 border-t border-card-border/60">
              <span className="font-mono text-[11px] text-muted font-bold uppercase tracking-wider block mb-2.5">
                Curriculum Syllabus Coverage:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {subject.topics.map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs bg-background border border-card-border text-foreground/80 font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Articles List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>{subject.title} Lecture &amp; Exam Guides</span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-card-border/40 text-muted">
                {subjectArticles.length}
              </span>
            </h2>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-muted hover:text-foreground underline cursor-pointer"
              >
                Clear filter
              </button>
            )}
          </div>

          {subjectArticles.length === 0 ? (
            <div className="py-16 bg-card-bg border border-dashed border-card-border rounded-2xl text-center px-4">
              <p className="text-base font-semibold text-foreground">
                No guides match your search in {subject.title}
              </p>
              <p className="text-xs text-muted mt-1 max-w-md mx-auto">
                Try searching with different keywords or clear your query to view all available chapters.
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                >
                  Clear filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjectArticles.map((article, i) => (
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
                  className="group p-5 rounded-xl border border-card-border bg-card-bg/60 hover:bg-card-bg hover:border-card-border-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
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
                    <span className="font-mono text-[11px] text-muted">{sub.topics.length} topics</span>
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
