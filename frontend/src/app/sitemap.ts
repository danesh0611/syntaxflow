import { MetadataRoute } from 'next';
import { contentSource } from '@/lib/cms';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  try {
    const articles = await contentSource.getArticles();
    if (Array.isArray(articles) && articles.length > 0) {
      const articleUrls = articles.map((article) => ({
        url: `${baseUrl}/articles/${article.slug}`,
        lastModified: new Date(article.updatedAt || article.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
      return [...routes, ...articleUrls];
    }
  } catch (error) {
    console.error('Failed to generate dynamic sitemap routes:', error);
  }

  return routes;
}
