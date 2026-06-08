import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getBaseUrl } from '@/lib/utils';

export const runtime = 'edge';

// Helper to verify Sanity webhook signature using standard Web Crypto API (HMAC-SHA256)
async function verifySignature(request: Request, secret: string): Promise<boolean> {
  const signatureHeader = request.headers.get('x-sanity-signature');
  if (!signatureHeader) {
    return false;
  }

  // Clone request to read body as text without consuming the primary stream
  const rawBody = await request.clone().text();

  // Parse x-sanity-signature header (e.g. t=1620000000,v1=signature_hash)
  const parts = signatureHeader.split(',');
  const timestampPart = parts.find((p) => p.trim().startsWith('t='));
  const signaturePart = parts.find((p) => p.trim().startsWith('v1='));

  if (!timestampPart || !signaturePart) {
    return false;
  }

  const timestamp = timestampPart.split('=')[1];
  const signature = signaturePart.split('=')[1];

  const payload = `${timestamp}.${rawBody}`;

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const payloadData = encoder.encode(payload);
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      payloadData
    );

    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return signature === expectedSignature;
  } catch (err) {
    console.error('Error verifying webhook signature using Web Crypto:', err);
    return false;
  }
}

function revalidatePaths(slug: string) {
  try {
    revalidatePath('/');
    revalidatePath(`/articles/${slug}`);
    console.log(`Successfully revalidated paths for slug: ${slug}`);
  } catch (error) {
    console.error('Failed to revalidate Next.js cache paths:', error);
  }
}

export async function POST(request: Request) {
  try {
    // 1. Secure the webhook: Verify signature if secret is set
    const secret = process.env.SANITY_WEBHOOK_SECRET;
    if (secret) {
      const isValid = await verifySignature(request, secret);
      if (!isValid) {
        console.warn('Webhook signature verification failed.');
        return NextResponse.json({ error: 'Unauthorized signature' }, { status: 401 });
      }
    } else {
      console.warn('SANITY_WEBHOOK_SECRET is not configured. Processing without verification.');
    }

    // 2. Parse payload
    let body: { _type?: string; slug?: string | { current?: string }; _id?: string } = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { _type, slug, _id } = body;

    // Filter document types
    if (_type !== 'post') {
      return NextResponse.json({ message: 'Skipped. Document type is not post.' }, { status: 200 });
    }

    // 3. Make sure slug exists
    const slugString = typeof slug === 'object' && slug !== null && 'current' in slug
      ? slug.current
      : typeof slug === 'string'
        ? slug
        : undefined;

    if (!slugString) {
      console.warn(`Webhook received for post ${_id || 'unknown'} but slug could not be resolved.`);
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const baseUrl = getBaseUrl();
    const articleUrl = `${baseUrl}/articles/${slugString}`;

    // Extract hostname (strip http:// or https://)
    const host = baseUrl.replace(/^https?:\/\//, '');
    const key = '8e687a6267e2473aac7e59bf04b6f58c';
    const keyLocation = `${baseUrl}/${key}.txt`;

    console.log(`Submitting URL to IndexNow: ${articleUrl}`);

    // 4. Submit to IndexNow
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host,
        key,
        keyLocation,
        urlList: [articleUrl],
      }),
    });

    // 5. Log failures if IndexNow returns errors (400, 403, 422, 429, etc.)
    if (!response.ok) {
      const status = response.status;
      const errorText = await response.text();
      console.error(
        `IndexNow submission failed for URL: ${articleUrl}. ` +
        `HTTP Status: ${status}. Response: ${errorText}`
      );
      
      // Proactively revalidate cache paths even if IndexNow fails
      revalidatePaths(slugString);

      return NextResponse.json(
        { success: false, error: `IndexNow returned status ${status}`, details: errorText },
        { status: 502 }
      );
    }

    // 6. Revalidate cache on success
    revalidatePaths(slugString);

    return NextResponse.json({
      success: true,
      message: `Successfully processed article "${slugString}"`,
      submittedUrl: articleUrl,
    });
  } catch (error) {
    console.error('Webhook handler failed:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
