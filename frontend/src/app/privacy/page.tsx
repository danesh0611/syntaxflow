import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | SyntaxFlow',
  description: 'Privacy Policy and cookie disclosures for SyntaxFlow engineering and placement hub.',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 flex-1">
        <div className="border-b border-card-border pb-6 mb-8">
          <div className="font-mono text-xs uppercase tracking-wider text-accent mb-2">Legal & Compliance</div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">Privacy Policy</h1>
          <p className="text-xs sm:text-sm text-muted mt-2 font-mono">Last updated: November 15, 2026</p>
        </div>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-muted">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">1. Introduction</h2>
            <p>
              Welcome to <strong>SyntaxFlow</strong> (accessible from{' '}
              <Link href="/" className="text-foreground underline underline-offset-4 hover:text-accent">
                syntaxflowarticles.pages.dev
              </Link>{' '}
              and related custom domains). We respect your privacy and are committed to safeguarding your personal information.
              This Privacy Policy explains how information is collected, used, and protected when you read our technical guides,
              use our 100 FAANG DSA Sheet, participate in our SQL placement course, or subscribe to our newsletter.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">2. Google AdSense & Third-Party Advertising Cookies</h2>
            <p className="p-4 rounded-xl bg-card-bg border border-card-border text-foreground text-xs sm:text-sm">
              <strong>Mandatory Disclosure:</strong> We use Google AdSense to serve advertisements on our platform.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Third-party vendors, including <strong>Google</strong>, use cookies to serve ads based on a user&apos;s prior visits to our website or other websites across the Internet.
              </li>
              <li>
                Google&apos;s use of advertising cookies (such as the DoubleClick cookie) enables it and its partners to serve personalized ads to our users based on their visits to SyntaxFlow and/or other sites on the web.
              </li>
              <li>
                Users may opt out of personalized advertising by visiting{' '}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline font-semibold"
                >
                  Google Ads Settings
                </a>
                .
              </li>
              <li>
                Alternatively, you can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting{' '}
                <a
                  href="https://www.aboutads.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline font-semibold"
                >
                  www.aboutads.info
                </a>
                .
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">3. Information We Collect</h2>
            <p>We collect information in the following ways:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Newsletter & Course Registration:</strong> When you subscribe to the SyntaxFlow Dispatch or register for our free SQL course, we collect your email address and authentication credentials securely (stored via encrypted tokens).
              </li>
              <li>
                <strong>Log Files & Analytics:</strong> Like most standard websites, we utilize log files and analytics services (Google Analytics and Microsoft Clarity). These record IP addresses, browser types, Internet Service Providers (ISP), referring/exit pages, date/time stamps, and page interactions to analyze technical trends and improve site performance.
              </li>
              <li>
                <strong>Local Storage:</strong> We use browser localStorage to preserve your dark/light theme preference and problem completion progress in the 100 FAANG DSA Sheet without requiring login.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">4. Cookies and Web Beacons</h2>
            <p>
              SyntaxFlow uses cookies to store information about visitors&apos; preferences and record user-specific information on which pages the visitor accesses or visits. Third-party ad networks may also use cookies, JavaScript, or Web Beacons in their advertisements that appear on SyntaxFlow, which are sent directly to your browser.
            </p>
            <p>
              Note that SyntaxFlow has no access to or control over cookies that are used by third-party advertisers. You can choose to disable cookies through your individual browser options.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">5. Children&apos;s Information</h2>
            <p>
              Protecting children while using the internet is paramount. SyntaxFlow does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you believe your child provided this information on our website, please contact us immediately and we will promptly remove it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">6. Contact Us</h2>
            <p>
              If you have any questions, feedback, or data privacy requests regarding this Privacy Policy, please contact us directly:
            </p>
            <div className="p-4 rounded-xl bg-card-bg border border-card-border font-mono text-xs sm:text-sm text-foreground">
              <p>Email: <a href="mailto:syntaxflowarticles@gmail.com" className="text-accent hover:underline">syntaxflowarticles@gmail.com</a></p>
              <p className="mt-1 text-muted">Platform: SyntaxFlow &bull; Engineering &amp; Tech Placement Hub</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
