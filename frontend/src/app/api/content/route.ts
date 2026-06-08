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
  body?: Article['content'];
  author?: string;
  tags?: string[];
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
        useCdn: false,
      })
    : null;

const articleProjection = `
  _id,
  title,
  slug,
  excerpt,
  body,
  author,
  tags,
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

const mapArticle = (doc: SanityArticleDoc): Article => ({
  id: doc._id,
  title: doc.title,
  slug: doc.slug?.current || doc._id,
  excerpt: doc.excerpt || '',
  content: doc.body || '',
  category: doc.category?.title || 'General News',
  author: doc.author || 'Editorial',
  coverImage: doc.mainImage?.asset?.url || '',
  tags: doc.tags || [],
  published: true,
  views: 0,
  createdAt: doc.publishedAt || doc._createdAt,
  updatedAt: doc._updatedAt,
});

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
        `*[_type == "post" && slug.current == $slug][0] {${articleProjection}}`,
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
          category->title match $searchTerm ||
          $searchTerm in tags[]
        )] | order(publishedAt desc) {${articleProjection}}`,
        { searchTerm: `*${q}*` }
      );
      return NextResponse.json(docs.map(mapArticle));
    }

    const docs = await sanityClient.fetch<SanityArticleDoc[]>(
      `*[_type == "post"] | order(publishedAt desc) {${articleProjection}}`
    );
    return NextResponse.json(docs.map(mapArticle));
  } catch (error) {
    console.error('Sanity content fetch failed:', error);
    return NextResponse.json({ error: 'Failed to load content' }, { status: 500 });
  }
}