import { Metadata } from 'next';
import { contentSource } from '@/lib/cms';
import ArticlesDirectoryClient from '@/components/articles/ArticlesDirectoryClient';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Complete Articles Directory | SyntaxFlow',
  description:
    'Browse all DSA tutorials, coding interview solutions, core semester subjects, Python tutorials, and industry insights on SyntaxFlow.',
  keywords: [
    'articles directory',
    'coding interview articles',
    'dsa questions leetcode',
    'software engineering tutorials',
    'wireless engineering',
    'formal automata',
    'syntaxflow library',
  ],
  openGraph: {
    title: 'Complete Articles Directory | SyntaxFlow',
    description:
      'Search and filter all engineering, placement, and technical articles across all categories on SyntaxFlow.',
    url: 'https://syntaxflowarticles.pages.dev/articles',
    siteName: 'SyntaxFlow',
    type: 'website',
  },
};

export default async function ArticlesPage() {
  const [articles, categories] = await Promise.all([
    contentSource.getArticles(),
    contentSource.getCategories(),
  ]);

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
    <ArticlesDirectoryClient
      initialArticles={publicArticles}
      initialCategories={publicCategories}
    />
  );
}
