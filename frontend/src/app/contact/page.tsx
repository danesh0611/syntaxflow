'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Open standard mailto with prefilled fields
    const mailtoUrl = `mailto:syntaxflowarticles@gmail.com?subject=${encodeURIComponent(
      `[SyntaxFlow Contact] ${subject}`
    )}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
    window.location.href = mailtoUrl;
    setSubmitted(true);
  };

  return (
    <>
      <Header />
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 flex-1">
        <div className="border-b border-card-border pb-6 mb-8">
          <div className="font-mono text-xs uppercase tracking-wider text-accent mb-2">Get in Touch</div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">Contact Us</h1>
          <p className="text-sm sm:text-base text-muted mt-2">
            Have a question about a problem solution, need career advice, or found a typo? We would love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Contact Details */}
          <div className="md:col-span-5 space-y-6">
            <div className="p-5 rounded-2xl bg-card-bg border border-card-border space-y-4">
              <h2 className="text-base font-bold text-foreground">Direct Support</h2>
              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="text-muted block text-[11px] font-mono uppercase">Editorial &amp; General Inquiries</span>
                  <a
                    href="mailto:syntaxflowarticles@gmail.com"
                    className="text-foreground hover:text-accent font-semibold transition-colors"
                  >
                    syntaxflowarticles@gmail.com
                  </a>
                </div>
                <div>
                  <span className="text-muted block text-[11px] font-mono uppercase">Official LinkedIn</span>
                  <a
                    href="https://www.linkedin.com/company/syntaxflowarticles"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline font-semibold"
                  >
                    linkedin.com/company/syntaxflowarticles
                  </a>
                </div>
                <div>
                  <span className="text-muted block text-[11px] font-mono uppercase">WhatsApp Community (Tech &amp; Job Updates)</span>
                  <a
                    href="https://whatsapp.com/channel/0029Vb9nkyB4Y9lqHPPzes3G"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold inline-flex items-center gap-1 mt-0.5"
                  >
                    <span>Join WhatsApp Channel</span>
                    <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
                <div>
                  <span className="text-muted block text-[11px] font-mono uppercase">Typical Response Time</span>
                  <span className="text-foreground">Within 24 to 48 hours</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-card-bg/60 border border-card-border space-y-2 text-xs text-muted">
              <h3 className="font-bold text-foreground">Editorial Submissions &amp; Corrections</h3>
              <p>
                If you are reporting a bug or recommending an alternative algorithm dry-run, please include the problem title and edge-case test vector so we can verify and update the tutorial.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-7">
            {submitted ? (
              <div className="p-8 rounded-2xl bg-card-bg border border-card-border text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto text-lg font-bold">
                  ✓
                </div>
                <h2 className="text-lg font-bold text-foreground">Mail Client Opened</h2>
                <p className="text-xs sm:text-sm text-muted">
                  Your email draft has been generated. You can also write directly to{' '}
                  <strong className="text-foreground">syntaxflowarticles@gmail.com</strong>.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold bg-card-bg border border-card-border text-foreground hover:bg-card-border/40 transition-colors cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-card-bg border border-card-border space-y-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-foreground mb-1.5">
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Sharma"
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-background border border-card-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-foreground mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-background border border-card-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-semibold text-foreground mb-1.5">
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Editorial Question or Feedback"
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-background border border-card-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-semibold text-foreground mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry or feedback..."
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-background border border-card-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-foreground transition-colors resize-y"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg text-xs font-semibold bg-foreground text-background hover:opacity-90 active:scale-98 transition-all cursor-pointer"
                >
                  Send Message via Email
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
