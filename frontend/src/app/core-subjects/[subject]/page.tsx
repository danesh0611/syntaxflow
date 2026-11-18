import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { contentSource } from '@/lib/cms';
import { getSubjectBySlug, CORE_SUBJECTS } from '@/lib/coreSubjectsData';
import SubjectDetailClient from '@/components/core-subjects/SubjectDetailClient';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'edge';

interface PageProps {
  params: Promise<{ subject: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subject: subjectParam } = await params;
  const subject = getSubjectBySlug(subjectParam);

  if (!subject) {
    return {
      title: 'Subject Not Found | SyntaxFlow Core Subjects',
      description: 'The requested core engineering subject could not be found.',
    };
  }

  const title = `${subject.title} (${subject.code}) Notes & Architecture Guides | SyntaxFlow`;
  const description = `${subject.tagline}. Comprehensive study guides covering ${subject.topics.slice(0, 4).join(', ')}.`;

  return {
    title,
    description,
    keywords: [
      subject.title.toLowerCase(),
      subject.code.toLowerCase(),
      ...subject.topics.map((t) => t.toLowerCase()),
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

export default async function SubjectPage({ params }: PageProps) {
  const { subject: subjectParam } = await params;
  const subject = getSubjectBySlug(subjectParam);

  if (!subject) {
    notFound();
  }

  // If accessed via short alias (e.g. /core-subjects/cn or /core-subjects/srw), redirect to canonical slug
  if (subjectParam.toLowerCase() !== subject.slug.toLowerCase()) {
    redirect(`/core-subjects/${subject.slug}`);
  }

  const articles = await contentSource.getArticles();
  const publicArticles = Array.isArray(articles)
    ? articles.filter((a) => a && a.category?.trim().toLowerCase() !== 'sql')
    : [];

  return <SubjectDetailClient subject={subject} allArticles={publicArticles} />;
}
