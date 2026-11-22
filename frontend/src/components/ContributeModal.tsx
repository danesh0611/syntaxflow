'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: 'benefits' | 'form';
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

export const ContributeModal: React.FC<ContributeModalProps> = ({
  isOpen,
  onClose,
  initialStep = 'benefits',
}) => {
  const [step, setStep] = useState<'benefits' | 'form' | 'success'>(initialStep);
  const [mounted, setMounted] = useState(false);

  // Form State
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

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submissionId, setSubmissionId] = useState('');

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setStep(initialStep);
      setErrorMsg('');
    } else {
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen, initialStep]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please enter your article title.');
      return;
    }
    if (inputMode === 'upload' && !documentFile && !directText.trim()) {
      setErrorMsg('Please upload your article document (.md, .pdf, .docx, .txt) or write your draft text.');
      return;
    }
    if (inputMode === 'text' && !directText.trim()) {
      setErrorMsg('Please write or paste your article draft text.');
      return;
    }

    setLoading(true);

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
        setSubmissionId(data.submissionId);
        setStep('success');
      } else {
        setErrorMsg(data.error || 'Failed to submit article. Please try again.');
      }
    } catch {
      setErrorMsg('Network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 transition-all duration-200 ${
        isOpen ? 'bg-black/60 backdrop-blur-xs opacity-100' : 'bg-transparent opacity-0 pointer-events-none'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl bg-card-bg border border-card-border rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-card-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">
              {step === 'benefits' && 'Contribute to Syntax Flow'}
              {step === 'form' && 'Submit Your Technical Article'}
              {step === 'success' && 'Article Stored Successfully'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: BENEFITS */}
          {step === 'benefits' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Contributor Perks &amp; Publication Milestones
                </h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Share your technical knowledge with engineering students and developers.
                </p>
              </div>

              <div className="space-y-3">
                {/* 1 Article */}
                <div className="p-3.5 rounded-lg border border-card-border bg-card-bg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      🎖️ Contributor Medal &amp; 1-Month Website Feature
                    </span>
                    <span className="text-[10px] font-mono text-muted uppercase">1 Article</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Even contributing <strong>one article</strong> earns you the Contributor Medal and features you and your photo in the website spotlight for <strong>one month</strong>.
                  </p>
                </div>

                {/* 20 Articles */}
                <div className="p-3.5 rounded-lg border border-card-border bg-card-bg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      📜 Official Technical Writing Certificate
                    </span>
                    <span className="text-[10px] font-mono text-muted uppercase">20 Articles</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Publishing <strong>20 articles</strong> earns an official SyntaxFlow Certificate with a verifiable ID to showcase on LinkedIn and your resume.
                  </p>
                </div>

                {/* Join Editorial */}
                <div className="p-3.5 rounded-lg border border-card-border bg-card-bg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      ✍️ Join the Editorial Team
                    </span>
                    <span className="text-[10px] font-mono text-muted uppercase">Core Team</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Active authors can join the editorial board to review incoming submissions and co-author placement roadmaps.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Link
                  href="/contribute"
                  onClick={onClose}
                  className="text-xs text-muted hover:text-foreground underline underline-offset-4"
                >
                  View full contributor page &rarr;
                </Link>

                <button
                  onClick={() => setStep('form')}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-foreground text-background hover:opacity-90 active:scale-98 transition-all cursor-pointer"
                >
                  Continue to Submit Article &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: FORM */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-card-bg border border-card-border focus:border-foreground text-foreground outline-none transition-colors"
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
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-card-bg border border-card-border focus:border-foreground text-foreground outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Photo Option: Just to feature on website for 1 month */}
              <div className="p-3 rounded-lg border border-card-border bg-card-border/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Author Photo Option <span className="text-muted font-normal">(just to feature on website for 1 month)</span>
                  </label>
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

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full border border-card-border bg-card-bg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {photoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-muted text-[10px]">Photo</span>
                    )}
                  </div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    id="modal-photo"
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="px-2.5 py-1 rounded text-xs bg-card-bg border border-card-border hover:border-foreground text-foreground transition-colors cursor-pointer"
                  >
                    {photoPreview ? 'Change Photo' : 'Choose Photo (PNG / JPG)'}
                  </button>
                </div>
              </div>

              {/* Bio & Social */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Bio <span className="text-muted font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="e.g. CS Sophomore / Backend Dev"
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-card-bg border border-card-border focus:border-foreground text-foreground outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Social URL <span className="text-muted font-normal">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={socialLink}
                    onChange={(e) => setSocialLink(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-card-bg border border-card-border focus:border-foreground text-foreground outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Article Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Article Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Inode Allocation in ext4 Filesystem"
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-card-bg border border-card-border focus:border-foreground text-foreground outline-none transition-colors"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-card-bg border border-card-border focus:border-foreground text-foreground outline-none transition-colors"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Document Upload <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setInputMode('upload')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        inputMode === 'upload' ? 'bg-card-border font-semibold text-foreground' : 'text-muted'
                      }`}
                    >
                      File
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('text')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        inputMode === 'text' ? 'bg-card-border font-semibold text-foreground' : 'text-muted'
                      }`}
                    >
                      Paste
                    </button>
                  </div>
                </div>

                {inputMode === 'upload' ? (
                  <div
                    onClick={() => docInputRef.current?.click()}
                    className="border border-dashed border-card-border hover:border-foreground rounded-lg p-5 text-center cursor-pointer bg-card-bg transition-colors"
                  >
                    <input
                      ref={docInputRef}
                      type="file"
                      accept=".md,.markdown,.pdf,.doc,.docx,.txt"
                      onChange={handleDocumentSelect}
                      className="hidden"
                      id="modal-doc"
                    />
                    {documentFile ? (
                      <p className="text-xs font-semibold text-foreground">{documentFile.name}</p>
                    ) : (
                      <p className="text-xs text-muted">Click to select document (.md, .pdf, .docx, .txt)</p>
                    )}
                  </div>
                ) : (
                  <textarea
                    rows={5}
                    value={directText}
                    onChange={(e) => setDirectText(e.target.value)}
                    placeholder="Paste article markdown draft here..."
                    className="w-full px-3 py-1.5 rounded-lg text-xs font-mono bg-card-bg border border-card-border focus:border-foreground text-foreground outline-none transition-colors"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('benefits')}
                  className="text-xs text-muted hover:text-foreground cursor-pointer"
                >
                  &larr; Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-foreground text-background hover:opacity-90 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Submitting…' : 'Submit Article'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg mx-auto font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Your Article Has Been Stored
                </h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Thank you for contributing! Our editorial team will review your article.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-card-border/20 border border-card-border max-w-xs mx-auto text-xs space-y-1 text-left">
                <div className="flex justify-between">
                  <span className="text-muted font-mono">Tracking ID:</span>
                  <span className="font-mono font-semibold text-foreground">{submissionId}</span>
                </div>
                <p className="text-[11px] text-muted pt-1">
                  Once published, you will receive the Contributor Medal and be featured on the site for a month!
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
