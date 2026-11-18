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
  topics: string[];
  match: (a: Article) => boolean;
}

export const CORE_SUBJECTS: SubjectConfig[] = [
  {
    id: 'cn',
    slug: 'computer-networks',
    aliases: ['cn', 'networking', 'computer-network'],
    code: 'CN',
    title: 'Computer Networks',
    tagline: 'Network Architecture, Topologies, Switching & Protocols',
    badge: 'Networking & Systems',
    badgeColor: 'text-indigo-600 dark:text-indigo-400 border-indigo-500/20 bg-indigo-500/10',
    description:
      'In-depth study guides covering physical topologies (Bus, Ring, Star, Mesh, Tree, Hybrid), circuit switching, multiplexing (FDM/TDM), geographic scopes (PAN, LAN, MAN, WAN), packet switching, virtual circuits, switch fabrics, and queuing delay analysis.',
    topics: [
      'Physical Topologies: Bus, Ring, Star, Mesh & Tree',
      'Circuit Switching & Dedicated Channel Handshakes',
      'Packet Switching: Datagram vs Virtual Circuit',
      'Switch Architecture: Crossbar, Banyan & Batcher-Banyan',
      'FDM vs TDM Multiplexing Schemes',
      'Geographic Scopes: PAN, LAN, MAN & WAN',
      'Head-of-Line (HOL) Blocking & Queuing Analysis',
    ],
    match: (a: Article) => {
      const cat = a.category?.trim().toLowerCase() || '';
      return (
        cat === 'computer networks' ||
        cat.includes('network') ||
        Boolean(
          a.tags?.some((t) => {
            const tl = t.toLowerCase();
            return (
              tl.includes('network') ||
              tl.includes('packet switching') ||
              tl.includes('circuit switching') ||
              tl.includes('topology')
            );
          })
        )
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
    topics: [
      'ASH Receiver Architecture',
      'Superheterodyne vs Direct Conversion',
      'RF Frequency Synthesizers & PLL',
      'Transmitter Power & Modulation Schemes',
      'Semester Exam Solved Breakdowns',
    ],
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
    topics: [
      'Deterministic Finite Automata (DFA)',
      'NFA with Epsilon Transitions',
      'Regular Expressions & Pumping Lemma',
      'Context-Free Grammars & Pushdown Automata',
      'Turing Machines & Decidability',
    ],
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
