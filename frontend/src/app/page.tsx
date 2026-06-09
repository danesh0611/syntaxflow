'use client';

import { useState, useEffect, useRef } from 'react';
import { Article, Category } from '@/lib/types';
import { contentSource } from '@/lib/cms';
import { ArticleCard } from '@/components/ArticleCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const articlesRef = useRef<HTMLElement>(null);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setTimeout(() => {
      articlesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [articlesData, categoriesData] = await Promise.all([
          contentSource.getArticles(),
          contentSource.getCategories(),
        ]);
        setArticles(Array.isArray(articlesData) ? articlesData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setArticles([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredArticles = selectedCategory
    ? articles.filter((a) => a.category === selectedCategory)
    : articles;

  const featuredArticle = filteredArticles[0] ?? null;
  const restArticles = filteredArticles.slice(1);

  return (
    <>
      <Header />
      <main className="max-w-6xl w-full mx-auto px-6 py-12 flex-1">

        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="relative mb-20 text-center py-16 md:py-24 overflow-hidden">
          {/* Floating gradient orbs */}
          <div
            className="absolute rounded-full blur-[80px] opacity-30 animate-float pointer-events-none"
            style={{
              width: 420, height: 420,
              background: 'radial-gradient(circle, #6366f1 0%, #4f46e5 50%, transparent 70%)',
              top: '10%', left: '5%',
            }}
          />
          <div
            className="absolute rounded-full blur-[100px] opacity-25 animate-float-medium pointer-events-none"
            style={{
              width: 360, height: 360,
              background: 'radial-gradient(circle, #8b5cf6 0%, #7c3aed 50%, transparent 70%)',
              top: '0%', right: '8%',
            }}
          />
          <div
            className="absolute rounded-full blur-[90px] opacity-20 animate-float-slow pointer-events-none"
            style={{
              width: 300, height: 300,
              background: 'radial-gradient(circle, #ec4899 0%, #db2777 50%, transparent 70%)',
              bottom: '0%', left: '40%',
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Ticker badge */}
            <div className="animate-ticker inline-flex items-center gap-2 bg-accent/10 border border-accent/25 rounded-full px-4 py-1.5 text-xs font-bold text-accent mb-8 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Tech insights · DSA · Tutorials
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-[1.05] animate-fade-up delay-100">
              Insights for the{' '}
              <br className="hidden sm:block" />
              <span className="gradient-text">Modern Developer</span>
            </h1>

            <p className="text-lg md:text-xl text-muted max-w-xl mx-auto leading-relaxed animate-fade-up delay-200 mb-10">
              Deep-dives, systems architecture, coding tutorials, and the latest in tech.
            </p>

            <div className="animate-fade-up delay-300 flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-accent text-white font-bold px-6 py-3 rounded-2xl hover:bg-accent/90 active:scale-95 transition-all duration-200 shadow-xl shadow-accent/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Explore Articles
              </Link>
              <Link
                href="/#articles"
                className="inline-flex items-center gap-2 bg-card-bg border border-card-border text-foreground font-bold px-6 py-3 rounded-2xl hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 active:scale-95 transition-all duration-200"
              >
                Latest Articles
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── CATEGORIES ────────────────────────────────────── */}
        {categories.length > 0 && (
          <section className="mb-14 animate-fade-up delay-400" id="categories">
            <h2 className="text-sm font-bold mb-4 tracking-widest text-muted uppercase flex items-center gap-2">
              <span className="w-4 h-px bg-accent/60 inline-block" />
              Browse Categories
              <span className="w-4 h-px bg-accent/60 inline-block" />
            </h2>
            <div className="flex flex-wrap gap-2.5">
              <button
                id="category-all"
                onClick={() => handleCategorySelect('')}
                className={`px-5 py-2 rounded-xl text-sm font-bold border transition-all duration-300 cursor-pointer ${
                  selectedCategory === ''
                    ? 'bg-accent border-accent text-white shadow-lg shadow-accent/25 scale-[1.03]'
                    : 'bg-card-bg border-card-border text-muted hover:text-foreground hover:border-accent/40 hover:shadow-md hover:shadow-accent/10'
                }`}
              >
                All Articles
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  id={`category-${cat.slug}`}
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold border transition-all duration-300 cursor-pointer ${
                    selectedCategory === cat.name
                      ? 'bg-accent border-accent text-white shadow-lg shadow-accent/25 scale-[1.03]'
                      : 'bg-card-bg border-card-border text-muted hover:text-foreground hover:border-accent/40 hover:shadow-md hover:shadow-accent/10'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── ARTICLES ──────────────────────────────────────── */}
        <section id="articles" ref={articlesRef} style={{ scrollMarginTop: '80px' }}>
          {/* Section header */}
          <div className="flex items-center justify-between mb-8 animate-fade-up delay-500">
            <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
              <span className="w-1.5 h-7 rounded-full bg-gradient-to-b from-accent to-accent-2 flex-shrink-0" />
              {selectedCategory ? selectedCategory : 'Latest Articles'}
            </h2>
            <div className="flex items-center gap-2">
              {selectedCategory && (
                <button
                  onClick={() => handleCategorySelect('')}
                  className="flex items-center gap-1.5 text-xs font-bold text-accent bg-accent/10 border border-accent/25 px-3 py-1.5 rounded-xl hover:bg-accent/15 transition-all duration-200 cursor-pointer"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear filter
                </button>
              )}
              <span className="text-xs font-bold text-muted bg-card-bg border border-card-border px-3.5 py-1.5 rounded-xl">
                {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
              <p className="text-muted text-sm font-medium">Loading articles...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="py-24 bg-card-bg/40 border border-dashed border-card-border rounded-2xl text-center">
              <div className="max-w-sm mx-auto px-6">
                <svg className="w-12 h-12 text-muted/40 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                <h3 className="text-lg font-bold mb-1 text-foreground">No articles yet</h3>
                <p className="text-muted text-sm">Nothing published in this category yet. Check back soon.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Featured article — first article, wide horizontal card */}
              {featuredArticle && (
                <Link href={`/articles/${featuredArticle.slug}`} className="group block mb-8 animate-fade-up delay-500">
                  <div className="card-glow bg-card-bg border border-card-border rounded-[1.125rem] overflow-hidden">
                    <div className="flex flex-col md:flex-row min-h-[260px]">
                      {/* Image */}
                      <div className="md:w-[42%] overflow-hidden flex-shrink-0 relative">
                        {featuredArticle.coverImage ? (
                          <img
                            src={featuredArticle.coverImage}
                            alt={featuredArticle.title}
                            className="w-full h-56 md:h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <div className="w-full h-56 md:h-full flex items-center justify-center relative overflow-hidden"
                            style={{ background: 'linear-gradient(135deg, #0d1035 0%, #1a0a2e 50%, #0d1035 100%)' }}>
                            <div className="absolute w-40 h-40 rounded-full blur-3xl opacity-30"
                              style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
                            <span className="relative text-xs font-black tracking-[0.3em] uppercase text-indigo-400/50">SyntaxFlow</span>
                          </div>
                        )}
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card-bg/20 hidden md:block pointer-events-none" />
                      </div>

                      {/* Content */}
                      <div className="md:w-[58%] p-7 md:p-9 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-[11px] font-bold text-accent tracking-wider uppercase bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-lg">
                            {featuredArticle.category}
                          </span>
                          <span className="text-[11px] font-bold text-muted/70 uppercase tracking-wider bg-card-border/50 border border-card-border px-2.5 py-1 rounded-lg">
                            ✦ Featured
                          </span>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight text-foreground mb-4 group-hover:text-accent transition-colors duration-300">
                          {featuredArticle.title}
                        </h2>

                        <p className="text-muted leading-relaxed mb-6 line-clamp-3 text-sm md:text-base">
                          {featuredArticle.excerpt}
                        </p>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-accent-2/30 border border-accent/25 flex items-center justify-center text-[10px] font-black text-accent flex-shrink-0">
                              {featuredArticle.author.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{featuredArticle.author}</p>
                              <p className="text-xs text-muted">{new Date(featuredArticle.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-accent flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                            Read article
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Rest of articles — 3-col grid */}
              {restArticles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {restArticles.map((article, i) => (
                    <ArticleCard key={article.id} article={article} index={i} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
