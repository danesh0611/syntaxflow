import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import hljs from 'highlight.js';
import { urlForImage } from '@/lib/sanity';
import type { ArticleContent } from '@/lib/types';

type PortableTextValue = Exclude<ArticleContent, string>;

const contentSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'img',
    'pre',
    'code',
    'span',
    'div',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'blockquote',
    'hr',
  ],
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), ['className']],
    pre: [...(defaultSchema.attributes?.pre || []), ['className']],
    span: [...(defaultSchema.attributes?.span || []), ['className']],
    div: [...(defaultSchema.attributes?.div || []), ['className']],
    img: [
      ...(defaultSchema.attributes?.img || []),
      ['src'],
      ['alt'],
      ['title'],
      ['width'],
      ['height'],
      ['loading'],
    ],
  },
};

const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }: { value: { alt?: string; asset?: { _ref?: string } } }) => {
      const image = urlForImage(value);
      const src = image?.width(1200).url() || '';
      const alt = value?.alt || '';

      if (!src) {
        return null;
      }

      return <img src={src} alt={alt} className="w-full rounded-xl my-6" />;
    },
    codeBlock: ({ value }: { value: { code?: string; language?: string } }) => {
      const code = value?.code || '';
      const language = value?.language || 'plaintext';

      let highlighted = code;
      try {
        highlighted =
          language && language !== 'plaintext'
            ? hljs.highlight(code, { language, ignoreIllegals: true }).value
            : hljs.highlightAuto(code).value;
      } catch {
        highlighted = code;
      }

      return (
        <pre className="hljs rounded-xl p-4 overflow-x-auto my-6">
          <code
            className={`language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      );
    },
  },
  marks: {
    link: ({ children, value }) => {
      const href = (value as { href?: string })?.href || '#';
      return (
        <a href={href} target="_blank" rel="noreferrer" className="text-blue-600 underline">
          {children}
        </a>
      );
    },
  },
};

export const RichContent = ({ value }: { value: ArticleContent }) => {
  if (typeof value === 'string') {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeRaw], [rehypeSanitize, contentSchema]]}
      >
        {value}
      </ReactMarkdown>
    );
  }

  return <PortableText value={value as PortableTextValue} components={portableTextComponents} />;
};