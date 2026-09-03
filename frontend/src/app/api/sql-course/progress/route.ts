import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

function emailToDocId(email: string): string {
  return btoa(email.toLowerCase().trim()).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** GET participant's read articles */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = (searchParams.get('email') || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const apiKey = process.env.FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
      return NextResponse.json({ readArticles: [] });
    }

    const docId = emailToDocId(email);
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/sql_course_registrations/${docId}?key=${apiKey}`;

    const res = await fetch(firestoreUrl, { method: 'GET' });
    if (!res.ok) {
      return NextResponse.json({ readArticles: [] });
    }

    const doc = await res.json();
    const readArray = doc.fields?.readArticles?.arrayValue?.values || [];
    const readArticles = readArray.map((v: any) => v.stringValue).filter(Boolean);

    return NextResponse.json({ readArticles });
  } catch (err: any) {
    console.error('Fetch progress error:', err);
    return NextResponse.json({ readArticles: [] });
  }
}

/** POST: Update participant's read articles list */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email: string = (body?.email ?? '').trim().toLowerCase();
    const readArticles: string[] = Array.isArray(body?.readArticles) ? body.readArticles : [];

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const apiKey = process.env.FIREBASE_API_KEY;

    if (projectId && apiKey) {
      const docId = emailToDocId(email);
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/sql_course_registrations/${docId}?updateMask.fieldPaths=readArticles&key=${apiKey}`;

      await fetch(firestoreUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            readArticles: {
              arrayValue: {
                values: readArticles.map((slug) => ({ stringValue: slug })),
              },
            },
          },
        }),
      });
    }

    return NextResponse.json({ success: true, readArticles });
  } catch (err: any) {
    console.error('Update progress error:', err);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
