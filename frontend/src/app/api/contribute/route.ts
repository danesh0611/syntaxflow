import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

function generateSubmissionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SF-CONTRIB-${timestamp}-${rand}`;
}

/** Helper to persist submission to Firebase Firestore */
async function saveToFirestore(submission: Record<string, any>) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const apiKey = process.env.FIREBASE_API_KEY;

  if (!projectId || !apiKey) {
    return false;
  }

  try {
    const docId = submission.id;
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/contributor_submissions/${docId}?key=${apiKey}`;

    // Convert values to Firestore field format
    const fields: Record<string, any> = {
      submissionId: { stringValue: submission.id || '' },
      name: { stringValue: submission.name || '' },
      email: { stringValue: submission.email || '' },
      bio: { stringValue: submission.bio || '' },
      socialLink: { stringValue: submission.socialLink || '' },
      title: { stringValue: submission.title || '' },
      category: { stringValue: submission.category || '' },
      summary: { stringValue: submission.summary || '' },
      fileName: { stringValue: submission.fileName || '' },
      fileType: { stringValue: submission.fileType || '' },
      fileSize: { integerValue: String(submission.fileSize || 0) },
      hasPhoto: { booleanValue: Boolean(submission.photo) },
      hasDocument: { booleanValue: Boolean(submission.documentData || submission.directText) },
      status: { stringValue: submission.status || 'pending_review' },
      submittedAt: { timestampValue: new Date(submission.submittedAt || Date.now()).toISOString() },
    };

    // If photo is a short URL or base64 (keep under 500kb for firestore doc limits)
    if (submission.photo && typeof submission.photo === 'string') {
      if (submission.photo.length < 500000) {
        fields.photo = { stringValue: submission.photo };
      }
    }

    // Direct text / excerpt
    if (submission.directText && typeof submission.directText === 'string') {
      fields.directText = { stringValue: submission.directText.slice(0, 10000) };
    }

    const res = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });

    return res.ok;
  } catch (err) {
    console.error('Error saving to Firestore:', err);
    return false;
  }
}

const SANITY_CATEGORY_MAP: Record<string, string> = {
  'data structures & algorithms': 'c6e5283d-ce33-4e78-8e00-32ea0a1e1c72',
  'dsa': 'c6e5283d-ce33-4e78-8e00-32ea0a1e1c72',
  'computer networks': 'category-computer-networks',
  'dbms & sql': 'fZKX7YlUCjTZkOc7pOmS0m',
  'sql': 'fZKX7YlUCjTZkOc7pOmS0m',
  'python & machine learning': '1bbef377-aaf1-41f1-9627-7cedefc5e035',
  'python': '1bbef377-aaf1-41f1-9627-7cedefc5e035',
  'machine learning': '9371f7a3-e983-4df5-9f62-1a18aae8e79d',
  'formal language automata': 'b45b740d-ecc1-4f0d-a063-8a8d394fb404',
  'short range wireless communication': 'f4a4fd28-3f1e-4987-988d-43edfb253d13',
  'system design & architecture': 'category-computer-networks',
  'placement guides & interview experiences': 'cf005f28-9edc-4340-8908-a4f50b0bf7cf',
  'other': '4ea66247-fffb-46da-bca3-c771a4baaa9f',
};

/** Helper to create a document in the dedicated Contributor Submissions schema in Sanity Studio */
async function createSanityDraft(submission: Record<string, any>) {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'uxe5yl0p';
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const token =
    process.env.SANITY_API_TOKEN ||
    process.env.SANITY_WRITE_TOKEN ||
    process.env.SANITY_AUTH_TOKEN;

  if (!projectId) {
    return { created: false, reason: 'missing_project_id' };
  }

  // Saved under dedicated contribution document ID in Sanity Studio
  const docId = `contrib-${(submission.id || Date.now().toString()).toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const rawContent = submission.documentData || submission.directText || submission.summary || '';

  const mutationPayload = {
    mutations: [
      {
        createOrReplace: {
          _id: docId,
          _type: 'contribution',
          title: submission.title || 'Untitled Submission',
          authorName: submission.name || 'Anonymous',
          authorEmail: submission.email || '',
          authorPhoto: typeof submission.photo === 'string' && submission.photo.length < 500000 ? submission.photo : '',
          bio: submission.bio || '',
          socialLink: submission.socialLink || '',
          category: submission.category || 'General',
          summary: submission.summary || '',
          documentContent: rawContent,
          fileName: submission.fileName || 'draft.md',
          status: 'pending',
          submissionId: submission.id || '',
          submittedAt: new Date(submission.submittedAt || Date.now()).toISOString(),
        },
      },
    ],
  };

  if (!token) {
    console.log(
      '[Sanity] Note: SANITY_API_TOKEN is not configured in .env.local yet. Contribution mutation payload prepared for Sanity Studio.'
    );
    return { created: false, reason: 'missing_token', docId, mutationPayload };
  }

  try {
    const res = await fetch(
      `https://${projectId}.api.sanity.io/v2024-05-25/data/mutate/${dataset}?returnDocuments=true`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(mutationPayload),
      }
    );

    if (res.ok) {
      console.log(`[Sanity] Successfully created contribution "${docId}" in Sanity Studio.`);
      return { created: true, docId };
    } else {
      const errText = await res.text();
      console.error('[Sanity] Mutation failed:', errText);
      return { created: false, error: errText };
    }
  } catch (err) {
    console.error('[Sanity] Exception creating draft in Sanity:', err);
    return { created: false, error: err };
  }
}



/** Optional confirmation email via Brevo */
async function sendConfirmationEmail(
  name: string,
  email: string,
  title: string,
  submissionId: string,
  extra?: { category?: string; summary?: string; fileName?: string }
) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL || 'syntaxflowarticles@gmail.com';

  if (!brevoApiKey) return;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Article Received - SyntaxFlow Editorial Team</title>
</head>
<body style="margin:0;padding:0;background:#090d1a;font-family:'Outfit','Segoe UI',Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#090d1a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:540px;background:#111827;border-radius:20px;overflow:hidden;border:1px solid #1f293d;box-shadow:0 12px 40px rgba(0,0,0,0.5);">
          <tr><td style="height:6px;background:#3b82f6;"></td></tr>
          <tr>
            <td style="padding:40px 36px 24px;text-align:center;">
              <div style="margin-bottom:12px;">
                <span style="font-size:24px;font-weight:900;color:#ffffff;">SyntaxFlow</span>
                <span style="display:inline-block;margin-left:8px;padding:3px 10px;background:rgba(59,130,246,0.15);border:1px solid #3b82f6;color:#60a5fa;font-size:11px;font-weight:700;border-radius:999px;">EDITORIAL SUBMISSION</span>
              </div>
              <h1 style="margin:0 0 10px;font-size:22px;font-weight:800;color:#ffffff;">Article Received, ${name}!</h1>
              <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;">
                Thank you for contributing your technical work to Syntax Flow. We have received your article draft:
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 24px;text-align:center;">
              <div style="display:inline-block;padding:14px 20px;background:rgba(59,130,246,0.1);border:1px dashed #3b82f6;border-radius:12px;max-width:90%;">
                <span style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;">Tracking ID: ${submissionId}</span>
                <span style="font-size:15px;font-weight:700;color:#60a5fa;display:block;">${title}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 36px;background:rgba(255,255,255,0.02);border-top:1px solid #1f293d;border-bottom:1px solid #1f293d;">
              <h2 style="font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin:0 0 10px;letter-spacing:1px;">What Happens Next:</h2>
              <ul style="margin:0;padding-left:18px;color:#cbd5e1;font-size:13px;line-height:1.8;">
                <li><strong>🎖️ Contributor Medal:</strong> Once approved, you earn the Contributor Medal and your author profile is featured on the website for 1 month.</li>
                <li><strong>📜 20-Article Certificate:</strong> Every accepted article tracks toward the official <em>SyntaxFlow Technical Writing Certificate</em>.</li>
                <li><strong>Editorial Review:</strong> Our team reviews technical accuracy and formatting within 2-3 business days.</li>
              </ul>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    // Send to Contributor
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'SyntaxFlow Editorial Team', email: brevoSenderEmail },
        to: [{ email: email, name: name }],
        subject: `[Received] ${title} — SyntaxFlow Editorial Submission`,
        htmlContent: htmlContent,
      }),
    });

    // Send instant alert to SyntaxFlow admin
    const adminHtml = `
      <div style="font-family:sans-serif;max-width:600px;line-height:1.6;color:#1e293b;">
        <h2 style="color:#0f172a;margin-bottom:4px;">🚨 New Article Contribution Submitted</h2>
        <p style="color:#64748b;font-size:13px;margin-top:0;">Tracking ID: <strong>${submissionId}</strong></p>
        
        <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:8px 0;font-weight:bold;width:120px;">Author:</td>
            <td style="padding:8px 0;">${name} (<a href="mailto:${email}">${email}</a>)</td>
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:8px 0;font-weight:bold;">Title:</td>
            <td style="padding:8px 0;">${title}</td>
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:8px 0;font-weight:bold;">Category:</td>
            <td style="padding:8px 0;">${extra?.category || 'General'}</td>
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:8px 0;font-weight:bold;">Document:</td>
            <td style="padding:8px 0;">${extra?.fileName || 'Uploaded'}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:bold;vertical-align:top;">Summary:</td>
            <td style="padding:8px 0;">${extra?.summary || 'N/A'}</td>
          </tr>
        </table>

        <div style="margin-top:20px;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:12px;color:#64748b;">
          <strong>Where to review:</strong>
          <ul style="margin:6px 0 0;padding-left:18px;">
            <li>Sanity Studio: <strong>Contributor Submissions</strong> desk</li>
            <li>Firestore collection: <code>contributor_submissions/${submissionId}</code></li>
          </ul>
        </div>
      </div>
    `;

    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'SyntaxFlow Submissions', email: brevoSenderEmail },
        to: [{ email: 'syntaxflowarticles@gmail.com', name: 'Editorial Board' }],
        subject: `[New Contribution] "${title}" by ${name}`,
        htmlContent: adminHtml,
      }),
    });
  } catch (err) {
    console.error('Brevo email sending failed (non-fatal):', err);
  }
}

/** GET: Retrieve featured community contributors */
export async function GET() {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const apiKey = process.env.FIREBASE_API_KEY;

    if (projectId && apiKey) {
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/contributor_submissions?key=${apiKey}&pageSize=12`;
      const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        const documents = data.documents || [];
        const contributors = documents.map((doc: any) => {
          const f = doc.fields || {};
          return {
            id: f.submissionId?.stringValue || '',
            name: f.name?.stringValue || 'Contributor',
            bio: f.bio?.stringValue || 'SyntaxFlow Tech Writer',
            socialLink: f.socialLink?.stringValue || '',
            photo: f.photo?.stringValue || '',
            title: f.title?.stringValue || 'Community Contribution',
            category: f.category?.stringValue || 'Engineering',
            articlesCount: 1,
            isCertified: false,
            status: f.status?.stringValue || 'approved',
            submittedAt: f.submittedAt?.timestampValue || new Date().toISOString(),
          };
        });
        return NextResponse.json({ contributors });
      }
    }
    return NextResponse.json({ contributors: [] });
  } catch (err) {
    console.error('GET contributions error:', err);
    return NextResponse.json({ contributors: [] });
  }
}

/** POST: Submit new work to contribute */
export async function POST(request: Request) {
  try {
    let name = '';
    let email = '';
    let bio = '';
    let socialLink = '';
    let photo = '';
    let title = '';
    let category = '';
    let summary = '';
    let fileName = '';
    let fileType = '';
    let fileSize = 0;
    let documentData = '';
    let directText = '';

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = (formData.get('name') as string || '').trim();
      email = (formData.get('email') as string || '').trim().toLowerCase();
      bio = (formData.get('bio') as string || '').trim();
      socialLink = (formData.get('socialLink') as string || '').trim();
      photo = (formData.get('photoUrl') as string || '').trim();
      title = (formData.get('title') as string || '').trim();
      category = (formData.get('category') as string || 'General Engineering').trim();
      summary = (formData.get('summary') as string || '').trim();
      directText = (formData.get('directText') as string || '').trim();

      // Check photo file
      const photoFile = formData.get('photoFile') as File | null;
      if (photoFile && photoFile.size > 0) {
        const photoBuffer = await photoFile.arrayBuffer();
        const photoBase64 = Buffer.from(photoBuffer).toString('base64');
        photo = `data:${photoFile.type || 'image/jpeg'};base64,${photoBase64}`;
      }

      // Check document file
      const documentFile = formData.get('document') as File | null;
      if (documentFile && documentFile.size > 0) {
        fileName = documentFile.name;
        fileType = documentFile.type;
        fileSize = documentFile.size;

        if (documentFile.type.includes('text') || fileName.endsWith('.md') || fileName.endsWith('.txt')) {
          documentData = await documentFile.text();
        } else {
          const docBuffer = await documentFile.arrayBuffer();
          documentData = `data:${documentFile.type || 'application/octet-stream'};base64,${Buffer.from(docBuffer).toString('base64')}`;
        }
      }
    } else {
      // JSON body
      const body = await request.json();
      name = (body?.name || '').trim();
      email = (body?.email || '').trim().toLowerCase();
      bio = (body?.bio || '').trim();
      socialLink = (body?.socialLink || '').trim();
      photo = (body?.photo || body?.photoUrl || '').trim();
      title = (body?.title || '').trim();
      category = (body?.category || 'General Engineering').trim();
      summary = (body?.summary || '').trim();
      fileName = (body?.fileName || '').trim();
      fileType = (body?.fileType || '').trim();
      fileSize = Number(body?.fileSize || 0);
      documentData = (body?.documentData || '').trim();
      directText = (body?.directText || '').trim();
    }

    // Validation
    if (!name) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: 'Please provide a title for your article.' }, { status: 400 });
    }

    if (!documentData && !directText && !fileName) {
      return NextResponse.json(
        { error: 'Please upload an article document (.md, .pdf, .docx, .txt) or write your draft.' },
        { status: 400 }
      );
    }

    const submissionId = generateSubmissionId();
    const submissionRecord = {
      id: submissionId,
      name,
      email,
      bio: bio || 'SyntaxFlow Contributing Author',
      socialLink,
      photo: photo || '',
      title,
      category,
      summary,
      fileName: fileName || (directText ? 'direct_draft.md' : 'article_submission'),
      fileType: fileType || 'text/markdown',
      fileSize: fileSize || (directText ? directText.length : 0),
      documentData: documentData || directText,
      directText,
      articlesCount: 1,
      isCertified: false,
      status: 'pending_review',
      featured: true,
      submittedAt: new Date().toISOString(),
    };

    // 1. Save to Firebase Firestore
    await saveToFirestore(submissionRecord);

    // 2. Create as an unpublished Draft in Sanity Studio
    await createSanityDraft(submissionRecord);

    // 3. Dispatch confirmation & editorial alert email (async, non-blocking)
    sendConfirmationEmail(name, email, title, submissionId, {
      category,
      summary,
      fileName: fileName || (directText ? 'direct_draft.md' : 'article_submission'),
    }).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        submissionId,
        message: 'Your contribution has been received and stored. Once approved, you will earn the Contributor Medal and be featured on the website for a month.',
        milestone: {
          articlesSubmitted: 1,
          nextGoal: 20,
          medal: 'Contributor Medal',
          featureDuration: '1 month',
          targetPerk: 'Official Technical Writing Certificate (20 articles)',
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Contribute API error:', err);
    return NextResponse.json(
      { error: 'An error occurred while processing your submission. Please try again.' },
      { status: 500 }
    );
  }
}
