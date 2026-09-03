import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth-crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

function generateRegistrationId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `SF-SQL-${num}`;
}

function buildEmailHtml(name: string, registrationId: string, to: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SQL Interview Mastery Registration</title>
</head>
<body style="margin:0;padding:0;background:#090d1a;font-family:'Outfit','Segoe UI',Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#090d1a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:540px;background:#111827;border-radius:20px;overflow:hidden;border:1px solid #1f293d;box-shadow:0 12px 40px rgba(0,0,0,0.5);">
          
          <!-- Top Gradient Banner -->
          <tr><td style="height:6px;background:linear-gradient(90deg,#6366f1,#38bdf8,#ec4899);"></td></tr>

          <!-- Header -->
          <tr>
            <td style="padding:40px 36px 24px;text-align:center;">
              <div style="margin-bottom:12px;">
                <span style="font-size:26px;font-weight:900;color:#818cf8;letter-spacing:-0.5px;">Syntax</span><span style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Flow</span>
                <span style="display:inline-block;margin-left:8px;padding:3px 10px;background:rgba(99,102,241,0.2);border:1px solid #6366f1;color:#a5b4fc;font-size:11px;font-weight:700;border-radius:999px;vertical-align:middle;">SQL PLACEMENT COURSE</span>
              </div>
              <h1 style="margin:0 0 10px;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">You're Registered, ${name}! 🚀</h1>
              <p style="margin:0;font-size:15px;color:#94a3b8;line-height:1.6;">
                Your spot for the <strong>Self-Paced SQL for Placements</strong> course has been confirmed.
              </p>
            </td>
          </tr>

          <!-- Registration ID Badge -->
          <tr>
            <td style="padding:0 36px 24px;text-align:center;">
              <div style="display:inline-block;padding:12px 24px;background:rgba(99,102,241,0.12);border:1px dashed #6366f1;border-radius:14px;">
                <span style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;">Your Registration ID</span>
                <span style="font-size:20px;font-weight:800;color:#38bdf8;font-family:monospace;">${registrationId}</span>
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 36px;"><div style="height:1px;background:#1f293d;"></div></td></tr>

          <!-- What Happens Next -->
          <tr>
            <td style="padding:28px 36px;">
              <p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#818cf8;text-transform:uppercase;letter-spacing:1.5px;">What happens next?</p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:10px 0;">
                  <span style="display:inline-block;width:32px;height:32px;background:rgba(99,102,241,0.15);border-radius:8px;text-align:center;line-height:32px;font-size:16px;margin-right:12px;vertical-align:middle;">📬</span>
                  <span style="font-size:14px;color:#e2e8f0;font-weight:600;vertical-align:middle;">Short Course Updates</span>
                  <p style="margin:4px 0 0 44px;font-size:13px;color:#94a3b8;line-height:1.5;">You will shortly receive updates in your inbox (${to}) as new clearcut articles, cheat sheets, and practice problems drop.</p>
                </td></tr>

                <tr><td style="padding:10px 0;">
                  <span style="display:inline-block;width:32px;height:32px;background:rgba(56,189,248,0.15);border-radius:8px;text-align:center;line-height:32px;font-size:16px;margin-right:12px;vertical-align:middle;">🔑</span>
                  <span style="font-size:14px;color:#e2e8f0;font-weight:600;vertical-align:middle;">Secure Login Credentials</span>
                  <p style="margin:4px 0 0 44px;font-size:13px;color:#94a3b8;line-height:1.5;">Log in anytime with your registered email and your chosen password to track your progress.</p>
                </td></tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:10px 36px 36px;text-align:center;">
              <a href="https://syntaxflowarticles.pages.dev/sql-course/login" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:14px;box-shadow:0 4px 16px rgba(99,102,241,0.3);">
                Access Your Course Dashboard →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px 32px;text-align:center;border-top:1px solid #1f293d;background:#0d1220;">
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.8;">
                This email was sent to <strong>${to}</strong>.<br/>
                SyntaxFlow Team.
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

/** Send confirmation email strictly to the recipient */
async function sendViaBrevo(recipientEmail: string, recipientName: string, registrationId: string, apiKey: string, senderEmail: string) {
  const subject = `🎉 You're Registered for the SQL Placement Masterclass (${registrationId})`;
  const html = buildEmailHtml(recipientName, registrationId, recipientEmail);

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: 'SyntaxFlow SQL Masterclass',
        email: senderEmail,
      },
      replyTo: {
        email: 'syntaxflowarticles@gmail.com',
        name: 'SyntaxFlow Team',
      },
      to: [
        {
          email: recipientEmail,
          name: recipientName,
        },
      ],
      subject: subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Brevo send error:', err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name: string = (body?.name ?? '').trim();
    const email: string = (body?.email ?? '').trim().toLowerCase();
    const password: string = (body?.password ?? '').trim();

    if (!name) {
      return NextResponse.json({ error: 'Please provide your full name.' }, { status: 400 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const brevoApiKey = process.env.BREVO_API_KEY;
    const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL || 'syntaxflowarticles@gmail.com';

    // Hash password
    const passwordHash = await hashPassword(password);

    // 1. STRICT DUPLICATE CHECK via Brevo Contacts API
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
          const existingName = contact.attributes?.FIRSTNAME || name;
          const existingRegId = contact.attributes?.EXT_ID || 'SF-SQL-0000';

          return NextResponse.json(
            {
              success: false,
              alreadyRegistered: true,
              registrationId: existingRegId,
              name: existingName,
              email: email,
              error: 'This email is already registered! Please log in with your password.',
            },
            { status: 409 }
          );
        }
      } catch (checkErr) {
        console.error('Contact check error:', checkErr);
      }
    }

    // 2. Generate new unique registration ID
    const registrationId = generateRegistrationId();

    // 3. Save new participant contact in Brevo with password hash in LASTNAME and registration ID in ext_id
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
            ext_id: registrationId,
            attributes: {
              FIRSTNAME: name,
              LASTNAME: passwordHash,
            },
          }),
        });
      } catch (saveErr) {
        console.error('Contact save error:', saveErr);
      }
    }

    // 4. Send confirmation email directly to the participant
    if (brevoApiKey) {
      try {
        await sendViaBrevo(email, name, registrationId, brevoApiKey, brevoSenderEmail);
      } catch (emailErr) {
        console.error('Email dispatch error (non-fatal):', emailErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        alreadyRegistered: false,
        registrationId,
        message: 'Registration successful! Confirmation has been sent to your email.',
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('SQL Course register route error:', err);
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 });
  }
}
