import { Metadata } from 'next';
import Link from 'next/link';
import { contentSource } from '@/lib/cms';
import { getSubjectBySlug } from '@/lib/coreSubjectsData';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import SubjectDetailClient from '@/components/core-subjects/SubjectDetailClient';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'edge';

interface PageProps {
  params: Promise<{ subject: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { subject: subjectParam } = await params;
    const subject = getSubjectBySlug(subjectParam);

    if (subject) {
      const title = `${subject.title} (${subject.code}) Notes & Architecture Guides | SyntaxFlow`;
      const description = `${subject.tagline}. ${subject.description}`;

      return {
        title,
        description,
        keywords: [
          subject.title.toLowerCase(),
          subject.code.toLowerCase(),
          'core engineering subjects',
          'syntaxflow',
        ],
        openGraph: {
          title,
          description,
          url: `https://syntaxflowarticles.pages.dev/core-subjects/${subject.slug}`,
          siteName: 'SyntaxFlow',
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
        },
        alternates: {
          canonical: `/core-subjects/${subject.slug}`,
        },
      };
    }
  } catch (err) {
    console.error('Error generating metadata for subject:', err);
  }

  return {
    title: 'Subject Not Found | SyntaxFlow Core Subjects',
    description: 'The requested core engineering subject could not be found.',
    robots: { index: false, follow: false },
  };
}

export default async function SubjectPage({ params }: PageProps) {
  const { subject: subjectParam } = await params;
  const subject = getSubjectBySlug(subjectParam);

  if (!subject) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-20 flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Subject Not Found</h1>
          <p className="text-sm text-muted mb-6">We couldn&apos;t find a core subject matching &quot;{subjectParam}&quot;.</p>
          <Link
            href="/core-subjects"
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            &larr; Back to Core Subjects
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  let articles: any[] = [];
  try {
    const rawArticles = await contentSource.getArticles();
    if (Array.isArray(rawArticles)) {
      articles = rawArticles.filter((a) => a && a.category?.trim().toLowerCase() !== 'sql');
    }
  } catch (err) {
    console.error('Failed to fetch articles for subject page:', err);
  }

  return <SubjectDetailClient subjectSlug={subject.slug} allArticles={articles} />;
}
