import { Metadata } from 'next';
import { contentSource } from '@/lib/cms';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { RichContent } from '@/components/RichContent';
import { getBaseUrl } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await contentSource.getArticleBySlug(slug);
    if (article) {
      const description = article.excerpt || `Read ${article.title} on SyntaxFlow.`;
      return {
        title: `${article.title} | SyntaxFlow`,
        description,
        keywords: article.tags.length > 0 ? article.tags : [article.category, 'SyntaxFlow', 'programming'],
        authors: [{ name: article.author }],
        category: article.category,
        alternates: {
          canonical: `/articles/${slug}`,
        },
        openGraph: {
          title: article.title,
          description,
          images: article.coverImage
            ? [{ url: article.coverImage, alt: article.title }]
            : [],
          type: 'article',
          publishedTime: article.createdAt,
          modifiedTime: article.updatedAt || article.createdAt,
          authors: [article.author],
          tags: article.tags,
          section: article.category,
          siteName: 'SyntaxFlow',
        },
        twitter: {
          card: 'summary_large_image',
          title: article.title,
          description,
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
    robots: { index: false, follow: false },
  };
}

export async function generateStaticParams() {
  try {
    const articles = await contentSource.getArticles();
    if (Array.isArray(articles)) {
      return articles.map((article) => ({ slug: article.slug }));
    }
  } catch (error) {
    console.error('Failed to generate static params:', error);
  }
  return [];
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const baseUrl = getBaseUrl();
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

  const articleUrl = `${baseUrl}/articles/${slug}`;

  // ── JSON-LD: TechArticle ──────────────────────────────────────
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.title,
    description: article.excerpt || article.title,
    image: article.coverImage ? [article.coverImage] : [],
    datePublished: article.createdAt,
    dateModified: article.updatedAt || article.createdAt,
    author: [{
      '@type': 'Person',
      name: article.author,
    }],
    publisher: {
      '@type': 'Organization',
      name: 'SyntaxFlow',
      url: baseUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    url: articleUrl,
    keywords: article.tags.join(', '),
    articleSection: article.category,
    inLanguage: 'en-US',
  };

  // ── JSON-LD: BreadcrumbList ──────────────────────────────────
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: article.category,
        item: `${baseUrl}/#categories`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: articleUrl,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Header />
      <main className="max-w-4xl w-full mx-auto px-6 py-10 flex-1">

        {/* ── BREADCRUMBS ─────────────────────────────────── */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-1 text-xs text-muted flex-wrap">
            <li>
              <Link
                href="/"
                className="hover:text-foreground transition-colors duration-200 font-medium"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-3 h-3 text-muted/40 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <Link
                href="/#categories"
                className="hover:text-foreground transition-colors duration-200 font-medium"
              >
                {article.category}
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-3 h-3 text-muted/40 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li
              aria-current="page"
              className="text-foreground/80 font-semibold truncate max-w-[260px] sm:max-w-sm"
              title={article.title}
            >
              {article.title}
            </li>
          </ol>
        </nav>

        <article className="relative">
          {/* Cover Image */}
          {article.coverImage && (
            <div className="mb-10 rounded-2xl overflow-hidden aspect-video max-h-[440px] border border-card-border shadow-xl shadow-black/10">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-bold text-accent tracking-wider uppercase bg-accent/10 border border-accent/25 px-2.5 py-1 rounded-lg">
                {article.category}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight text-foreground">
              {article.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted border-b border-card-border/60 pb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-accent-2/30 border border-accent/25 flex items-center justify-center text-[10px] font-black text-accent flex-shrink-0">
                {article.author.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="font-semibold text-foreground">{article.author}</span>
                <span className="mx-2 text-muted/50">·</span>
                <time dateTime={article.createdAt}>{formattedDate}</time>
              </div>
            </div>
          </header>

          {/* Excerpt */}
          {article.excerpt && (
            <div className="text-lg md:text-xl text-muted font-medium mb-10 pl-6 border-l-2 border-accent italic leading-relaxed">
              {article.excerpt}
            </div>
          )}

          {/* Tags */}
          {article.tags.filter(t => t.trim()).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {article.tags.filter(tag => tag.trim()).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-card-bg border border-card-border text-muted px-3 py-1 rounded-lg"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="article-content max-w-none mb-12 text-foreground/95 leading-relaxed">
            <RichContent value={article.content} />
          </div>

          {/* Author Card */}
          <div className="border-t border-card-border/60 pt-8">
            <div className="bg-card-bg border border-card-border p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/30 to-accent-2/30 border border-accent/25 flex items-center justify-center text-sm font-black text-accent flex-shrink-0">
                  {article.author.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{article.author}</h4>
                  <p className="text-xs text-muted">Thank you for reading! More articles on SyntaxFlow.</p>
                </div>
              </div>
              <time
                dateTime={article.updatedAt || article.createdAt}
                className="text-xs text-muted/70 bg-background border border-card-border px-3 py-1.5 rounded-lg w-fit flex-shrink-0"
              >
                Updated: {formattedDate}
              </time>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
