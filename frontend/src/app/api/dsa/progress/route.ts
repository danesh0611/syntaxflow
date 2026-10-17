import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function emailToDocId(email: string): string {
  return btoa(email.toLowerCase().trim()).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** GET user's tracked DSA solved problems */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = (searchParams.get('email') || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ solvedIds: [], starredIds: [], leetcodeUsername: '' });
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const apiKey = process.env.FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
      return NextResponse.json({ solvedIds: [], starredIds: [], leetcodeUsername: '' });
    }

    const docId = emailToDocId(email);
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/dsa_sheet_progress/${docId}?key=${apiKey}`;

    const res = await fetch(firestoreUrl, { method: 'GET' });
    if (!res.ok) {
      return NextResponse.json({ solvedIds: [], starredIds: [], leetcodeUsername: '' });
    }

    const doc = await res.json();
    const solvedArray = doc.fields?.solvedIds?.arrayValue?.values || [];
    const starredArray = doc.fields?.starredIds?.arrayValue?.values || [];
    const leetcodeUsername = doc.fields?.leetcodeUsername?.stringValue || '';

    return NextResponse.json({
      solvedIds: solvedArray.map((v: any) => v.stringValue).filter(Boolean),
      starredIds: starredArray.map((v: any) => v.stringValue).filter(Boolean),
      leetcodeUsername,
    });
  } catch (err: any) {
    console.error('Fetch DSA progress error:', err);
    return NextResponse.json({ solvedIds: [], starredIds: [], leetcodeUsername: '' });
  }
}

/** POST: Update user's tracked DSA problems */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email: string = (body?.email ?? '').trim().toLowerCase();
    const solvedIds: string[] = Array.isArray(body?.solvedIds) ? body.solvedIds : [];
    const starredIds: string[] = Array.isArray(body?.starredIds) ? body.starredIds : [];
    const leetcodeUsername: string = (body?.leetcodeUsername ?? '').trim();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const apiKey = process.env.FIREBASE_API_KEY;

    if (projectId && apiKey) {
      const docId = emailToDocId(email);
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/dsa_sheet_progress/${docId}?key=${apiKey}`;

      await fetch(firestoreUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            email: { stringValue: email },
            leetcodeUsername: { stringValue: leetcodeUsername },
            updatedAt: { stringValue: new Date().toISOString() },
            solvedIds: {
              arrayValue: {
                values: solvedIds.map((id) => ({ stringValue: id })),
              },
            },
            starredIds: {
              arrayValue: {
                values: starredIds.map((id) => ({ stringValue: id })),
              },
            },
          },
        }),
      });
    }

    return NextResponse.json({ success: true, solvedIds, starredIds, leetcodeUsername });
  } catch (err: any) {
    console.error('Update DSA progress error:', err);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
