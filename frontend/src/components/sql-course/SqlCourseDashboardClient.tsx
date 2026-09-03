'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Article } from '@/lib/types';

interface UserSession {
  name: string;
  email: string;
  registrationId: string;
  registeredAt: string;
  status: string;
  readArticles?: string[];
}

interface SqlCourseDashboardClientProps {
  initialArticles?: Article[];
}

export const SqlCourseDashboardClient: React.FC<SqlCourseDashboardClientProps> = ({
  initialArticles = [],
}) => {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [readSlugs, setReadSlugs] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check user session & load personalized read articles
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sql_course_user');
      if (stored) {
        try {
          const parsedUser: UserSession = JSON.parse(stored);
          setUser(parsedUser);

          // 1. Initial load from local user session or email-keyed localStorage
          const localKey = `sql_read_articles_${parsedUser.email}`;
          const localSaved = localStorage.getItem(localKey);
          let initialRead: string[] = [];

          if (localSaved) {
            try {
              initialRead = JSON.parse(localSaved);
            } catch {}
          } else if (Array.isArray(parsedUser.readArticles)) {
            initialRead = parsedUser.readArticles;
          }

          setReadSlugs(initialRead);

          // 2. Fetch fresh personalized progress from Firestore in the background
          fetch(`/api/sql-course/progress?email=${encodeURIComponent(parsedUser.email)}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data && Array.isArray(data.readArticles)) {
                setReadSlugs(data.readArticles);
                localStorage.setItem(localKey, JSON.stringify(data.readArticles));
              }
            })
            .catch((err) => console.error('Error fetching progress:', err));
        } catch {
          router.push('/sql-course/login');
        }
      } else {
        router.push('/sql-course/login');
      }

      setLoading(false);
    }
  }, [router]);

  // Client-side fetch to ensure latest SQL articles from Sanity
  const fetchSqlArticles = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/content?resource=articles');
      if (res.ok) {
        const allArticles = (await res.json()) as Article[];
        if (Array.isArray(allArticles)) {
          const sqlOnly = allArticles.filter(
            (a) =>
              a.category?.toLowerCase() === 'sql' ||
              a.category?.toLowerCase().includes('sql') ||
              a.tags?.some((t) => t.toLowerCase() === 'sql')
          );
          setArticles(sqlOnly);
        }
      }
    } catch (err) {
      console.error('Failed to refresh SQL articles:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSqlArticles();
  }, []);

  const handleToggleRead = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    try {
      let updated: string[];
      if (readSlugs.includes(slug)) {
        updated = readSlugs.filter((s) => s !== slug);
      } else {
        updated = [...readSlugs, slug];
      }
      setReadSlugs(updated);

      // Save to participant's personalized localStorage key
      const localKey = `sql_read_articles_${user.email}`;
      localStorage.setItem(localKey, JSON.stringify(updated));
      localStorage.setItem('sql_read_articles', JSON.stringify(updated));

      // Sync with Firestore
      fetch('/api/sql-course/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, readArticles: updated }),
      }).catch((err) => console.error('Failed to sync progress:', err));
    } catch (err) {
      console.error('Failed to toggle read slug:', err);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sql_course_user');
    }
    router.push('/sql-course/login');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-muted">Loading your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  const completedCount = articles.filter((a) => readSlugs.includes(a.slug)).length;
  const progressPercent = articles.length > 0 ? Math.round((completedCount / articles.length) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 relative">
        {/* Glow ambient background */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-accent/15 via-accent-2/10 to-accent-3/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* ------------------------------------------------------------- */}
        {/* PARTICIPANT HEADER */}
        {/* ------------------------------------------------------------- */}
        <div className="rounded-3xl border border-card-border bg-card-bg/95 p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-accent/5 mb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                  Welcome, <span className="gradient-text">{user.name}</span> 👋
                </h1>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/30">
                  SQL Course Enrolled
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted">
                <span>
                  Email: <strong className="text-foreground">{user.email}</strong>
                </span>
                <span>•</span>
                <span>
                  Reg ID: <strong className="font-mono text-accent">{user.registrationId}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchSqlArticles}
                disabled={isRefreshing}
                className="px-4 py-2.5 rounded-xl bg-card-border/30 hover:bg-card-border/60 text-xs font-semibold text-foreground flex items-center gap-1.5 transition-all"
                title="Refresh latest SQL articles from Sanity"
              >
                <svg
                  className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-accent' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/20 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Personalized Reading Progress Bar */}
          {articles.length > 0 && (
            <div className="mt-6 pt-6 border-t border-card-border/60">
              <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                <span className="font-bold text-foreground">Your Learning Progress</span>
                <span className="font-black font-mono text-accent">
                  {completedCount} of {articles.length} Lessons Completed ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-card-border/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent via-accent-2 to-emerald-500 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.max(articles.length > 0 ? 5 : 0, progressPercent)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SQL COURSE ARTICLES FROM SANITY */}
        {/* ------------------------------------------------------------- */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                <h2 className="text-xl sm:text-2xl font-black text-foreground">
                  SQL Course Articles & Lessons
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted">
                Personalized lesson checklist and interview articles synced from Sanity.
              </p>
            </div>

            <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-card-border/30 text-muted border border-card-border self-start sm:self-auto">
              {articles.length} {articles.length === 1 ? 'Article' : 'Articles'} Available
            </div>
          </div>

          {/* Articles Grid */}
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {articles.map((article) => {
                const isRead = readSlugs.includes(article.slug);
                const formattedDate = new Date(article.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <article
                    key={article.id || article.slug}
                    className={`group relative flex flex-col h-full bg-card-bg border rounded-[1.125rem] overflow-hidden transition-all duration-300 ${
                      isRead
                        ? 'border-emerald-500/40 shadow-sm shadow-emerald-500/5'
                        : 'border-card-border hover:border-accent/40 shadow-card hover:shadow-card-hover'
                    }`}
                  >
                    {/* Cover Image */}
                    {article.coverImage ? (
                      <div className="relative aspect-video w-full overflow-hidden bg-card-bg">
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Status Badge overlay */}
                        <div className="absolute top-3 right-3 z-10">
                          {isRead ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500 text-white shadow-md">
                              ✓ Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-neutral-900/80 text-white backdrop-blur-md border border-white/10">
                              📖 Available
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="relative aspect-video w-full overflow-hidden flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #0d1035 0%, #1a0a2e 50%, #0d1035 100%)' }}
                      >
                        <span className="text-xs font-black tracking-[0.2em] uppercase text-indigo-400/60">
                          SQL Masterclass
                        </span>
                        <div className="absolute top-3 right-3 z-10">
                          {isRead && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500 text-white shadow-md">
                              ✓ Completed
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col flex-1 p-5">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-bold text-accent tracking-wider uppercase bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-lg">
                          {article.category || 'SQL'}
                        </span>
                        <span className="text-[11px] text-muted">{formattedDate}</span>
                      </div>

                      {/* Title */}
                      <h2 className="text-base font-bold mb-3 line-clamp-2 leading-snug tracking-tight">
                        <Link
                          href={`/articles/${article.slug}`}
                          className="text-foreground hover:text-accent transition-colors duration-200"
                        >
                          {article.title}
                        </Link>
                      </h2>

                      {/* Excerpt */}
                      <p className="text-muted text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
                        {article.excerpt}
                      </p>

                      {/* Bottom action bar */}
                      <div className="pt-3.5 border-t border-card-border/50 flex items-center justify-between gap-3">
                        <button
                          onClick={(e) => handleToggleRead(article.slug, e)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isRead
                              ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-card-border/30 hover:bg-card-border/60 text-muted hover:text-foreground border-card-border'
                          }`}
                          title={isRead ? 'Mark as unread' : 'Mark as read'}
                        >
                          <span>{isRead ? '✓ Read' : '○ Mark as Read'}</span>
                        </button>

                        <Link
                          href={`/articles/${article.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:text-accent-2 transition-colors"
                        >
                          <span>Read Lesson</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* Empty State when no SQL articles are in Sanity yet */
            <div className="rounded-3xl border border-dashed border-card-border bg-card-bg/60 p-12 text-center max-w-2xl mx-auto my-8">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 text-3xl">
                📑
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                SQL Course Articles are Being Prepared!
              </h3>
              <p className="text-xs sm:text-sm text-muted max-w-md mx-auto mb-6 leading-relaxed">
                Whenever a new article in the <strong className="text-accent">&quot;SQL&quot;</strong> category is published in Sanity Studio, it will instantly reflect right here on your personalized dashboard.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/25 text-accent text-xs font-semibold">
                <span>⚡ Auto-syncs live from Sanity CMS</span>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SqlCourseDashboardClient;
