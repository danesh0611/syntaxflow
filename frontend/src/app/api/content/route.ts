import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

import { isSanityConfigured } from '@/lib/sanity';
import type { Article, Category } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

type SanityCategoryDoc = {
  _id: string;
  title: string;
  slug?: { current?: string };
  description?: string;
  _createdAt: string;
};

type SanityArticleDoc = {
  _id: string;
  title: string;
  slug?: { current?: string };
  excerpt?: string;
  contentType?: 'richText' | 'html';
  htmlContent?: string;
  body?: Article['content'];
  author?: string;
  tags?: string[];
  keywords?: string | string[];
  mainImage?: { asset?: { url?: string } };
  category?: { title?: string };
  publishedAt?: string;
  _createdAt: string;
  _updatedAt: string;
};

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-05-25';

const sanityClient =
  projectId && isSanityConfigured
    ? createClient({
        projectId,
        dataset,
        apiVersion,
        useCdn: true,
      })
    : null;

const articleListProjection = `
  _id,
  title,
  slug,
  excerpt,
  contentType,
  author,
  tags,
  keywords,
  mainImage{asset->{url}, alt},
  category->{title, slug},
  publishedAt,
  _createdAt,
  _updatedAt
`;

const articleDetailProjection = `
  _id,
  title,
  slug,
  excerpt,
  contentType,
  htmlContent,
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

const mapCategory = (doc: SanityCategoryDoc): Category => ({
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

const cleanArticleTitle = (title: string): string => {
  if (!title) return '';
  return title
    .replace(/\s*Alternative:\s*$/i, '')
    .replace(/Chapter 2:Mastering/i, 'Chapter 2: Mastering')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const cleanArticleExcerpt = (excerpt: string | undefined, slug: string, title: string): string => {
  if (slug === 'project-1' || /scam\s*gurad/i.test(excerpt || '')) {
    return 'An AI-powered digital trust and fraud prevention platform built with Google Gemini to identify social engineering scams and deceptive payment requests in real time.';
  }
  if (!excerpt || excerpt.trim().length === 0) {
    return `In-depth technical breakdown and implementation walkthrough for ${cleanArticleTitle(title)}.`;
  }
  return excerpt.trim();
};

const mapArticle = (doc: SanityArticleDoc): Article => {
  const slug = doc.slug?.current || doc._id;
  const title = cleanArticleTitle(doc.title);
  return {
    id: doc._id,
    title,
    slug,
    excerpt: cleanArticleExcerpt(doc.excerpt, slug, title),
    content: doc.body || '',
    contentType: doc.contentType || 'richText',
    htmlContent: doc.htmlContent || '',
    category: doc.category?.title || 'General News',
    author: doc.author || 'Editorial',
    coverImage: doc.mainImage?.asset?.url || '',
    tags: doc.tags || [],
    keywords: parseKeywords(doc.keywords),
    published: true,
    views: 0,
    createdAt: doc.publishedAt || doc._createdAt,
    updatedAt: doc._updatedAt,
  };
};

export async function GET(request: Request) {
  if (!sanityClient) {
    return NextResponse.json({ error: 'Sanity is not configured' }, { status: 503 });
  }

  const url = new URL(request.url);
  const resource = url.searchParams.get('resource');

  try {
    if (resource === 'categories') {
      const docs = await sanityClient.fetch<SanityCategoryDoc[]>(
        `*[_type == "category"] | order(title asc) {_id, title, slug, description, _createdAt}`
      );
      return NextResponse.json(docs.map(mapCategory));
    }

    if (resource === 'article') {
      const slug = url.searchParams.get('slug');
      if (!slug) {
        return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
      }

      const doc = await sanityClient.fetch<SanityArticleDoc | null>(
        `*[_type == "post" && slug.current == $slug][0] {${articleDetailProjection}}`,
        { slug }
      );
      return NextResponse.json(doc ? mapArticle(doc) : null);
    }

    if (resource === 'search') {
      const q = url.searchParams.get('q') || '';
      const docs = await sanityClient.fetch<SanityArticleDoc[]>(
        `*[_type == "post" && (
          title match $searchTerm ||
          excerpt match $searchTerm ||
          pt::text(body) match $searchTerm ||
          htmlContent match $searchTerm ||
          category->title match $searchTerm ||
          tags[] match $searchTerm
        )] | order(publishedAt desc) {${articleListProjection}}`,
        { searchTerm: `*${q}*` }
      );
      return NextResponse.json(docs.map(mapArticle));
    }

    const category = url.searchParams.get('category');
    if (category) {
      const docs = await sanityClient.fetch<SanityArticleDoc[]>(
        `*[_type == "post" && (
          category->slug.current == $category ||
          lower(category->title) match lower($category) ||
          $category in tags
        )] | order(publishedAt desc) {${articleListProjection}}`,
        { category }
      );
      return NextResponse.json(docs.map(mapArticle));
    }

    const docs = await sanityClient.fetch<SanityArticleDoc[]>(
      `*[_type == "post"] | order(publishedAt desc) {${articleListProjection}}`
    );
    return NextResponse.json(docs.map(mapArticle));
  } catch (error) {
    console.error('Sanity content fetch failed:', error);
    return NextResponse.json({ error: 'Failed to load content' }, { status: 500 });
  }
}