'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface FormState {
  name: string;
  email: string;
}

const SAMPLE_SQL_SNIPPETS = [
  {
    title: 'Top N per Group',
    tag: 'Level 8: Window Functions (DENSE_RANK)',
    difficulty: '⭐⭐⭐ High Yield',
    interviewFor: 'Amazon / Google / Placement Drives',
    code: `WITH RankedSalaries AS (
  SELECT 
    dept_id,
    employee_name,
    salary,
    DENSE_RANK() OVER (
      PARTITION BY dept_id 
      ORDER BY salary DESC
    ) AS rnk
  FROM employees
)
SELECT dept_id, employee_name, salary
FROM RankedSalaries
WHERE rnk <= 3;`,
  },
  {
    title: 'INNER JOIN vs LEFT JOIN',
    tag: 'Level 4: Multi-Table Joins',
    difficulty: '⭐⭐⭐ Core Placement',
    interviewFor: 'TCS / Infosys / Product Startups',
    code: `-- Fetch all customers and their orders (including customers without orders)
SELECT 
  c.customer_id,
  c.customer_name,
  COALESCE(o.order_id, 0) AS order_id,
  COALESCE(o.amount, 0) AS amount
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id;`,
  },
  {
    title: 'Subquery with EXISTS',
    tag: 'Level 5: Subqueries',
    difficulty: '⭐⭐⭐ High Yield',
    interviewFor: 'Wipro / Cognizant / Tier-1 Tech',
    code: `-- Find all departments that have at least one active employee
SELECT d.dept_id, d.dept_name
FROM departments d
WHERE EXISTS (
  SELECT 1 
  FROM employees e 
  WHERE e.dept_id = d.dept_id
);`,
  },
  {
    title: 'Conditional Aggregation (CASE WHEN)',
    tag: 'Level 7: Conditional Queries',
    difficulty: '⭐⭐ Interview Classic',
    interviewFor: 'Analytics / SDE Placements',
    code: `SELECT 
  dept_id,
  COUNT(*) AS total_employees,
  SUM(CASE WHEN salary > 80000 THEN 1 ELSE 0 END) AS high_earners,
  AVG(salary) AS avg_dept_salary
FROM employees
GROUP BY dept_id;`,
  },
];

const CURRICULUM_LEVELS = [
  {
    id: 'lvl-1',
    levelTag: 'Level 1',
    badgeColor: 'green',
    difficulty: 'Basics',
    starRating: '',
    title: 'Level 1 — Basics',
    description: 'Foundational concepts of relational databases, core schema architecture, and basic SELECT queries.',
    topics: [
      'What is SQL?',
      'DBMS vs RDBMS — basic idea',
      'Tables, rows, columns',
      'Primary Key',
      'Foreign Key',
      'SELECT',
      'DISTINCT',
      'WHERE',
      'Comparison operators: =, >, <, >=, <=, <>',
      'Logical operators: AND, OR, NOT',
      'ORDER BY',
      'LIMIT',
    ],
  },
  {
    id: 'lvl-2',
    levelTag: 'Level 2',
    badgeColor: 'green',
    difficulty: 'Filtering',
    starRating: '',
    title: 'Level 2 — Filtering',
    description: 'Mastering row-level predicate filtering, wildcard pattern matching, and handling NULL values correctly.',
    topics: [
      'IN operator & multiple value checking',
      'BETWEEN (inclusive range checks)',
      'LIKE pattern matching',
      'Wildcards: % (any sequence) and _ (single character)',
      'IS NULL',
      'IS NOT NULL',
    ],
  },
  {
    id: 'lvl-3',
    levelTag: 'Level 3',
    badgeColor: 'yellow',
    difficulty: 'Aggregation',
    starRating: '',
    title: 'Level 3 — Aggregation',
    description: 'Summarizing dataset metrics with aggregate functions, grouping data, and post-aggregation filtering.',
    topics: [
      'COUNT()',
      'SUM()',
      'AVG()',
      'MIN()',
      'MAX()',
      'GROUP BY',
      'HAVING',
      'Difference between WHERE and HAVING',
    ],
  },
  {
    id: 'lvl-4',
    levelTag: 'Level 4',
    badgeColor: 'red',
    difficulty: 'Heavyweight',
    starRating: '⭐⭐⭐',
    title: 'Level 4 — JOINS ⭐⭐⭐',
    description: 'The single most tested placement topic: linking tables, understanding row multiplication, and join types.',
    topics: [
      'What is a JOIN?',
      'INNER JOIN',
      'LEFT JOIN',
      'RIGHT JOIN',
      'FULL OUTER JOIN — know concept',
      'Self Join (e.g. Employee & Manager hierarchy)',
      'Joining 3+ tables in complex schemas',
      'JOIN vs WHERE (Implicit vs Explicit joins)',
    ],
  },
  {
    id: 'lvl-5',
    levelTag: 'Level 5',
    badgeColor: 'red',
    difficulty: 'Heavyweight',
    starRating: '⭐⭐⭐',
    title: 'Level 5 — Subqueries ⭐⭐⭐',
    description: 'Nesting queries, filtering on aggregate results, correlated subqueries, and EXISTS vs IN comparisons.',
    topics: [
      'What is a subquery?',
      'Subquery with WHERE clause',
      'Subquery with aggregate functions (e.g. salary > AVG(salary))',
      'Correlated subquery — basic understanding',
      'IN vs subquery',
      'EXISTS / NOT EXISTS',
    ],
  },
  {
    id: 'lvl-6',
    levelTag: 'Level 6',
    badgeColor: 'yellow',
    difficulty: 'Combining Queries',
    starRating: '',
    title: 'Level 6 — Combining Queries',
    description: 'Merging multiple result sets together using relational set operators.',
    topics: [
      'UNION (combines with automatic deduplication)',
      'UNION ALL (combines preserving all duplicates)',
      'INTERSECT — concept & common rows',
      'EXCEPT — concept & record difference',
    ],
  },
  {
    id: 'lvl-7',
    levelTag: 'Level 7',
    badgeColor: 'yellow',
    difficulty: 'Conditional Logic',
    starRating: '',
    title: 'Level 7 — Conditional Queries',
    description: 'Handling IF-ELSE branching inside queries, sanitizing NULLs, and default values.',
    topics: [
      'CASE WHEN ... THEN ... ELSE ... END',
      'COALESCE() (replacing NULL with default value)',
      'NULLIF() — basic concept (preventing division by zero)',
    ],
  },
  {
    id: 'lvl-8',
    levelTag: 'Level 8',
    badgeColor: 'red',
    difficulty: 'High Yield',
    starRating: '⭐⭐⭐',
    title: 'Level 8 — Window Functions ⭐⭐⭐',
    description: 'The #1 differentiator in placement and product company interviews. Calculating running metrics and Top-N rankings without collapsing rows.',
    topics: [
      'What are window functions?',
      'ROW_NUMBER()',
      'RANK()',
      'DENSE_RANK() (and differences between ROW_NUMBER vs RANK vs DENSE_RANK)',
      'PARTITION BY',
      'ORDER BY inside OVER()',
      'Finding top N records per group (Top 3 salaries per department)',
    ],
  },
  {
    id: 'lvl-9',
    levelTag: 'Level 9',
    badgeColor: 'yellow',
    difficulty: 'Theory & Differences',
    starRating: '',
    title: 'Level 9 — Common Interview Concepts',
    description: 'Rapid-fire theoretical differences and interview questions frequently asked in placement interviews.',
    topics: [
      'SQL execution order (FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT)',
      'WHERE vs HAVING',
      'DELETE vs TRUNCATE vs DROP',
      'PRIMARY KEY vs UNIQUE key',
      'UNION vs UNION ALL',
      'INNER JOIN vs LEFT JOIN',
      'COUNT(*) vs COUNT(column)',
      'Basic normalization (1NF, 2NF, 3NF overview)',
      'Index — basic concept and performance benefits',
    ],
  },
];

interface FormState {
  name: string;
  email: string;
  password: string;
}

export const SqlCourseClient: React.FC = () => {
  const [activeSnippetIndex, setActiveSnippetIndex] = useState(0);
  const [expandedLevel, setExpandedLevel] = useState<string | null>('lvl-4');
  
  // Registration Form State with Password
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registrationResult, setRegistrationResult] = useState<{
    success: boolean;
    registrationId: string;
    message: string;
    alreadyRegistered?: boolean;
  } | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const formId = useId();

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(SAMPLE_SQL_SNIPPETS[activeSnippetIndex].code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://syntaxflowarticles.pages.dev/sql-course';
    navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!form.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!form.password || form.password.length < 6) {
      setErrorMessage('Please set a password of at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/sql-course/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.status === 409 || data.alreadyRegistered) {
        setErrorMessage('This email is already registered! Please go to the login page to sign in with your password.');
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete registration.');
      }

      const registeredUser = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        registrationId: data.registrationId || 'SF-SQL-0428',
        registeredAt: new Date().toISOString(),
        status: 'confirmed',
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('sql_course_user', JSON.stringify(registeredUser));
      }

      setRegistrationResult({
        success: true,
        registrationId: data.registrationId || 'SF-SQL-0428',
        message: data.message || 'You will shortly get an update on the course.',
        alreadyRegistered: false,
      });

      // Scroll to result view
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBadgeStyles = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'yellow':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'green':
      default:
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Header />

      <main className="flex-1 overflow-hidden relative">
        {/* Glow ambient background orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-accent/20 via-accent-2/15 to-accent-3/15 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-[800px] -left-40 w-[500px] h-[500px] bg-accent/10 blur-[140px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-[1400px] -right-40 w-[500px] h-[500px] bg-accent-2/10 blur-[140px] rounded-full pointer-events-none -z-10" />

        {/* ------------------------------------------------------------- */}
        {/* HERO SECTION */}
        {/* ------------------------------------------------------------- */}
        <section className="relative pt-12 pb-20 px-6 max-w-6xl mx-auto">
          {/* Top Pill / Badge */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6 animate-fade-in">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/30 shadow-sm shadow-accent/10">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              SQL Interview Syllabus — Enough for Placements
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-card-bg/80 text-muted border border-card-border">
              ⚡ 100% Clearcut Articles
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              🎯 Self-Paced
            </span>
          </div>

          {/* Main Headline */}
          <div className="text-center max-w-4xl mx-auto mb-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] mb-6">
              Master SQL for Placements with{' '}
              <span className="gradient-text">Clearcut Articles</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-2xl mx-auto">
              A self-paced, interview-adaptable SQL course designed to crack placement rounds and tech interviews with clearcut, step-by-step articles.
            </p>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <a
                href="#register-section"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-accent to-accent-2 text-white font-bold text-base shadow-xl shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] active:scale-95 transition-all duration-200"
              >
                <span>Register for Course Updates</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>

              <a
                href="#curriculum"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-card-bg/80 hover:bg-card-border/40 text-foreground font-semibold text-base border border-card-border backdrop-blur-md transition-all duration-200"
              >
                <span>Explore 9 Placement Levels</span>
                <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </a>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-10 border-t border-card-border/60 max-w-3xl mx-auto">
              <div className="p-3 rounded-xl bg-card-bg/40 border border-card-border/40">
                <div className="text-2xl sm:text-3xl font-black text-foreground">9 Levels</div>
                <div className="text-xs text-muted font-medium mt-0.5">Basics to Advanced</div>
              </div>
              <div className="p-3 rounded-xl bg-card-bg/40 border border-card-border/40">
                <div className="text-2xl sm:text-3xl font-black text-rose-500">3 Star ⭐⭐⭐</div>
                <div className="text-xs text-muted font-medium mt-0.5">Joins & Window Funcs</div>
              </div>
              <div className="p-3 rounded-xl bg-card-bg/40 border border-card-border/40">
                <div className="text-2xl sm:text-3xl font-black text-emerald-500">100%</div>
                <div className="text-xs text-muted font-medium mt-0.5">Free & Self-Paced</div>
              </div>
              <div className="p-3 rounded-xl bg-card-bg/40 border border-card-border/40">
                <div className="text-2xl sm:text-3xl font-black text-accent">Clearcut</div>
                <div className="text-xs text-muted font-medium mt-0.5">Article Walkthroughs</div>
              </div>
            </div>
          </div>

          {/* Interactive Code Preview Box */}
          <div className="mt-8 max-w-4xl mx-auto rounded-2xl border border-card-border bg-card-bg/90 shadow-2xl shadow-accent/5 backdrop-blur-xl overflow-hidden">
            {/* Window bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-card-border/30 border-b border-card-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-muted">placement_sql_pattern.sql</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-accent/15 text-accent">
                  {SAMPLE_SQL_SNIPPETS[activeSnippetIndex].difficulty}
                </span>
                <button
                  onClick={handleCopySnippet}
                  className="flex items-center gap-1 text-xs text-muted hover:text-foreground px-2.5 py-1 rounded-md bg-card-bg border border-card-border transition-colors"
                  aria-label="Copy query snippet"
                >
                  {copiedCode ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-emerald-500 text-[11px] font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                      </svg>
                      <span className="text-[11px]">Copy SQL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Snippet selection tabs */}
            <div className="flex border-b border-card-border bg-card-bg/50 px-4 pt-2 gap-2 overflow-x-auto">
              {SAMPLE_SQL_SNIPPETS.map((snippet, idx) => (
                <button
                  key={snippet.title}
                  onClick={() => setActiveSnippetIndex(idx)}
                  className={`pb-2.5 px-3 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
                    activeSnippetIndex === idx
                      ? 'border-accent text-accent font-semibold'
                      : 'border-transparent text-muted hover:text-foreground'
                  }`}
                >
                  {snippet.title}
                </button>
              ))}
            </div>

            {/* Code Body */}
            <div className="p-5 font-mono text-sm bg-neutral-950 text-emerald-300 overflow-x-auto leading-relaxed selection:bg-accent selection:text-white">
              <pre>
                <code>{SAMPLE_SQL_SNIPPETS[activeSnippetIndex].code}</code>
              </pre>
            </div>
            
            <div className="px-5 py-3 bg-card-border/20 border-t border-card-border flex items-center justify-between text-xs text-muted">
              <span>Concept: <strong className="text-foreground">{SAMPLE_SQL_SNIPPETS[activeSnippetIndex].tag}</strong></span>
              <span className="text-accent font-medium">{SAMPLE_SQL_SNIPPETS[activeSnippetIndex].interviewFor}</span>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* REGISTRATION FORM SECTION / SUCCESS MODAL */}
        {/* ------------------------------------------------------------- */}
        <section id="register-section" className="py-16 px-6 max-w-3xl mx-auto scroll-mt-24">
          {registrationResult ? (
            /* SUCCESS CONFIRMATION STATE */
            <div className="rounded-3xl border-2 border-emerald-500/40 bg-card-bg/95 p-8 sm:p-12 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl animate-fade-in text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl animate-bounce">🎉</span>
              </div>

              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 mb-4">
                Registration Confirmed
              </span>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-3">
                You&apos;re Registered, {form.name.split(' ')[0] || 'Participant'}!
              </h2>

              <p className="text-base sm:text-lg text-muted max-w-xl mx-auto mb-8 leading-relaxed">
                Thank you for registering. <strong className="text-foreground font-semibold">You will shortly get an update on the course</strong> with article drops, clearcut breakdowns, and placement practice sets.
              </p>

              {/* Registration Card */}
              <div className="max-w-md mx-auto rounded-2xl bg-card-border/25 border border-card-border p-6 mb-8 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
                  <span className="text-xs text-muted uppercase font-bold tracking-wider">Registration ID</span>
                  <span className="text-base font-black font-mono text-accent">{registrationResult.registrationId}</span>
                </div>
                <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
                  <span className="text-xs text-muted uppercase font-bold tracking-wider">Registered Email</span>
                  <span className="text-sm font-semibold text-foreground">{form.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted uppercase font-bold tracking-wider">Course Format</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-accent/15 text-accent">Self-Paced Clearcut Articles</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/sql-course/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-accent to-accent-2 text-white font-bold text-sm shadow-lg shadow-accent/30 hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Open Participant Dashboard</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-card-border/40 hover:bg-card-border text-foreground font-semibold text-sm transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                  <span>{copiedShare ? 'Link Copied!' : 'Share with Friends'}</span>
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-card-border/50 text-xs text-muted">
                Need to register another colleague or change your email?{' '}
                <button
                  onClick={() => setRegistrationResult(null)}
                  className="text-accent underline font-semibold hover:text-accent-2 ml-1"
                >
                  Submit another registration
                </button>
              </div>
            </div>
          ) : (
            /* CLEAN 2-FIELD REGISTRATION FORM */
            <div className="rounded-3xl border border-card-border bg-card-bg/95 p-8 sm:p-12 shadow-2xl shadow-accent/5 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-accent-2 to-accent-3" />

              <div className="text-center max-w-xl mx-auto mb-8">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/25 mb-3">
                  Participant Registration
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                  Register for the SQL Course
                </h2>
                <p className="text-sm sm:text-base text-muted mt-2">
                  Enter your name and email to get registered. You will shortly receive an update on the course releases.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <span>{errorMessage}</span>
                  </div>
                  {errorMessage.includes('already registered') && (
                    <div className="mt-3 pt-3 border-t border-rose-500/20 pl-8">
                      <Link
                        href="/sql-course/login"
                        className="inline-flex items-center gap-1.5 font-bold text-accent hover:underline text-xs"
                      >
                        <span>👉 Click here to Log In to your dashboard</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor={`${formId}-name`} className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                    Full Name <span className="text-accent">*</span>
                  </label>
                  <input
                    id={`${formId}-name`}
                    type="text"
                    required
                    placeholder="e.g. Alex Johnson"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl bg-card-bg border border-card-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-foreground placeholder:text-muted/60 text-sm transition-all"
                  />
                </div>

                <div>
                  <label htmlFor={`${formId}-email`} className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                    Email Address <span className="text-accent">*</span>
                  </label>
                  <input
                    id={`${formId}-email`}
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl bg-card-bg border border-card-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-foreground placeholder:text-muted/60 text-sm transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor={`${formId}-password`} className="block text-xs font-bold text-foreground uppercase tracking-wider">
                      Set Password <span className="text-accent">*</span>
                    </label>
                    <span className="text-[11px] text-muted">Min 6 characters</span>
                  </div>
                  <div className="relative">
                    <input
                      id={`${formId}-password`}
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-4 py-3.5 pr-12 rounded-xl bg-card-bg border border-card-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-foreground placeholder:text-muted/60 text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-foreground transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-accent via-accent-2 to-accent text-white font-bold text-base shadow-xl shadow-accent/25 hover:shadow-accent/40 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Registering Participant...</span>
                    </>
                  ) : (
                    <>
                      <span>Register for Free Access</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-muted">
                    Already registered?{' '}
                    <Link
                      href="/sql-course/login"
                      className="text-accent font-bold hover:underline"
                    >
                      Login to Participant Dashboard →
                    </Link>
                  </p>
                </div>

                <p className="text-center text-xs text-muted/70 leading-relaxed">
                  🔒 By registering, you&apos;ll be the first to receive updates on course article releases. No spam.
                </p>
              </form>
            </div>
          )}
        </section>

        {/* ------------------------------------------------------------- */}
        {/* COMPREHENSIVE INTERVIEW-ADAPTABLE SYLLABUS SECTION */}
        {/* ------------------------------------------------------------- */}
        <section id="curriculum" className="py-16 px-6 max-w-5xl mx-auto scroll-mt-24 border-t border-card-border/50">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 mb-3">
              Placement-Ready Roadmap
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              SQL Interview Syllabus — Enough for Placements
            </h2>
            <p className="text-sm sm:text-base text-muted mt-2">
              Structured into 9 progressive levels covering every fundamental, join pattern, window function, and theory concept asked in tech placements.
            </p>
          </div>

          <div className="space-y-4">
            {CURRICULUM_LEVELS.map((lvl) => {
              const isOpen = expandedLevel === lvl.id;
              const badgeClass = getBadgeStyles(lvl.badgeColor);

              return (
                <div
                  key={lvl.id}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? 'border-accent bg-card-bg shadow-lg shadow-accent/5'
                      : 'border-card-border bg-card-bg/60 hover:bg-card-bg'
                  }`}
                >
                  <button
                    onClick={() => setExpandedLevel(isOpen ? null : lvl.id)}
                    className="w-full p-6 text-left flex items-start sm:items-center justify-between gap-4"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <span className="text-sm font-bold font-mono px-2.5 py-1 rounded-lg bg-card-border/40 text-foreground">
                        {lvl.levelTag}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-base sm:text-lg font-bold text-foreground">{lvl.title}</h3>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                            {lvl.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-muted font-medium">{lvl.topics.length} Key Topics Covered</p>
                      </div>
                    </div>

                    <div className={`p-2 rounded-xl bg-card-border/40 text-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent' : ''}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 border-t border-card-border/60 animate-fade-in space-y-4">
                      <p className="text-sm text-muted leading-relaxed">{lvl.description}</p>
                      
                      <div className="rounded-xl bg-card-border/20 p-4">
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2.5">
                          Topics in this Level:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {lvl.topics.map((topic, i) => (
                            <div key={i} className="text-xs sm:text-sm text-foreground/90 flex items-start gap-2">
                              <span className="text-accent font-bold mt-0.5">✦</span>
                              <span>{topic}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Register CTA inside Curriculum */}
          <div className="mt-12 text-center">
            <a
              href="#register-section"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-white font-bold text-sm shadow-lg shadow-accent/25 hover:bg-accent/90 hover:scale-[1.02] transition-all"
            >
              <span>Register for Course Updates</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* WHY ARTICLE-BASED LEARNING WINS */}
        {/* ------------------------------------------------------------- */}
        <section className="py-16 px-6 max-w-6xl mx-auto border-t border-card-border/50">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 mb-3">
              Why Clearcut Articles
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Built Specifically for Placements & Rapid Revision
            </h2>
            <p className="text-sm sm:text-base text-muted mt-2">
              Engineering interviews require clear mental models and fast 5-minute revision—not scrubbing through 40-hour video playlists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-card-bg border border-card-border hover:border-accent/40 shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-2xl mb-5">
                ⚡
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">5-Minute Pre-Interview Revision</h3>
              <p className="text-sm text-muted leading-relaxed">
                Need to quickly refresh Window Frame boundaries or Subquery syntax 20 minutes before your round? Skim the exact query breakdown in seconds.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-card-bg border border-card-border hover:border-accent/40 shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-accent-2/10 border border-accent-2/20 flex items-center justify-center text-2xl mb-5">
                📐
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Clear Step-by-Step Flow</h3>
              <p className="text-sm text-muted leading-relaxed">
                Visualizing how rows are joined, grouped, and ranked makes the mental model stick permanently during high-pressure live coding.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-card-bg border border-card-border hover:border-accent/40 shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl mb-5">
                📋
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Copy-Paste Placement Schemas</h3>
              <p className="text-sm text-muted leading-relaxed">
                Every article includes ready-to-run tables and test data so you can immediately verify queries in your browser or local database.
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* FAQS SECTION */}
        {/* ------------------------------------------------------------- */}
        <section className="py-16 px-6 max-w-4xl mx-auto border-t border-card-border/50">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 mb-3">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-black tracking-tight text-foreground">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-card-bg border border-card-border">
              <h3 className="text-base font-bold text-foreground mb-2">Is the course self-paced?</h3>
              <p className="text-sm text-muted leading-relaxed">
                Yes! All articles and query walkthroughs are 100% self-paced so you can prepare according to your placement drive timeline.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card-bg border border-card-border">
              <h3 className="text-base font-bold text-foreground mb-2">When do registered participants get updates?</h3>
              <p className="text-sm text-muted leading-relaxed">
                Once registered, you will shortly get email updates as each level&apos;s clearcut articles and interview cheat sheets drop.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card-bg border border-card-border">
              <h3 className="text-base font-bold text-foreground mb-2">Is this syllabus enough for placement drives?</h3>
              <p className="text-sm text-muted leading-relaxed">
                Yes! The 9 levels cover all essential concepts (from SELECT and Aggregations up to JOINS ⭐⭐⭐, Subqueries ⭐⭐⭐, and Window Functions ⭐⭐⭐) asked in campus and off-campus placements.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card-bg border border-card-border">
              <h3 className="text-base font-bold text-foreground mb-2">Is there any fee?</h3>
              <p className="text-sm text-muted leading-relaxed">
                No fee! Early registration is completely free.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SqlCourseClient;
