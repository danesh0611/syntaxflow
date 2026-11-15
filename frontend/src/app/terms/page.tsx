import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | SyntaxFlow',
  description: 'Terms of Service and conditions for using the SyntaxFlow technical education platform.',
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 flex-1">
        <div className="border-b border-card-border pb-6 mb-8">
          <div className="font-mono text-xs uppercase tracking-wider text-accent mb-2">Legal & Compliance</div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">Terms of Service</h1>
          <p className="text-xs sm:text-sm text-muted mt-2 font-mono">Last updated: November 15, 2026</p>
        </div>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-muted">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">1. Agreement to Terms</h2>
            <p>
              By accessing or using <strong>SyntaxFlow</strong> (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service and our{' '}
              <Link href="/privacy" className="text-foreground underline underline-offset-4 hover:text-accent">
                Privacy Policy
              </Link>
              . If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">2. Educational & Informational Purpose</h2>
            <p>
              All materials published on SyntaxFlow—including DSA editorials, algorithm dry runs, C++ / Python / SQL code snippets, semester engineering breakdowns, and tech recruitment advice—are provided strictly for educational and self-study preparation.
            </p>
            <p>
              While we strive for technical accuracy and optimal complexity bounds, we make no guarantees regarding placement offers or interview outcomes at any third-party company.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">3. Intellectual Property Rights</h2>
            <p>
              The original written tutorials, visual circuit diagrams, architecture dry-run tables, and site code are the intellectual property of SyntaxFlow and its curators. You may use our code solutions in personal projects and interview practice. Reproduction, scraping, or mass redistribution of our articles without explicit attribution is strictly prohibited.
            </p>
            <p>
              All company logos, product names, and problem trademarks (e.g., LeetCode, FAANG companies) cited on this site belong to their respective trademark holders. SyntaxFlow is an independent educational initiative and is not endorsed by or affiliated with LeetCode or any recruitment entity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">4. User Accounts & Course Access</h2>
            <p>
              For features requiring registration (such as the SQL Placement Course), you agree to provide true, accurate, and current information. You are solely responsible for maintaining the confidentiality of your account credentials.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">5. Third-Party Links & Advertisements</h2>
            <p>
              Our Service may contain links to third-party web sites or services (e.g., Google, LeetCode, external research papers) and serves third-party advertisements via Google AdSense. SyntaxFlow has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party sites.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">6. Limitation of Liability</h2>
            <p>
              In no event shall SyntaxFlow, its founders, or contributors be liable for any indirect, incidental, special, or consequential damages resulting from your use of or inability to use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">7. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. We will post any changes on this page with an updated revision date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">8. Inquiries</h2>
            <p>
              For legal questions or feedback regarding these terms, contact us at{' '}
              <a href="mailto:syntaxflowarticles@gmail.com" className="text-accent hover:underline font-mono">
                syntaxflowarticles@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
