import { Article } from '@/lib/types';

export interface SubjectUnit {
  id: string;
  number: number;
  name: string;
  title: string;
  description: string;
}

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
  units?: SubjectUnit[];
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
    units: [
      {
        id: 'unit-1',
        number: 1,
        name: 'Unit 1',
        title: 'Network Overview, Topologies, Switching & Physical Layer',
        description:
          'Network architecture, OSI & TCP/IP reference models, physical topology types, circuit & packet switching, transmission media, bandwidth and latency delay analysis.',
      },
      {
        id: 'unit-2',
        number: 2,
        name: 'Unit 2',
        title: 'Data Link Layer & Medium Access Control (MAC)',
        description:
          'Framing, error detection & correction (CRC, Hamming codes), flow control protocols, sliding window, HDLC, Ethernet standards & CSMA/CD.',
      },
      {
        id: 'unit-3',
        number: 3,
        name: 'Unit 3',
        title: 'Network Layer, IP Addressing & Routing Protocols',
        description:
          'IPv4 & IPv6 addressing, CIDR, subnetting, ARP, DHCP, distance vector & link-state routing algorithms (RIP, OSPF, BGP).',
      },
      {
        id: 'unit-4',
        number: 4,
        name: 'Unit 4',
        title: 'Transport Layer, TCP/UDP & Congestion Control',
        description:
          'Process-to-process delivery, socket programming, UDP, TCP 3-way handshake, reliable data transfer, flow control & AIMD congestion avoidance.',
      },
      {
        id: 'unit-5',
        number: 5,
        name: 'Unit 5',
        title: 'Application Layer Protocols & Network Security',
        description:
          'DNS, HTTP/HTTPS, FTP, SMTP, email architecture, cryptography fundamentals, symmetric/asymmetric encryption, firewalls & TLS/SSL.',
      },
    ],
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
      if (cat === 'short range wireless communication' || cat.includes('wireless') || cat === 'srwc') return true;
      return Boolean(
        a.tags?.some((t) => {
          const tl = t.toLowerCase();
          return tl === 'srwc' || tl.includes('short range wireless') || tl.includes('wireless');
        })
      );
    },
    units: [
      {
        id: 'unit-1',
        number: 1,
        name: 'Unit 1',
        title: 'Wireless Systems, WLAN, Bluetooth, Zigbee & UWB',
        description:
          'Introduction to wireless systems, short-range radio characteristics, transmitter/receiver elements, WLAN & Wi-Fi architecture, Bluetooth modes, Zigbee frame structures, and Ultra-Wideband (UWB) technology.',
      },
      {
        id: 'unit-2',
        number: 2,
        name: 'Unit 2',
        title: 'Antennas, Propagation, Baseband Coding & Spread Spectrum',
        description:
          'Dipole, loop, helical & patch antennas, gain, directivity, impedance matching, radio link diagrams, code hopping, digital modulation, DSSS/FHSS spread spectrum, and RFID transceivers.',
      },
      {
        id: 'unit-3',
        number: 3,
        name: 'Unit 3',
        title: 'RF Transceivers, Receivers & Amplifiers',
        description:
          'RF sources, frequency control, SAW filters, TRF, ASH receivers, super-regenerative, superheterodyne, direct conversion receivers, and software-defined radio (SDR).',
      },
      {
        id: 'unit-4',
        number: 4,
        name: 'Unit 4',
        title: 'Wireless Standards, WPAN Regulations & 60 GHz Millimeter Wave',
        description:
          'FCC regulations, emission nomenclature, WPAN concepts, European Consortium IST-MAGNET project, IEEE 802.15.3c, 60 GHz propagation characterization, and multipath modeling.',
      },
      {
        id: 'unit-5',
        number: 5,
        name: 'Unit 5',
        title: 'Optical Wireless Technologies, UROOF & Visible Light Communication',
        description:
          'Ultra-wideband Radio-over-Optical-Fiber (UROOF), RF-to-optical conversion, integrated UROOF transceivers (IUT), clipping distortion, MB-OFDM over fiber, and Visible Light Communication (VLC) links.',
      },
    ],
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
    units: [
      {
        id: 'unit-1',
        number: 1,
        name: 'Unit 1',
        title: 'Finite Automata, Regular Languages & Regular Expressions',
        description:
          'DFA, NFA, ε-NFA conversion, DFA minimization, regular expressions, Arden’s theorem, equivalence, and Pumping Lemma for regular languages.',
      },
      {
        id: 'unit-2',
        number: 2,
        name: 'Unit 2',
        title: 'Formal Grammars, Chomsky Hierarchy & Context-Free Languages',
        description:
          'Grammar 4-tuple G = (V, T, P, S), Chomsky classification (Type 0–3), derivations, parse trees, ambiguity in CFGs, simplification, and normal forms (CNF, GNF).',
      },
      {
        id: 'unit-3',
        number: 3,
        name: 'Unit 3',
        title: 'Pushdown Automata (PDA) & Context-Free Grammars',
        description:
          'Non-deterministic PDA, acceptance by final state and empty stack, equivalence of PDA and CFG, and deterministic pushdown automata (DPDA).',
      },
      {
        id: 'unit-4',
        number: 4,
        name: 'Unit 4',
        title: 'Turing Machines (TM) & Computability Theory',
        description:
          'Standard Turing machine model, transition functions, instantaneous descriptions, multi-tape & non-deterministic TMs, Church-Turing thesis, and halting problem.',
      },
      {
        id: 'unit-5',
        number: 5,
        name: 'Unit 5',
        title: 'Decidability, Undecidability & Complexity Classes',
        description:
          'Decidable and undecidable problems, Post Correspondence Problem (PCP), Rice’s theorem, and time/space complexity classes (P, NP, NP-Complete).',
      },
    ],
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

export function getArticleUnitNumber(article: Article, subjectId?: string): number {
  const tags = article.tags || [];
  // Check tags for explicit unit e.g. "Unit 1", "Unit 2", "unit-1"
  for (const t of tags) {
    const match = t.match(/unit\s*([1-5])/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num >= 1 && num <= 5) return num;
    }
  }
  return 1;
}
