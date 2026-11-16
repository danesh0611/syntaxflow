'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Article } from '@/lib/types';
import { ArticleCard } from '@/components/ArticleCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface CoreSubjectsClientProps {
  initialArticles: Article[];
}

export interface SubjectConfig {
  id: string;
  code: string;
  title: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  description: string;
  topics: string[];
  match: (a: Article) => boolean;
}

export const CORE_SUBJECTS: SubjectConfig[] = [
  {
    id: 'srw',
    code: 'SRW',
    title: 'Short Range Wireless Communication',
    tagline: 'RF Transmitters, Receivers & Modern Wireless Systems',
    badge: 'Hardware & RF',
    badgeColor: 'text-amber-600 dark:text-amber-400 border-amber-500/20 bg-amber-500/10',
    description:
      'In-depth study guides covering Amplitude Shift Keying (ASK), Frequency Synthesizers, Direct Conversion, Superheterodyne, and Amplifier-Sequenced Hybrid (ASH) receiver architectures.',
    topics: [
      'ASH Receiver Architecture',
      'Superheterodyne vs Direct Conversion',
      'RF Frequency Synthesizers & PLL',
      'Transmitter Power & Modulation Schemes',
      'Semester Exam Solved Breakdowns',
    ],
    match: (a: Article) => {
      const cat = a.category?.trim().toLowerCase() || '';
      return cat === 'short range wireless communication' || cat.includes('wireless');
    },
  },
  {
    id: 'fla',
    code: 'FLA',
    title: 'Formal Languages & Automata Theory',
    tagline: 'Computation Theory, Finite Automata, Grammars & Turing Machines',
    badge: 'Theory & Systems',
    badgeColor: 'text-teal-600 dark:text-teal-400 border-teal-500/20 bg-teal-500/10',
    description:
      'Interactive and diagram-driven breakdowns of Deterministic Finite Automata (DFA), NFA to DFA conversions, Regular Expressions, Context-Free Grammars (CFG), and Chomsky Hierarchy.',
    topics: [
      'Deterministic Finite Automata (DFA)',
      'NFA with Epsilon Transitions',
      'Regular Expressions & Pumping Lemma',
      'Context-Free Grammars & Pushdown Automata',
      'Turing Machines & Decidability',
    ],
    match: (a: Article) => {
      const cat = a.category?.trim().toLowerCase() || '';
      return cat === 'formal language automata' || cat.includes('automata');
    },
  },
];

export default function CoreSubjectsClient({ initialArticles }: CoreSubjectsClientProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('srw');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedSubject = useMemo(() => {
    return CORE_SUBJECTS.find((s) => s.id === selectedSubjectId) || CORE_SUBJECTS[0];
  }, [selectedSubjectId]);

  // Subject-specific articles
  const subjectArticles = useMemo(() => {
    const list = initialArticles.filter(selectedSubject.match);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt?.toLowerCase().includes(q) ||
        a.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [initialArticles, selectedSubject, searchQuery]);

  return (
    <>
      <Header />
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1">
        
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center gap-2 mb-6 text-xs font-mono text-muted">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="text-muted/40">/</span>
          <span className="text-foreground font-semibold">Core Subjects</span>
        </div>

        {/* Hero Banner */}
        <section className="mb-10 sm:mb-12 border-b border-card-border pb-8 sm:pb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              Curriculum &amp; Technical Interviews
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
            Core Engineering Subjects
          </h1>
          <p className="text-sm sm:text-base text-muted mt-2 max-w-2xl leading-relaxed">
            Choose a subject below to explore structured chapter-wise technical breakdowns, state machine visualizations, and university-standard exam questions.
          </p>

          {/* ── SUBJECT SELECTOR CARDS ─────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {CORE_SUBJECTS.map((sub) => {
              const isSelected = selectedSubjectId === sub.id;
              const count = initialArticles.filter(sub.match).length;

              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubjectId(sub.id);
                    setSearchQuery('');
                  }}
                  className={`group p-5 sm:p-6 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-card-bg border-foreground shadow-sm ring-1 ring-foreground/10'
                      : 'bg-card-bg/60 border-card-border hover:border-card-border-hover hover:-translate-y-0.5 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${sub.badgeColor}`}>
                        {sub.code} &middot; {sub.badge}
                      </span>
                      <span
                        className={`text-xs font-mono font-medium px-2 py-0.5 rounded ${
                          isSelected
                            ? 'bg-foreground text-background font-semibold'
                            : 'bg-card-border/40 text-muted group-hover:text-foreground'
                        }`}
                      >
                        {count} {count === 1 ? 'Article' : 'Articles'}
                      </span>
                    </div>

                    <h2
                      className={`text-lg sm:text-xl font-bold tracking-tight transition-colors ${
                        isSelected ? 'text-foreground' : 'text-foreground/90 group-hover:text-foreground'
                      }`}
                    >
                      {sub.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted mt-1.5 leading-relaxed">
                      {sub.tagline}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-card-border/60 flex items-center justify-between text-xs font-medium">
                    <span className={isSelected ? 'text-accent font-semibold' : 'text-muted group-hover:text-foreground'}>
                      {isSelected ? '✓ Selected Subject' : 'Click to Load Guides &rarr;'}
                    </span>
                    <span className="font-mono text-[11px] text-muted">
                      {sub.topics.length} key modules
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── ACTIVE SUBJECT DETAIL & ARTICLES ──────────────────────── */}
        <section className="space-y-6 animate-fade-in" key={selectedSubject.id}>
          
          {/* Header Bar for Active Subject */}
          <div className="p-5 sm:p-6 rounded-xl bg-card-bg border border-card-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-wider text-muted font-bold">
                  Active Subject Guide: {selectedSubject.code}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                {selectedSubject.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                {selectedSubject.description}
              </p>
            </div>

            {/* Quick search inside this subject */}
            <div className="w-full lg:w-72">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search ${selectedSubject.code} topics...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-background border border-card-border rounded-lg pl-8 pr-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:border-foreground transition-colors"
                />
                <svg
                  className="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2"
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

          {/* Key Topics / Syllabus Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-mono text-[11px] text-muted flex-shrink-0 font-bold uppercase tracking-wider">
              Syllabus Coverage:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedSubject.topics.map((topic, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-[11px] bg-card-bg border border-card-border text-foreground/80 font-medium whitespace-nowrap"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Article Grid for Current Subject */}
          {subjectArticles.length === 0 ? (
            <div className="py-16 bg-card-bg border border-dashed border-card-border rounded-xl text-center">
              <p className="text-base font-semibold text-foreground">No articles match your search in {selectedSubject.code}</p>
              <p className="text-xs text-muted mt-1">Try clearing your search query or check back soon for upcoming lectures.</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjectArticles.map((article, i) => (
                <ArticleCard key={article.id} article={article} index={i} />
              ))}
            </div>
          )}

          {/* Extensible Future Subjects Notice */}
          <div className="mt-12 p-5 rounded-xl border border-dashed border-card-border/80 bg-card-bg/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                Upcoming Curriculum Subjects
              </h4>
              <p className="text-xs text-muted mt-0.5">
                Operating Systems (OS), Computer Networks (CN), and Database Management (DBMS) guides are in preparation.
              </p>
            </div>
            <Link
              href="/#directory"
              className="text-xs font-semibold text-foreground hover:underline flex items-center gap-1 flex-shrink-0"
            >
              <span>Explore all {initialArticles.length} general articles</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
