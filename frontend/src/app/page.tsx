import { Metadata } from 'next';
import { contentSource } from '@/lib/cms';
import HomeClient from '@/components/HomeClient';

// Ensure the page fetches latest content from cache or live CDN on request
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'SyntaxFlow | Engineering & Tech Placement Preparation Hub',
  description:
    'Ace tech placements and master engineering core subjects with 100 FAANG DSA tracker, in-depth editorials with dry runs, self-paced SQL interview course, and industry insights.',
  keywords: [
    'engineering placements',
    'coding interview prep',
    'faang dsa sheet',
    'sql interview course',
    'leetcode solutions dry run',
    'software engineering jobs',
    'wireless communication',
    'python tutorials',
  ],
  openGraph: {
    title: 'SyntaxFlow | Engineering & Tech Placement Preparation Hub',
    description:
      'Ace tech placements and master engineering core subjects with 100 FAANG DSA tracker, in-depth editorials with dry runs, self-paced SQL interview course, and industry insights.',
    url: 'https://syntaxflowarticles.pages.dev',
    siteName: 'SyntaxFlow',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SyntaxFlow | Engineering & Tech Placement Preparation Hub',
    description:
      'Ace tech placements and master engineering core subjects with 100 FAANG DSA tracker, in-depth editorials with dry runs, self-paced SQL interview course, and industry insights.',
  },
};

export default async function Home() {
  // Fetch articles and categories on the server side in parallel
  const [articles, categories] = await Promise.all([
    contentSource.getArticles(),
    contentSource.getCategories(),
  ]);

  // Exclude SQL course articles from the public general homepage (accessible only to registered participants in the SQL dashboard)
  const publicArticles = Array.isArray(articles)
    ? articles.filter((a) => a && a.category?.trim().toLowerCase() !== 'sql')
    : [];

  const publicCategories = Array.isArray(categories)
    ? categories.filter(
        (c) =>
          c &&
          c.name?.trim().toLowerCase() !== 'sql' &&
          c.slug?.trim().toLowerCase() !== 'sql'
      )
    : [];

  return (
    <HomeClient
      initialArticles={publicArticles}
      initialCategories={publicCategories}
    />
  );
}
