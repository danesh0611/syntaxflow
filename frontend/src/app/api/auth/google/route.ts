import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idToken = (body?.credential || '').trim();

    if (!idToken) {
      return NextResponse.json({ error: 'Missing Google ID token credential.' }, { status: 400 });
    }

    // Verify token directly with Google's official tokeninfo endpoint
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!verifyRes.ok) {
      return NextResponse.json({ error: 'Invalid Google credential token.' }, { status: 401 });
    }

    const payload = await verifyRes.json();
    const email = (payload.email || '').trim().toLowerCase();
    const name = payload.name || payload.given_name || email.split('@')[0];
    const picture = payload.picture || '';
    const googleId = payload.sub || '';

    if (!email) {
      return NextResponse.json({ error: 'Could not extract email from Google profile.' }, { status: 400 });
    }

    const regId = `SF-GOOG-${googleId.slice(-4) || Math.floor(1000 + Math.random() * 9000)}`;

    const userDoc = {
      name,
      email,
      picture,
      registrationId: regId,
      registeredAt: new Date().toISOString(),
      status: 'confirmed',
      authProvider: 'google',
    };

    // Attempt to register/update in Brevo so welcome emails or newsletter contacts exist
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (brevoApiKey) {
      try {
        await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            email,
            attributes: {
              FIRSTNAME: name,
              EXT_ID: regId,
            },
            updateEnabled: true,
          }),
        });
      } catch (err) {
        console.error('Brevo sync error for Google user:', err);
      }
    }

    return NextResponse.json({
      success: true,
      user: userDoc,
      message: `Welcome, ${name}! Signed in with Google successfully.`,
    });
  } catch (err: any) {
    console.error('Google Auth Route Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to authenticate with Google.' },
      { status: 500 }
    );
  }
}
