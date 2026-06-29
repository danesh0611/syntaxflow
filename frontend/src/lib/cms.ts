import { sanityClient } from './sanity';
import type { Article, Category } from './types';
import { getBaseUrl } from './utils';

const articleProjection = `
  _id,
  title,
  slug,
  excerpt,
  body,
  author,
  tags,
  keywords,
  mainImage{asset->{url}, alt},
  category->{title, slug},
  publishedAt,
  _createdAt,
  _updatedAt
`;

const mapCategory = (doc: any): Category => ({
  id: doc._id,
  name: doc.title,
  slug: doc.slug?.current || doc.title.toLowerCase().replace(/\s+/g, '-'),
  description: doc.description || '',
  createdAt: doc._createdAt,
});

const parseKeywords = (keywordsInput: any): string[] => {
  if (!keywordsInput) return [];
  if (Array.isArray(keywordsInput)) {
    return keywordsInput.map((k: any) => String(k).trim()).filter(Boolean);
  }
  if (typeof keywordsInput === 'string') {
    return keywordsInput
      .split(/[\n,]+/)
      .map((k) => k.trim())
      .filter(Boolean);
  }
  return [];
};

const mapArticle = (doc: any): Article => ({
  id: doc._id,
  title: doc.title,
  slug: doc.slug?.current || doc._id,
  excerpt: doc.excerpt || '',
  content: doc.body || '',
  category: doc.category?.title || 'General News',
  author: doc.author || 'Editorial',
  coverImage: doc.mainImage?.asset?.url || '',
  tags: doc.tags || [],
  keywords: parseKeywords(doc.keywords),
  published: true,
  views: 0,
  createdAt: doc.publishedAt || doc._createdAt,
  updatedAt: doc._updatedAt,
});

const contentApi = async <T>(params: Record<string, string>): Promise<T | null> => {
  const query = new URLSearchParams(params).toString();
  
  // Resolve relative URLs for Node.js server-side execution (e.g., during sitemap creation)
  const isServer = typeof window === 'undefined';
  const baseUrl = isServer ? getBaseUrl() : '';

  try {
    const response = await fetch(`${baseUrl}/api/content?${query}`);
    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error('Content API request failed:', error);
    return null;
  }
};

export const contentSource = {
  isSanityConfigured: !!sanityClient,
  
  async getArticles(): Promise<Article[]> {
    if (typeof window === 'undefined' && sanityClient) {
      try {
        const docs = await sanityClient.fetch<any[]>(
          `*[_type == "post"] | order(publishedAt desc) {${articleProjection}}`
        );
        return docs.map(mapArticle);
      } catch (error) {
        console.error('Server-side getArticles failed:', error);
      }
    }
    return (await contentApi<Article[]>({ resource: 'articles' })) || [];
  },

  async getArticleBySlug(slug: string): Promise<Article | null> {
    if (typeof window === 'undefined' && sanityClient) {
      try {
        const doc = await sanityClient.fetch<any | null>(
          `*[_type == "post" && slug.current == $slug][0] {${articleProjection}}`,
          { slug }
        );
        return doc ? mapArticle(doc) : null;
      } catch (error) {
        console.error('Server-side getArticleBySlug failed:', error);
      }
    }
    return (await contentApi<Article | null>({ resource: 'article', slug })) || null;
  },

  async getCategories(): Promise<Category[]> {
    if (typeof window === 'undefined' && sanityClient) {
      try {
        const docs = await sanityClient.fetch<any[]>(
          `*[_type == "category"] | order(title asc) {_id, title, slug, description, _createdAt}`
        );
        return docs.map(mapCategory);
      } catch (error) {
        console.error('Server-side getCategories failed:', error);
      }
    }
    return (await contentApi<Category[]>({ resource: 'categories' })) || [];
  },

  async searchArticles(query: string): Promise<Article[]> {
    if (typeof window === 'undefined' && sanityClient) {
      try {
        const docs = await sanityClient.fetch<any[]>(
          `*[_type == "post" && (
            title match $searchTerm ||
            excerpt match $searchTerm ||
            pt::text(body) match $searchTerm ||
            category->title match $searchTerm ||
            tags[] match $searchTerm
          )] | order(publishedAt desc) {${articleProjection}}`,
          { searchTerm: `*${query}*` }
        );
        return docs.map(mapArticle);
      } catch (error) {
        console.error('Server-side searchArticles failed:', error);
      }
    }
    return (await contentApi<Article[]>({ resource: 'search', q: query })) || [];
  },
};