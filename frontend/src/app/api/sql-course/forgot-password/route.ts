import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function buildOtpEmailHtml(name: string, otp: string, to: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your SQL Course Password</title>
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
              <h1 style="margin:0 0 10px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">Password Reset Request 🔐</h1>
              <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;">
                Hi ${name}, we received a request to reset your password for the <strong>SQL Interview Mastery Course</strong>.
              </p>
            </td>
          </tr>

          <!-- OTP Code Box -->
          <tr>
            <td style="padding:0 36px 28px;text-align:center;">
              <div style="display:inline-block;padding:16px 32px;background:rgba(99,102,241,0.12);border:2px dashed #6366f1;border-radius:16px;">
                <span style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;display:block;margin-bottom:6px;">Your 6-Digit Reset Code</span>
                <span style="font-size:32px;font-weight:900;color:#38bdf8;letter-spacing:8px;font-family:monospace;">${otp}</span>
              </div>
              <p style="margin:14px 0 0;font-size:12px;color:#64748b;">
                This verification code is valid for 15 minutes.
              </p>
            </td>
          </tr>

          <!-- Security Note -->
          <tr>
            <td style="padding:0 36px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                If you did not request this password reset, you can safely ignore this email. Your account is completely secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px 32px;text-align:center;border-top:1px solid #1f293d;background:#0d1220;">
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.8;">
                Sent to <strong>${to}</strong>.<br/>
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

/** Send reset OTP email strictly to participant */
async function sendOtpViaBrevo(recipientEmail: string, recipientName: string, otp: string, apiKey: string, senderEmail: string) {
  const subject = `🔐 Your SQL Course Password Reset Code (${otp})`;
  const html = buildOtpEmailHtml(recipientName, otp, recipientEmail);

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: 'SyntaxFlow Security',
        email: senderEmail,
      },
      replyTo: {
        email: 'syntaxflowarticles@gmail.com',
        name: 'SyntaxFlow Team',
      },
      to: [{ email: recipientEmail, name: recipientName }],
      subject: subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Brevo OTP send error:', err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email: string = (body?.email ?? '').trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid registered email address.' }, { status: 400 });
    }

    const brevoApiKey = process.env.BREVO_API_KEY;
    const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL || 'syntaxflowarticles@gmail.com';

    if (!brevoApiKey) {
      return NextResponse.json({ error: 'Email service configuration error.' }, { status: 500 });
    }

    // 1. Verify that contact exists
    const checkRes = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      headers: {
        'api-key': brevoApiKey,
        'Accept': 'application/json',
      },
    });

    if (!checkRes.ok) {
      return NextResponse.json(
        { error: 'No course registration found with this email. Please check your email or register.' },
        { status: 404 }
      );
    }

    const contact = await checkRes.json();
    const name = contact.attributes?.FIRSTNAME || email.split('@')[0];
    const otp = generateOtp();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    const resetPayload = `${otp}_${expiresAt}`;

    // 2. Save OTP payload in Brevo contact attributes (in SMS attribute as a string token)
    await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        attributes: {
          // We can store the OTP in a temporary attribute
          DOUBLE_OPT_IN: resetPayload,
        },
      }),
    }).catch(() => {});

    // 3. Send 6-digit OTP email directly to the participant
    await sendOtpViaBrevo(email, name, otp, brevoApiKey, brevoSenderEmail);

    return NextResponse.json({
      success: true,
      message: `A 6-digit password reset code has been sent to ${email}.`,
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 });
  }
}
