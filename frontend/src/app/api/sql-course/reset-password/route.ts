import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth-crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email: string = (body?.email ?? '').trim().toLowerCase();
    const otp: string = (body?.otp ?? '').trim();
    const newPassword: string = (body?.newPassword ?? '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!otp || otp.length < 4) {
      return NextResponse.json({ error: 'Please enter the 6-digit reset code from your email.' }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters.' }, { status: 400 });
    }

    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    // 1. Fetch Contact from Brevo
    const checkRes = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      headers: {
        'api-key': brevoApiKey,
        'Accept': 'application/json',
      },
    });

    if (!checkRes.ok) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    }

    const contact = await checkRes.json();
    const name = contact.attributes?.FIRSTNAME || email.split('@')[0];
    const regId = contact.attributes?.EXT_ID || 'SF-SQL-0428';

    // 2. Hash the new password
    const newPasswordHash = await hashPassword(newPassword);

    // 3. Update the contact in Brevo with the new password hash
    const updateRes = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        attributes: {
          LASTNAME: newPasswordHash,
        },
      }),
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      console.error('Failed to update password:', errText);
      return NextResponse.json({ error: 'Failed to update password. Please try again.' }, { status: 500 });
    }

    const userDoc = {
      name: name,
      email: email,
      registrationId: regId,
      registeredAt: contact.createdAt || new Date().toISOString(),
      status: 'confirmed',
    };

    return NextResponse.json({
      success: true,
      user: userDoc,
      message: 'Password reset successfully! You are now logged in.',
    });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 });
  }
}
