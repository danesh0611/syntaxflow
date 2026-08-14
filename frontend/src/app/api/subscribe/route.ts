import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// ---------------------------------------------------------------------------
// Subscribe API — Firestore (storage) + Gmail API (welcome email)
// ---------------------------------------------------------------------------
// Required env vars:
//   FIREBASE_PROJECT_ID    – e.g. "syntaxflow-e61fc"
//   FIREBASE_API_KEY       – Firebase Web API key
//   GMAIL_CLIENT_ID        – Google OAuth2 client ID
//   GMAIL_CLIENT_SECRET    – Google OAuth2 client secret
//   GMAIL_REFRESH_TOKEN    – Long-lived refresh token for your Gmail account
//   GMAIL_FROM             – Your Gmail address, e.g. "you@gmail.com"
// ---------------------------------------------------------------------------

function emailToDocId(email: string): string {
  return btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Exchange refresh token for a short-lived access token */
async function getGmailAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type:    'refresh_token',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to get Gmail access token: ${err}`);
  }

  const data = await res.json() as { access_token: string };
  return data.access_token;
}

/** Build and send a welcome email via Gmail API */
async function sendWelcomeEmail(to: string, fromEmail: string, accessToken: string) {
  const subject = "Welcome to SyntaxFlow - You are now subscribed";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to SyntaxFlow</title>
</head>
<body style="margin:0;padding:0;background:#f4f6ff;font-family:'Outfit','Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6ff;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dde3f5;box-shadow:0 8px 32px rgba(79,70,229,0.1);">

          <!-- Top gradient bar -->
          <tr><td style="height:4px;background:linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899);"></td></tr>

          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 24px;text-align:center;">
              <div style="margin-bottom:16px;">
                <span style="font-size:28px;font-weight:900;color:#6366f1;letter-spacing:-0.5px;">Syntax</span><span style="font-size:28px;font-weight:900;color:#080f1e;letter-spacing:-0.5px;">Flow</span>
              </div>
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#080f1e;letter-spacing:-0.3px;">You're in! Welcome aboard 🚀</h1>
              <p style="margin:0;font-size:15px;color:#5a6480;line-height:1.6;">Thanks for subscribing. You'll be the first to know whenever I publish something new.</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 40px;"><div style="height:1px;background:#dde3f5;"></div></td></tr>

          <!-- What to expect -->
          <tr>
            <td style="padding:28px 40px;">
              <p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#5a6480;text-transform:uppercase;letter-spacing:1.5px;">What to expect</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:10px 0;">
                  <span style="display:inline-block;width:32px;height:32px;background:rgba(99,102,241,0.1);border-radius:8px;text-align:center;line-height:32px;font-size:16px;margin-right:12px;vertical-align:middle;">&#128218;</span>
                  <span style="font-size:14px;color:#080f1e;font-weight:600;vertical-align:middle;">DSA &amp; Algorithm deep-dives</span>
                </td></tr>
                <tr><td style="padding:10px 0;">
                  <span style="display:inline-block;width:32px;height:32px;background:rgba(99,102,241,0.1);border-radius:8px;text-align:center;line-height:32px;font-size:16px;margin-right:12px;vertical-align:middle;">&#9889;</span>
                  <span style="font-size:14px;color:#080f1e;font-weight:600;vertical-align:middle;">C++, Python &amp; programming tutorials</span>
                </td></tr>
                <tr><td style="padding:10px 0;">
                  <span style="display:inline-block;width:32px;height:32px;background:rgba(99,102,241,0.1);border-radius:8px;text-align:center;line-height:32px;font-size:16px;margin-right:12px;vertical-align:middle;">&#127959;&#65039;</span>
                  <span style="font-size:14px;color:#080f1e;font-weight:600;vertical-align:middle;">System design &amp; architecture insights</span>
                </td></tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:4px 40px 36px;text-align:center;">
              <a href="https://syntaxflowarticles.pages.dev" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:14px;">Browse Latest Articles</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 32px;text-align:center;border-top:1px solid #f0f0f8;">
              <p style="margin:0;font-size:12px;color:#5a6480;line-height:1.8;">
                You subscribed at <strong>syntaxflowarticles.pages.dev</strong><br/>
                No spam, ever. Reply to this email to unsubscribe.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  // Plain-text fallback (helps avoid spam filters)
  const plainText = [
    `Welcome to SyntaxFlow! You're now subscribed.`,
    ``,
    `Thanks for subscribing. You'll be notified whenever I publish a new article.`,
    ``,
    `What to expect:`,
    `- DSA & Algorithm deep-dives`,
    `- C++, Python & programming tutorials`,
    `- System design & architecture insights`,
    ``,
    `Browse articles: https://syntaxflowarticles.pages.dev`,
    ``,
    `No spam, ever. Reply to this email to unsubscribe.`,
    `-- SyntaxFlow`,
  ].join('\r\n');

  const boundary = `syntaxflow_${Date.now()}`;

  // Build RFC 2822 raw email message with multipart/alternative (plain + HTML)
  const rawMessage = [
    `From: SyntaxFlow <${fromEmail}>`,
    `To: ${to}`,
    `Reply-To: ${fromEmail}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    `List-Unsubscribe: <mailto:${fromEmail}?subject=Unsubscribe>`,
    `X-Mailer: SyntaxFlow`,
    `Date: ${new Date().toUTCString()}`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    plainText,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    html,
    ``,
    `--${boundary}--`,
  ].join('\r\n');


  // Base64url encode
  const encoded = btoa(unescape(encodeURIComponent(rawMessage)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encoded }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('Gmail API send error:', err);
    // Non-fatal — subscription still succeeds
  }
}

// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body  = await request.json();
    const email: string = (body?.email ?? '').trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const projectId    = process.env.FIREBASE_PROJECT_ID;
    const apiKey       = process.env.FIREBASE_API_KEY;
    const clientId     = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const fromEmail    = process.env.GMAIL_FROM;

    if (!projectId || !apiKey) {
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    // Check / save to Firestore
    const docId = emailToDocId(email);
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/subscribers/${docId}?key=${apiKey}`;

    const getRes = await fetch(firestoreUrl, { method: 'GET' });
    if (getRes.ok) {
      return NextResponse.json({ message: 'You are already subscribed! 🎉' }, { status: 200 });
    }

    const patchRes = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          email:        { stringValue: email },
          subscribedAt: { timestampValue: new Date().toISOString() },
          active:       { booleanValue: true },
        },
      }),
    });

    if (!patchRes.ok) {
      const err = await patchRes.text();
      console.error('Firestore write error:', err);
      return NextResponse.json({ error: 'Failed to save subscription. Please try again.' }, { status: 500 });
    }

    // Send welcome email via Gmail API
    if (clientId && clientSecret && refreshToken && fromEmail) {
      try {
        const accessToken = await getGmailAccessToken(clientId, clientSecret, refreshToken);
        await sendWelcomeEmail(email, fromEmail, accessToken);
      } catch (emailErr) {
        console.error('Welcome email error (non-fatal):', emailErr);
      }
    }

    return NextResponse.json(
      { message: 'Subscribed! Check your inbox for a welcome email 📬' },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Subscribe route error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
