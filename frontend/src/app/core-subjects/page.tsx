import { Metadata } from 'next';
import { contentSource } from '@/lib/cms';
import CoreSubjectsClient from '@/components/core-subjects/CoreSubjectsClient';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Core Engineering Subjects & Semester Guides | SyntaxFlow',
  description:
    'Comprehensive semester and interview study guides for Core Engineering subjects including Short Range Wireless (SRW) and Formal Languages & Automata Theory (FLA).',
  keywords: [
    'core engineering subjects',
    'short range wireless communication',
    'srw lecture notes',
    'formal language and automata theory',
    'fla dfa nfa',
    'theory of computation',
    'wireless engineering',
    'systems architecture',
    'syntaxflow core subjects',
  ],
  openGraph: {
    title: 'Core Engineering Subjects | SyntaxFlow',
    description:
      'Master core engineering subjects like Short Range Wireless (SRW) and Formal Languages & Automata (FLA) with visual architecture breakdowns, state machines, and solved practice problems.',
    url: 'https://syntaxflowarticles.pages.dev/core-subjects',
    siteName: 'SyntaxFlow',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Core Engineering Subjects | SyntaxFlow',
    description:
      'Master core engineering subjects like Short Range Wireless (SRW) and Formal Languages & Automata (FLA) with visual architecture breakdowns and state machines.',
  },
};

export default async function CoreSubjectsPage() {
  const articles = await contentSource.getArticles();

  const publicArticles = Array.isArray(articles)
    ? articles.filter((a) => a && a.category?.trim().toLowerCase() !== 'sql')
    : [];

  return <CoreSubjectsClient initialArticles={publicArticles} />;
}
