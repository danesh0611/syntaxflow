'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface Contributor {
  id: string;
  name: string;
  bio: string;
  socialLink?: string;
  photo?: string;
  title?: string;
  category?: string;
  articlesCount?: number;
  isCertified?: boolean;
}

const CATEGORIES = [
  'Data Structures & Algorithms',
  'System Design & Architecture',
  'Computer Networks',
  'Operating Systems',
  'DBMS & SQL',
  'Frontend & Full Stack',
  'Python & Machine Learning',
  'Placement Guides & Interview Experiences',
  'Other',
];

const DEFAULT_CONTRIBUTORS: Contributor[] = [
  {
    id: 'SF-FELLOW-01',
    name: 'Arjun Sharma',
    bio: 'Distributed Systems & 20+ Article Fellow',
    category: 'Computer Networks',
    title: 'Optimizing TCP Window Scaling for High-Latency Backbones',
    articlesCount: 20,
    isCertified: true,
  },
  {
    id: 'SF-FEAT-02',
    name: 'Priya Nair',
    bio: 'Competitive Programmer | Contributor Medal',
    category: 'Data Structures & Algorithms',
    title: 'Demystifying Red-Black Tree Balancing with Step-by-Step Traces',
    articlesCount: 1,
    isCertified: false,
  },
  {
    id: 'SF-FEAT-03',
    name: 'Rohan Verma',
    bio: 'Database Engineer | Contributor Medal',
    category: 'DBMS & SQL',
    title: 'PostgreSQL MVCC Under the Hood: Heap Tuples & Vacuuming',
    articlesCount: 1,
    isCertified: false,
  },
];

export default function ContributePage() {
  const [contributors, setContributors] = useState<Contributor[]>(DEFAULT_CONTRIBUTORS);
  const [loadingContributors, setLoadingContributors] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [summary, setSummary] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [directText, setDirectText] = useState('');
  const [inputMode, setInputMode] = useState<'upload' | 'text'>('upload');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedData, setSubmittedData] = useState<{
    submissionId: string;
    message: string;
  } | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadContributors() {
      try {
        const res = await fetch('/api/contribute');
        const data = await res.json();
        if (data.contributors && Array.isArray(data.contributors) && data.contributors.length > 0) {
          setContributors(data.contributors);
        }
      } catch (err) {
        console.error('Failed to load contributors:', err);
      } finally {
        setLoadingContributors(false);
      }
    }
    loadContributors();
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select a valid image file (PNG, JPG, or WEBP).');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please enter the article title.');
      return;
    }
    if (inputMode === 'upload' && !documentFile && !directText.trim()) {
      setErrorMsg('Please upload your article document (.md, .pdf, .docx, .txt) or write your draft.');
      return;
    }
    if (inputMode === 'text' && !directText.trim()) {
      setErrorMsg('Please write or paste your article draft text.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('bio', bio.trim());
      formData.append('socialLink', socialLink.trim());
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('summary', summary.trim());
      formData.append('directText', directText.trim());

      if (photoFile) {
        formData.append('photoFile', photoFile);
      } else if (photoPreview) {
        formData.append('photoUrl', photoPreview);
      }

      if (documentFile) {
        formData.append('document', documentFile);
      }

      const res = await fetch('/api/contribute', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmittedData({
          submissionId: data.submissionId,
          message: data.message,
        });
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        setErrorMsg(data.error || 'Failed to submit article. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Please check your internet connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 flex-1">
        {/* Page Header */}
        <section className="border-b border-card-border pb-8 mb-10">
          <div className="flex items-center gap-2 text-xs font-mono text-muted mb-2">
            <span>SyntaxFlow</span>
            <span>/</span>
            <span>Contributor Program</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Contribute Your Work
              </h1>
              <p className="text-sm text-muted mt-1.5 max-w-xl leading-relaxed">
                Publish technical articles, dry-run breakdowns, and engineering guides on Syntax Flow.
              </p>
            </div>
            <button
              onClick={scrollToForm}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-foreground text-background hover:opacity-90 active:scale-98 transition-all self-start md:self-auto cursor-pointer"
            >
              Submit Article &darr;
            </button>
          </div>
        </section>

        {/* Benefits Cards */}
        <section className="mb-12">
          <h2 className="text-xs font-mono uppercase tracking-wider text-muted font-semibold mb-4">
            Contributor Perks &amp; Milestones
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1 Article Perk */}
            <div className="p-5 rounded-xl bg-card-bg border border-card-border flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-[11px] font-semibold text-accent uppercase">
                    1 Article Published
                  </span>
                  <span className="text-sm">🎖️</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Contributor Medal &amp; 1-Month Feature
                </h3>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">
                  Publishing even one accepted article earns you the <strong>SyntaxFlow Contributor Medal</strong>, and features your profile and photo in the website showcase for <strong>one month</strong>.
                </p>
              </div>
              <div className="pt-2 border-t border-card-border/60 text-[11px] text-muted font-mono">
                Featured on site for 30 days
              </div>
            </div>

            {/* 20 Articles Perk */}
            <div className="p-5 rounded-xl bg-card-bg border border-card-border flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase">
                    20 Articles Milestone
                  </span>
                  <span className="text-sm">📜</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Official Technical Writing Certificate
                </h3>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">
                  Contributing 20 published articles earns you an official <strong>SyntaxFlow Certificate</strong> with a unique verification ID to showcase on your resume and LinkedIn.
                </p>
              </div>
              <div className="pt-2 border-t border-card-border/60 text-[11px] text-muted font-mono">
                Verified Credential ID included
              </div>
            </div>

            {/* Join Editorial Team */}
            <div className="p-5 rounded-xl bg-card-bg border border-card-border flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-[11px] font-semibold text-foreground uppercase">
                    Editorial Team
                  </span>
                  <span className="text-sm">✍️</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Come Join the Editorial Team
                </h3>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">
                  Active contributors are invited to join the core editorial board to review incoming submissions, curate problem lists, and co-author technical placement roadmaps.
                </p>
              </div>
              <div className="pt-2 border-t border-card-border/60 text-[11px] text-muted font-mono">
                Editorial bylines &amp; review privileges
              </div>
            </div>
          </div>
        </section>

        {/* This Month's Featured Contributors */}
        <section className="mb-12">
          <div className="flex items-center justify-between border-b border-card-border pb-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-foreground">
                This Month&apos;s Featured Contributors
              </h2>
              <p className="text-xs text-muted">
                Authors featured on the website this month for recent accepted articles.
              </p>
            </div>
          </div>

          {loadingContributors ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-card-bg border border-card-border animate-pulse h-28" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {contributors.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-card-bg border border-card-border flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-card-border bg-card-border/30 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {c.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.photo} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm">👤</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-foreground truncate">{c.name}</h4>
                        </div>
                        <p className="text-[11px] text-muted truncate">{c.bio || 'Contributing Author'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {c.isCertified ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-semibold">
                          📜 20+ Certificate Holder
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-accent font-semibold">
                          🎖️ Contributor Medal (Featured this month)
                        </span>
                      )}
                    </div>

                    {c.title && (
                      <p className="text-xs text-foreground font-medium line-clamp-1">
                        &ldquo;{c.title}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-card-border/60 flex items-center justify-between text-[11px] text-muted">
                    <span>{c.category || 'Engineering'}</span>
                    {c.socialLink && (
                      <a
                        href={c.socialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        Profile &rarr;
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Contribution Form */}
        <section ref={formRef} className="scroll-mt-16">
          <div className="p-6 rounded-xl bg-card-bg border border-card-border">
            <div className="border-b border-card-border pb-4 mb-6">
              <h2 className="text-lg font-bold text-foreground">Submit Your Article</h2>
              <p className="text-xs text-muted mt-1">
                Fill in your details and upload your article. Once submitted, our editorial team will store and review your work.
              </p>
            </div>

            {submittedData ? (
              <div className="p-6 rounded-lg bg-card-border/20 border border-card-border text-center space-y-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg mx-auto font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Article Successfully Stored</h3>
                  <p className="text-xs text-muted mt-1 max-w-md mx-auto">
                    {submittedData.message}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-card-bg border border-card-border max-w-xs mx-auto text-xs space-y-1 text-left">
                  <div className="flex justify-between">
                    <span className="text-muted font-mono">Tracking ID:</span>
                    <span className="font-mono font-semibold text-foreground">{submittedData.submissionId}</span>
                  </div>
                  <div className="text-[11px] text-muted pt-1">
                    Once accepted, you will receive the Contributor Medal and be featured on the site for a month!
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedData(null);
                    setTitle('');
                    setSummary('');
                    setDocumentFile(null);
                    setDirectText('');
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Submit Another Article
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                    {errorMsg}
                  </div>
                )}

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 rounded-lg text-xs bg-card-bg border border-card-border focus:border-foreground text-foreground outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rahul@example.com"
                      className="w-full px-3 py-2 rounded-lg text-xs bg-card-bg border border-card-border focus:border-foreground text-foreground outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Photo Option (Just to feature in website) */}
                <div className="p-4 rounded-lg border border-card-border bg-card-border/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-foreground">
                        Photo Option <span className="text-muted font-normal">(just to feature on website for 1 month)</span>
                      </label>
                      <p className="text-[11px] text-muted">
                        Optional profile photo to display on your article byline and monthly contributor spotlight.
                      </p>
                    </div>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPreview(null);
                          setPhotoFile(null);
                        }}
                        className="text-[11px] text-rose-500 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-10 h-10 rounded-full border border-card-border bg-card-bg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {photoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-muted text-xs">Photo</span>
                      )}
                    </div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                      id="contribute-photo"
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-card-bg border border-card-border hover:border-foreground text-foreground transition-colors cursor-pointer"
                    >
                      {photoPreview ? 'Change Photo' : 'Choose Photo (PNG / JPG)'}
                    </button>
                  </div>
                </div>

                {/* Bio & Social Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Short Bio <span className="text-muted font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="e.g. CS Sophomore @ VIT / Backend Dev"
                      className="w-full px-3 py-2 rounded-lg text-xs bg-card-bg border border-card-border focus:border-foreground text-foreground outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      LinkedIn or GitHub Profile <span className="text-muted font-normal">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={socialLink}
                      onChange={(e) => setSocialLink(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3 py-2 rounded-lg text-xs bg-card-bg border border-card-border focus:border-foreground text-foreground outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Article Title & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8">
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Article Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Demystifying TCP Window Scaling and Bufferbloat"
                      className="w-full px-3 py-2 rounded-lg text-xs bg-card-bg border border-card-border focus:border-foreground text-foreground outline-none transition-colors"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-xs bg-card-bg border border-card-border focus:border-foreground text-foreground outline-none transition-colors"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Summary / Key Takeaways <span className="text-muted font-normal">(1-2 sentences)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Brief description of what the reader will learn..."
                    className="w-full px-3 py-2 rounded-lg text-xs bg-card-bg border border-card-border focus:border-foreground text-foreground outline-none transition-colors resize-none"
                  />
                </div>

                {/* Document Upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-foreground">
                      Article Document <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setInputMode('upload')}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          inputMode === 'upload' ? 'bg-card-border text-foreground font-semibold' : 'text-muted'
                        }`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputMode('text')}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          inputMode === 'text' ? 'bg-card-border text-foreground font-semibold' : 'text-muted'
                        }`}
                      >
                        Paste Draft
                      </button>
                    </div>
                  </div>

                  {inputMode === 'upload' ? (
                    <div
                      onClick={() => docInputRef.current?.click()}
                      className={`border border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        documentFile
                          ? 'border-foreground bg-card-border/10'
                          : 'border-card-border hover:border-foreground bg-card-bg'
                      }`}
                    >
                      <input
                        ref={docInputRef}
                        type="file"
                        accept=".md,.markdown,.pdf,.doc,.docx,.txt"
                        onChange={handleDocumentSelect}
                        className="hidden"
                        id="contribute-doc"
                      />
                      {documentFile ? (
                        <div>
                          <p className="text-xs font-semibold text-foreground">{documentFile.name}</p>
                          <p className="text-[11px] text-muted mt-0.5">
                            {(documentFile.size / 1024).toFixed(1)} KB — Click to change file
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            Click to select your article document
                          </p>
                          <p className="text-[11px] text-muted mt-0.5">
                            Accepts Markdown (.md), PDF (.pdf), Word (.docx), or Text (.txt)
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <textarea
                        rows={7}
                        value={directText}
                        onChange={(e) => setDirectText(e.target.value)}
                        placeholder="Write or paste your article markdown here..."
                        className="w-full px-3 py-2 rounded-lg text-xs font-mono bg-card-bg border border-card-border focus:border-foreground text-foreground outline-none transition-colors"
                      />
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-between">
                  <p className="text-[11px] text-muted">
                    Submissions are stored securely and reviewed by our editorial team.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg text-xs font-semibold bg-foreground text-background hover:opacity-90 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Storing submission…' : 'Submit Article'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
