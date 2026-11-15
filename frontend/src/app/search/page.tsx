'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Article } from '@/lib/types';
import { contentSource } from '@/lib/cms';
import { ArticleCard } from '@/components/ArticleCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState(query);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery) {
      const fetchResults = async () => {
        try {
          setLoading(true);
          let results = await contentSource.searchArticles(searchQuery);
          if (Array.isArray(results)) {
            // Check if user is logged into SQL course
            const isUserLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('sql_course_user');
            if (!isUserLoggedIn) {
              results = results.filter((a) => a.category?.trim().toLowerCase() !== 'sql');
            }
          }
          setArticles(Array.isArray(results) ? results : []);
        } catch (error) {
          console.error('Search failed:', error);
          setArticles([]);
        } finally {
          setLoading(false);
        }
      };

      fetchResults();
    }
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const q = formData.get('query') as string;
    setSearchQuery(q);
    if (!q) {
      setArticles([]);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1">
        <div className="mb-8 border-b border-card-border pb-6">
          <div className="font-mono text-xs uppercase tracking-wider text-muted mb-2">Library Search</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-2">Archive Search</h1>
          <p className="text-sm text-muted">Scan through algorithms, systems architecture guides, and technical tutorials.</p>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              name="query"
              placeholder="Search by title, concepts, or keywords (e.g. CTEs, Dynamic Programming)..."
              defaultValue={searchQuery}
              className="flex-1 px-3.5 py-2.5 bg-card-bg border border-card-border rounded-lg text-foreground placeholder:text-muted/50 focus:outline-none focus:border-foreground transition-colors text-sm"
            />
            <button
              type="submit"
              className="bg-foreground text-background px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity font-semibold text-xs cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {searchQuery && (
          <div className="mb-6 border-b border-card-border/60 pb-3 flex items-center justify-between text-xs font-mono text-muted">
            <span>
              {loading 
                ? 'SCANNING ARCHIVE...' 
                : `FOUND ${articles.length} RESULT${articles.length !== 1 ? 'S' : ''} FOR "${searchQuery.toUpperCase()}"`}
            </span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin"></div>
            <p className="text-muted text-sm">Loading results...</p>
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : searchQuery ? (
          <div className="py-16 bg-card-bg/30 border border-dashed border-card-border rounded-2xl">
            <div className="text-center max-w-sm mx-auto px-6">
              <svg className="w-12 h-12 text-muted/50 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-bold mb-1 text-foreground">No matches found</h3>
              <p className="text-muted text-sm">We couldn't find any articles matching your search query. Try using different keywords or checking spelling.</p>
            </div>
          </div>
        ) : (
          <div className="py-20 bg-card-bg/20 border border-dashed border-card-border rounded-2xl">
            <div className="text-center max-w-sm mx-auto px-6">
              <svg className="w-10 h-10 text-muted/40 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-muted text-sm">Enter a search query to scan through articles, tags, or topics.</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin"></div>
        <p className="text-muted text-sm">Loading search...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
