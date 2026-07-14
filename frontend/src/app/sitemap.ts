import { MetadataRoute } from 'next';
import { contentSource } from '@/lib/cms';
import { getBaseUrl } from '@/lib/utils';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
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
      const articleUrls = articles
        .filter((article) => article && article.slug)
        .map((article) => {
          let lastModified = new Date();
          const rawDate = article.updatedAt || article.createdAt;
          if (rawDate) {
            const parsedDate = new Date(rawDate);
            if (!isNaN(parsedDate.getTime())) {
              lastModified = parsedDate;
            }
          }
          return {
            url: `${baseUrl}/articles/${article.slug}`,
            lastModified,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          };
        });
      routes.push(...articleUrls);
    }
  } catch (error) {
    console.error('Failed to generate sitemap routes:', error);
  }

  return routes;
}
