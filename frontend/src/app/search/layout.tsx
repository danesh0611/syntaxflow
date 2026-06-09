import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Articles | SyntaxFlow',
  description:
    'Search through all SyntaxFlow articles. Find DSA solutions, Python tutorials, system architecture guides, and developer insights.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/search',
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
