import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// ---------------------------------------------------------------------------
// Newsletter Subscribe API — Brevo Contacts + Welcome Email (Direct to Subscriber)
// ---------------------------------------------------------------------------

function buildWelcomeHtml(to: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to SyntaxFlow</title>
</head>
<body style="margin:0;padding:0;background:#090d1a;font-family:'Outfit','Segoe UI',Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#090d1a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#111827;border-radius:20px;overflow:hidden;border:1px solid #1f293d;box-shadow:0 12px 40px rgba(0,0,0,0.5);">
          
          <!-- Top Gradient Banner -->
          <tr><td style="height:6px;background:linear-gradient(90deg,#6366f1,#38bdf8,#ec4899);"></td></tr>

          <!-- Header -->
          <tr>
            <td style="padding:40px 36px 24px;text-align:center;">
              <div style="margin-bottom:12px;">
                <span style="font-size:26px;font-weight:900;color:#818cf8;letter-spacing:-0.5px;">Syntax</span><span style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Flow</span>
              </div>
              <h1 style="margin:0 0 10px;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">You're in! Welcome aboard 🚀</h1>
              <p style="margin:0;font-size:15px;color:#94a3b8;line-height:1.6;">
                Thanks for subscribing to the SyntaxFlow newsletter. You'll be the first to know whenever new deep-dives or course lessons drop.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 36px;"><div style="height:1px;background:#1f293d;"></div></td></tr>

          <!-- What to Expect -->
          <tr>
            <td style="padding:28px 36px;">
              <p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#818cf8;text-transform:uppercase;letter-spacing:1.5px;">What to expect</p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:8px 0;">
                  <span style="display:inline-block;width:32px;height:32px;background:rgba(99,102,241,0.15);border-radius:8px;text-align:center;line-height:32px;font-size:16px;margin-right:12px;vertical-align:middle;">📚</span>
                  <span style="font-size:14px;color:#e2e8f0;font-weight:600;vertical-align:middle;">DSA &amp; Interview Breakdown Articles</span>
                </td></tr>
                <tr><td style="padding:8px 0;">
                  <span style="display:inline-block;width:32px;height:32px;background:rgba(56,189,248,0.15);border-radius:8px;text-align:center;line-height:32px;font-size:16px;margin-right:12px;vertical-align:middle;">⚡</span>
                  <span style="font-size:14px;color:#e2e8f0;font-weight:600;vertical-align:middle;">SQL &amp; Backend Engineering Tutorials</span>
                </td></tr>
                <tr><td style="padding:8px 0;">
                  <span style="display:inline-block;width:32px;height:32px;background:rgba(236,72,153,0.15);border-radius:8px;text-align:center;line-height:32px;font-size:16px;margin-right:12px;vertical-align:middle;">🏗️</span>
                  <span style="font-size:14px;color:#e2e8f0;font-weight:600;vertical-align:middle;">System Architecture Deep-Dives</span>
                </td></tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:10px 36px 36px;text-align:center;">
              <a href="https://syntaxflowarticles.pages.dev" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:14px;box-shadow:0 4px 16px rgba(99,102,241,0.3);">
                Explore Latest Articles →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px 32px;text-align:center;border-top:1px solid #1f293d;background:#0d1220;">
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.8;">
                Subscribed with <strong>${to}</strong>.<br/>
                No spam, ever.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/** Send welcome email directly to the subscriber */
async function sendWelcomeEmail(subscriberEmail: string, apiKey: string, senderEmail: string) {
  const subject = "Welcome to SyntaxFlow - You're now subscribed 🎉";
  const html = buildWelcomeHtml(subscriberEmail);

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: 'SyntaxFlow',
        email: senderEmail,
      },
      replyTo: {
        email: 'syntaxflowarticles@gmail.com',
        name: 'SyntaxFlow Team',
      },
      to: [
        {
          email: subscriberEmail,
        },
      ],
      subject: subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Brevo welcome send error:', err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email: string = (body?.email ?? '').trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const brevoApiKey = process.env.BREVO_API_KEY;
    const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL || 'syntaxflowarticles@gmail.com';

    // 1. Check for Duplicate Subscription
    if (brevoApiKey) {
      try {
        const checkRes = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
          headers: {
            'api-key': brevoApiKey,
            'Accept': 'application/json',
          },
        });

        if (checkRes.ok) {
          // Already subscribed: return friendly confirmation without duplicate email
          return NextResponse.json(
            { message: 'You are already subscribed to SyntaxFlow! 🎉', alreadySubscribed: true },
            { status: 200 }
          );
        }
      } catch (checkErr) {
        console.error('Brevo subscription check error:', checkErr);
      }
    }

    // 2. Save subscriber in Brevo
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
            email: email,
            attributes: {
              SUBSCRIBED_AT: new Date().toISOString(),
            },
          }),
        });
      } catch (saveErr) {
        console.error('Brevo subscriber save error:', saveErr);
      }
    }

    // 3. Send welcome email directly to the subscriber
    if (brevoApiKey) {
      try {
        await sendWelcomeEmail(email, brevoApiKey, brevoSenderEmail);
      } catch (emailErr) {
        console.error('Welcome email dispatch error (non-fatal):', emailErr);
      }
    }

    return NextResponse.json(
      { message: 'Subscribed! Check your inbox for a welcome email 📬' },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Subscribe route error:', err);
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 });
  }
}
