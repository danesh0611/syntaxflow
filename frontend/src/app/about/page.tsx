import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | SyntaxFlow',
  description: 'Learn about SyntaxFlow: mission, curation, editorial standards, and placement tools for engineering students.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 flex-1">
        <div className="border-b border-card-border pb-6 mb-8">
          <div className="font-mono text-xs uppercase tracking-wider text-accent mb-2">Our Mission &amp; Team</div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">About SyntaxFlow</h1>
          <p className="text-sm sm:text-base text-muted mt-2">
            The engineering placement and core subjects hub designed to replace 40-hour slow video courses with clear, high-yield technical editorials.
          </p>
        </div>

        <div className="space-y-10 text-sm sm:text-base leading-relaxed text-muted">
          {/* Mission */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Why We Built SyntaxFlow</h2>
            <p>
              Engineering students and tech job seekers today face a fragmented landscape. College semester syllabi often lag behind real-world tech requirements, while interview preparation is cluttered with paywalled resources, bloated video playlists, and boilerplate solutions that skip the &ldquo;why&rdquo; behind optimal algorithms.
            </p>
            <p>
              <strong>SyntaxFlow</strong> was created to solve this problem by uniting four essential pillars under one clean, distraction-free roof:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-card-bg border border-card-border">
                <div className="font-mono text-xs font-bold text-accent uppercase mb-1">Pillar 1</div>
                <h3 className="text-sm font-bold text-foreground">100 FAANG DSA Sheet</h3>
                <p className="text-xs text-muted mt-1">
                  A curated checklist tracker covering high-frequency patterns with real LeetCode stats sync.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-card-bg border border-card-border">
                <div className="font-mono text-xs font-bold text-emerald-500 uppercase mb-1">Pillar 2</div>
                <h3 className="text-sm font-bold text-foreground">Algorithm Dry Runs &amp; Editorials</h3>
                <p className="text-xs text-muted mt-1">
                  Brute-force to optimal C++ solutions, complete with step-by-step dry-run execution tables.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-card-bg border border-card-border">
                <div className="font-mono text-xs font-bold text-blue-500 uppercase mb-1">Pillar 3</div>
                <h3 className="text-sm font-bold text-foreground">SQL Interview Mastery</h3>
                <p className="text-xs text-muted mt-1">
                  A self-paced course from basic joins to window functions, recursive CTEs, and index internals.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-card-bg border border-card-border">
                <div className="font-mono text-xs font-bold text-amber-500 uppercase mb-1">Pillar 4</div>
                <h3 className="text-sm font-bold text-foreground">Semester Core Subjects</h3>
                <p className="text-xs text-muted mt-1">
                  Wireless Communications, RF Synthesizers, Systems Architecture, and Python &amp; ML essentials.
                </p>
              </div>
            </div>
          </section>

          {/* Editorial Standards */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Editorial Integrity &amp; Standards</h2>
            <p>
              Every article published on SyntaxFlow undergoes rigorous technical verification:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Code Correctness:</strong> Code implementations in C++, Python, and SQL are compiled and benchmarked against competitive test suites before publication.
              </li>
              <li>
                <strong>Complexity Disclosures:</strong> Time and space bounds are clearly stated for every approach with explicit explanations of trade-offs.
              </li>
              <li>
                <strong>Zero AI-Generated Fluff:</strong> Explanations are written to be concise, human, and directly actionable for interviews and exams.
              </li>
            </ul>
          </section>

          {/* Curator Profile */}
          <section className="p-6 rounded-2xl bg-card-bg border border-card-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/30 text-accent font-bold flex items-center justify-center font-mono text-base">
                CD
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Chakradhar Danesh</h3>
                <p className="text-xs text-muted">Founder &amp; Principal Curator, SyntaxFlow</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted">
              Chakradhar is a software engineer passionate about developer tooling, systems design, and helping students crack technical placements. You can connect on{' '}
              <a
                href="https://www.linkedin.com/in/chakradhar-danesh/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline font-semibold"
              >
                LinkedIn
              </a>{' '}
              or reach out directly via email.
            </p>
          </section>

          {/* Get in touch */}
          <section className="space-y-2 border-t border-card-border/60 pt-6">
            <h2 className="text-lg font-bold text-foreground">Have Questions or Suggestions?</h2>
            <p>
              We welcome article suggestions, technical corrections, and partnership inquiries. Visit our{' '}
              <Link href="/contact" className="text-accent hover:underline font-semibold">
                Contact Page
              </Link>{' '}
              or email us at{' '}
              <a href="mailto:syntaxflowarticles@gmail.com" className="text-foreground font-mono hover:text-accent">
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
