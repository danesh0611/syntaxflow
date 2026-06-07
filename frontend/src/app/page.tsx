'use client';

import { useState, useEffect } from 'react';
import { Article, Category } from '@/lib/types';
import { contentSource } from '@/lib/cms';
import { ArticleCard } from '@/components/ArticleCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <Header />
      <main className="max-w-6xl w-full mx-auto px-6 py-16 flex-1">
        {/* Hero Section */}
        <section className="mb-20 text-center relative py-12 md:py-16">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl -z-10 rounded-full max-w-4xl mx-auto"></div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            Insights for the <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Modern Developer
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            Deep-dives, systems architecture, coding tutorials, and latest tech insights.
          </p>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section className="mb-16">
            <h2 id="categories" className="text-xl font-bold mb-6 tracking-tight text-foreground flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-accent"></span>
              Browse Categories
            </h2>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all duration-300 cursor-pointer ${
                  selectedCategory === ''
                    ? 'bg-accent border-accent text-white shadow-lg shadow-accent-glow/20'
                    : 'bg-card-bg border-card-border text-muted hover:text-foreground hover:border-card-border/80'
                }`}
              >
                All Articles
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all duration-300 cursor-pointer ${
                    selectedCategory === cat.name
                      ? 'bg-accent border-accent text-white shadow-lg shadow-accent-glow/20'
                      : 'bg-card-bg border-card-border text-muted hover:text-foreground hover:border-card-border/80'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Articles Grid */}
        <section>
          <div className="border-b border-card-border/50 pb-5 mb-10 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {selectedCategory ? `${selectedCategory} Articles` : 'Latest Articles'}
            </h2>
            <span className="text-xs font-semibold text-muted bg-card-bg border border-card-border px-3 py-1.5 rounded-lg">
              {filteredArticles.length} Article{filteredArticles.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin"></div>
              <p className="text-muted text-sm">Loading articles...</p>
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="py-20 bg-card-bg/30 border border-dashed border-card-border rounded-2xl">
              <div className="text-center max-w-sm mx-auto px-6">
                <svg className="w-12 h-12 text-muted/50 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                <h3 className="text-lg font-bold mb-1 text-foreground">No articles found</h3>
                <p className="text-muted text-sm">We couldn't find any articles published under this category yet.</p>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
