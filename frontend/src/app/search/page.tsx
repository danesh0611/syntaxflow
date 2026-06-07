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
          const results = await contentSource.searchArticles(searchQuery);
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
      <main className="max-w-6xl w-full mx-auto px-6 py-12 flex-1">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-2">Search Articles</h1>
          <p className="text-sm text-muted">Find guides, tutorials, and documentations across the site.</p>
        </div>

        <form onSubmit={handleSearch} className="mb-10">
          <div className="flex gap-2">
            <input
              type="text"
              name="query"
              placeholder="Search by title, content, or tags..."
              defaultValue={searchQuery}
              className="flex-1 px-4 py-3 bg-card-bg border border-card-border rounded-xl text-foreground placeholder-muted/65 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all text-sm"
            />
            <button
              type="submit"
              className="bg-accent text-white px-6 py-3 rounded-xl hover:opacity-95 transition-all font-semibold text-sm shadow-lg shadow-accent-glow/20 cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {searchQuery && (
          <div className="mb-8 border-b border-card-border/50 pb-4">
            <p className="text-sm text-muted">
              {loading 
                ? 'Searching...' 
                : `Found ${articles.length} result${articles.length !== 1 ? 's' : ''} for "${searchQuery}"`}
            </p>
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
