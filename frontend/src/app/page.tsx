import { Metadata } from 'next';
import { contentSource } from '@/lib/cms';
import HomeClient from '@/components/HomeClient';

// Ensure the page fetches latest content from cache or live CDN on request
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'SyntaxFlow | Insights for the Modern Developer',
  description: 'Deep-dives, systems architecture, coding tutorials, and the latest in tech on SyntaxFlow.',
  keywords: ['programming', 'developer', 'tutorials', 'tech insights', 'dsa', 'system design'],
  openGraph: {
    title: 'SyntaxFlow | Insights for the Modern Developer',
    description: 'Deep-dives, systems architecture, coding tutorials, and the latest in tech on SyntaxFlow.',
    url: 'https://syntaxflow.in',
    siteName: 'SyntaxFlow',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SyntaxFlow | Insights for the Modern Developer',
    description: 'Deep-dives, systems architecture, coding tutorials, and the latest in tech on SyntaxFlow.',
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
    ? articles.filter((a) => a.category?.trim().toLowerCase() !== 'sql')
    : [];

  const publicCategories = Array.isArray(categories)
    ? categories.filter(
        (c) =>
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
