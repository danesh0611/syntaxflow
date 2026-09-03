import { Metadata } from 'next';
import { contentSource } from '@/lib/cms';
import SqlCourseDashboardClient from '@/components/sql-course/SqlCourseDashboardClient';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Participant Dashboard | SQL Course | SyntaxFlow',
  description: 'Access all self-paced SQL articles, tutorials, and interview breakdowns.',
};

export default async function SqlCourseDashboardPage() {
  // Fetch articles from Sanity content source
  let initialSqlArticles: any[] = [];

  try {
    const articles = await contentSource.getArticles();
    if (Array.isArray(articles)) {
      initialSqlArticles = articles.filter(
        (a) =>
          a.category?.toLowerCase() === 'sql' ||
          a.category?.toLowerCase().includes('sql') ||
          a.tags?.some((t) => t.toLowerCase() === 'sql')
      );
    }
  } catch (err) {
    console.error('Failed to pre-fetch SQL articles for dashboard:', err);
  }

  return <SqlCourseDashboardClient initialArticles={initialSqlArticles} />;
}
