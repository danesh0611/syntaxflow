import { contentSource } from '@/lib/cms';
import { getBaseUrl } from '@/lib/utils';

export const revalidate = 3600; // Revalidate every hour
export const dynamic = 'force-static'; // Generate statically at build time to prevent timeouts

export async function GET() {
  const baseUrl = getBaseUrl();
  
  const routes = [
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
            changeFrequency: 'weekly',
            priority: 0.6,
          };
        });
      routes.push(...articleUrls);
    }
  } catch (error) {
    console.error('Failed to generate dynamic sitemap routes:', error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${route.url}</loc>
    <lastmod>${route.lastModified.toISOString().split('.')[0]}Z</lastmod>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
