import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth-crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email: string = (body?.email ?? '').trim().toLowerCase();
    const password: string = (body?.password ?? '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'Please enter your password.' }, { status: 400 });
    }

    const brevoApiKey = process.env.BREVO_API_KEY;
    let userDoc: any = null;

    if (brevoApiKey) {
      try {
        const checkRes = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
          headers: {
            'api-key': brevoApiKey,
            'Accept': 'application/json',
          },
        });

        if (checkRes.ok) {
          const contact = await checkRes.json();
          const storedHash = contact.attributes?.LASTNAME; // Secure password hash

          // Verify password
          if (storedHash) {
            const isValid = await verifyPassword(password, storedHash);
            if (!isValid) {
              return NextResponse.json(
                { error: 'Incorrect password. Please double check and try again.' },
                { status: 401 }
              );
            }
          }

          const name = contact.attributes?.FIRSTNAME || email.split('@')[0];
          const regId = contact.attributes?.EXT_ID || 'SF-SQL-0428';

          userDoc = {
            name: name,
            email: email,
            registrationId: regId,
            registeredAt: contact.createdAt || new Date().toISOString(),
            status: 'confirmed',
          };
        }
      } catch (err) {
        console.error('Brevo contact lookup error:', err);
      }
    }

    if (!userDoc) {
      return NextResponse.json(
        {
          error: 'No registration found for this email. Please register for free first to set your password.',
          notRegistered: true,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: userDoc,
      message: 'Login successful! Welcome to your personalized dashboard.',
    });
  } catch (err: any) {
    console.error('SQL Course login error:', err);
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 });
  }
}
