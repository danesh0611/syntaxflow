import { Metadata } from 'next';
import SqlCourseClient from '@/components/sql-course/SqlCourseClient';

export const metadata: Metadata = {
  title: 'SQL Interview Mastery Course (Self-Paced) | SyntaxFlow',
  description:
    'Crack any SQL tech interview with clearcut, article-first deep dives. Learn Window Functions, CTEs, Joins, and Query Optimization through illustrated breakdowns.',
  keywords: [
    'sql course',
    'sql interview preparation',
    'sql queries for interviews',
    'window functions sql',
    'sql self paced course',
    'sql interview questions faang',
    'database query optimization',
  ],
  openGraph: {
    title: 'SQL Interview Mastery Course (Self-Paced) | SyntaxFlow',
    description:
      'Crack any SQL tech interview with clearcut, article-first deep dives. Register now for free updates & early access.',
    url: 'https://syntaxflowarticles.pages.dev/sql-course',
    siteName: 'SyntaxFlow',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SQL Interview Mastery Course | SyntaxFlow',
    description:
      'Crack any SQL tech interview with clearcut, article-first deep dives. Register now for free early access.',
  },
};

export default function SqlCoursePage() {
  return <SqlCourseClient />;
}
