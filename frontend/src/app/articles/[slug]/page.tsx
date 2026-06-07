import { Metadata } from 'next';
import { contentSource } from '@/lib/cms';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { RichContent } from '@/components/RichContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await contentSource.getArticleBySlug(slug);
    if (article) {
      return {
        title: `${article.title} | SyntaxFlow`,
        description: article.excerpt || `Read ${article.title} on SyntaxFlow.`,
        openGraph: {
          title: article.title,
          description: article.excerpt || `Read ${article.title} on SyntaxFlow.`,
          images: article.coverImage ? [article.coverImage] : [],
          type: 'article',
        },
        twitter: {
          card: 'summary_large_image',
          title: article.title,
          description: article.excerpt || `Read ${article.title} on SyntaxFlow.`,
          images: article.coverImage ? [article.coverImage] : [],
        },
      };
    }
  } catch (error) {
    console.error('Failed to generate dynamic metadata:', error);
  }

  return {
    title: 'Article Not Found | SyntaxFlow',
    description: 'The requested article could not be found.',
  };
}

export async function generateStaticParams() {
  try {
    const articles = await contentSource.getArticles();
    if (Array.isArray(articles)) {
      return articles.map((article) => ({
        slug: article.slug,
      }));
    }
  } catch (error) {
    console.error('Failed to generate static params:', error);
  }
  return [];
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  let article = null;
  let error = '';

  try {
    article = await contentSource.getArticleBySlug(slug);
  } catch (err) {
    error = 'Failed to load article';
    console.error(err);
  }

  if (!article) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-16 flex-1 flex flex-col items-center justify-center text-center">
          <svg className="w-12 h-12 text-red-500/80 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-foreground font-semibold text-lg mb-4">{error || 'Article not found'}</p>
          <Link href="/" className="text-sm font-semibold text-accent bg-accent/10 border border-accent/20 hover:bg-accent/15 px-4 py-2 rounded-xl transition">
            ← Back to articles
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const formattedDate = new Date(article.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    'headline': article.title,
    'description': article.excerpt || article.title,
    'image': article.coverImage ? [article.coverImage] : [],
    'datePublished': article.createdAt,
    'dateModified': article.updatedAt || article.createdAt,
    'author': [{
      '@type': 'Person',
      'name': article.author,
    }],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="max-w-4xl w-full mx-auto px-6 py-12 flex-1">
        <Link 
          href="/" 
          className="text-xs font-semibold text-muted hover:text-foreground flex items-center gap-1.5 bg-card-bg border border-card-border px-3.5 py-2 rounded-xl w-fit transition-colors mb-10 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to articles
        </Link>

        <article className="relative">
          {article.coverImage && (
            <div className="mb-10 rounded-2xl overflow-hidden aspect-video max-h-[440px] border border-card-border shadow-lg shadow-black/5">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <header className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-bold text-accent tracking-wider uppercase bg-accent/10 border border-accent/25 px-2.5 py-1 rounded-md">
                {article.category}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight text-foreground">
              {article.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted border-b border-card-border/60 pb-6">
              <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-[10px] font-black text-accent">
                {article.author.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="font-semibold text-foreground">{article.author}</span>
                <span className="mx-2 text-muted/50">•</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </header>

          {article.excerpt && (
            <div className="text-lg md:text-xl text-muted font-medium mb-10 pl-6 border-l-2 border-accent italic leading-relaxed">
              {article.excerpt}
            </div>
          )}

          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {article.tags.filter(tag => tag.trim()).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-card-bg border border-card-border text-foreground px-3 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="article-content max-w-none mb-12 text-foreground/95 leading-relaxed">
            <RichContent value={article.content} />
          </div>

          <div className="border-t border-card-border/60 pt-8">
            <div className="bg-card-bg border border-card-border p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Author: {article.author}</h4>
                <p className="text-xs text-muted">Thank you for reading! Join our community to receive more tech insight articles.</p>
              </div>
              <span className="text-xs text-muted/70 bg-card-bg border border-card-border px-3 py-1.5 rounded-lg w-fit">
                Last updated: {formattedDate}
              </span>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
