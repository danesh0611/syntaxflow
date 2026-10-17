import { Metadata } from 'next';
import DsaSheetClient from '@/components/dsa-sheet/DsaSheetClient';

export const metadata: Metadata = {
  title: 'DSA Sheet & Interview Progress Tracker | SyntaxFlow',
  description:
    'Track your coding interview preparation with the curated 100 FAANG DSA Sheet. Sync with your LeetCode profile, check off solved problems, and read in-depth tutorials with code & dry-runs.',
  keywords: [
    'dsa sheet',
    'leetcode tracker',
    'faang interview questions',
    'coding interview sheet',
    'leetcode profile sync',
    'dsa progress tracker',
    'data structures and algorithms',
    'top interview 150',
    'blind 75',
    'syntaxflow dsa',
  ],
  openGraph: {
    title: 'DSA Sheet & Interview Progress Tracker | SyntaxFlow',
    description:
      'Track your coding interview preparation with the curated 100 FAANG DSA Sheet. Sync with your LeetCode profile, check off solved problems, and read in-depth tutorials.',
    url: 'https://syntaxflowarticles.pages.dev/dsa-sheet',
    siteName: 'SyntaxFlow',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DSA Sheet & Interview Progress Tracker | SyntaxFlow',
    description:
      'Track your coding interview preparation with the curated 100 FAANG DSA Sheet. Sync with your LeetCode profile, check off solved problems, and read in-depth tutorials.',
  },
};

export default function DsaSheetPage() {
  return <DsaSheetClient />;
}
