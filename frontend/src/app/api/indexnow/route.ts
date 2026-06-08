import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/utils';
import { contentSource } from '@/lib/cms';

export async function POST(request: Request) {
  try {
    let urls: string[] = [];
    
    // Read request body safely
    let body: { bulk?: boolean; urls?: string[] } = {};
    try {
      body = await request.json();
    } catch {
      // Request might have empty body
    }

    const { bulk, urls: customUrls } = body;
    const baseUrl = getBaseUrl();

    if (bulk === true) {
      // Fetch all articles
      const articles = await contentSource.getArticles();
      const articleUrls = articles.map(
        (article) => `${baseUrl}/articles/${article.slug}`
      );
      // Include the homepage
      urls = [baseUrl, ...articleUrls];
    } else if (Array.isArray(customUrls)) {
      urls = customUrls;
    } else {
      return NextResponse.json(
        { success: false, error: 'Provide either a "urls" array or set "bulk": true' },
        { status: 400 }
      );
    }

    if (urls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No URLs to submit' },
        { status: 400 }
      );
    }

    // Extract hostname (strip http:// or https://)
    const host = baseUrl.replace(/^https?:\/\//, '');
    const key = '8e687a6267e2473aac7e59bf04b6f58c';
    const keyLocation = `${baseUrl}/${key}.txt`;

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host,
        key,
        keyLocation,
        urlList: urls,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, status: response.status, error: errorText },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      submittedUrls: urls,
    });
  } catch (error) {
    console.error('IndexNow submission failed:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
