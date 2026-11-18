import { Article } from '@/lib/types';

export interface SubjectConfig {
  id: string;
  slug: string;
  aliases: string[];
  code: string;
  title: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  description: string;
  match: (a: Article) => boolean;
}

export const CORE_SUBJECTS: SubjectConfig[] = [
  {
    id: 'cn',
    slug: 'computer-networks',
    aliases: ['cn', 'networking', 'computer-network'],
    code: 'CN',
    title: 'Computer Networks',
    tagline: 'Network Architecture, Protocols, Switching & System Topologies',
    badge: 'Networking & Systems',
    badgeColor: 'text-indigo-600 dark:text-indigo-400 border-indigo-500/20 bg-indigo-500/10',
    description:
      'Comprehensive lecture notes, visual breakdowns, and university exam guides covering the complete Computer Networks curriculum.',
    match: (a: Article) => {
      const cat = a.category?.trim().toLowerCase() || '';
      if (cat === 'computer networks' || cat.includes('network')) return true;
      return Boolean(
        a.tags?.some((t) => {
          const tl = t.toLowerCase();
          return tl === 'cn' || tl.includes('network');
        })
      );
    },
  },
  {
    id: 'srw',
    slug: 'short-range-wireless',
    aliases: ['srw', 'short-range-wireless-communication', 'wireless'],
    code: 'SRW',
    title: 'Short Range Wireless Communication',
    tagline: 'RF Transmitters, Receivers & Modern Wireless Systems',
    badge: 'Hardware & RF',
    badgeColor: 'text-amber-600 dark:text-amber-400 border-amber-500/20 bg-amber-500/10',
    description:
      'In-depth study guides covering Amplitude Shift Keying (ASK), Frequency Synthesizers, Direct Conversion, Superheterodyne, and Amplifier-Sequenced Hybrid (ASH) receiver architectures.',
    match: (a: Article) => {
      const cat = a.category?.trim().toLowerCase() || '';
      return cat === 'short range wireless communication' || cat.includes('wireless');
    },
  },
  {
    id: 'fla',
    slug: 'formal-languages-automata',
    aliases: ['fla', 'theory-of-computation', 'toc', 'automata'],
    code: 'FLA',
    title: 'Formal Languages & Automata Theory',
    tagline: 'Computation Theory, Finite Automata, Grammars & Turing Machines',
    badge: 'Theory & Systems',
    badgeColor: 'text-teal-600 dark:text-teal-400 border-teal-500/20 bg-teal-500/10',
    description:
      'Interactive and diagram-driven breakdowns of Deterministic Finite Automata (DFA), NFA to DFA conversions, Regular Expressions, Context-Free Grammars (CFG), and Chomsky Hierarchy.',
    match: (a: Article) => {
      const cat = a.category?.trim().toLowerCase() || '';
      return (
        cat === 'formal language automata' ||
        cat.includes('automata') ||
        cat.includes('formal language') ||
        Boolean(
          a.tags?.some((t) => {
            const tl = t.toLowerCase();
            return tl.includes('automata') || tl.includes('dfa') || tl.includes('nfa') || tl === 'toc';
          })
        )
      );
    },
  },
];

export function getSubjectBySlug(rawSlug: string): SubjectConfig | undefined {
  if (!rawSlug) return undefined;
  const normalized = rawSlug.trim().toLowerCase();
  return CORE_SUBJECTS.find(
    (sub) =>
      sub.slug.toLowerCase() === normalized ||
      sub.id.toLowerCase() === normalized ||
      sub.aliases.some((alias) => alias.toLowerCase() === normalized)
  );
}

export function getAllSubjectSlugs(): string[] {
  return CORE_SUBJECTS.map((s) => s.slug);
}
