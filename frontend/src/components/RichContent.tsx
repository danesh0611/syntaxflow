import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import hljs from 'highlight.js';
import { urlForImage } from '@/lib/sanity';
import type { ArticleContent } from '@/lib/types';
import katex from 'katex';

interface LatexRendererProps {
  formula: string;
  displayMode?: boolean;
}

export const LatexRenderer = ({ formula, displayMode = false }: LatexRendererProps) => {
  try {
    const html = katex.renderToString(formula, {
      displayMode,
      throwOnError: false,
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch (err) {
    console.error('KaTeX rendering error:', err);
    return <span>{formula}</span>;
  }
};

export const renderLatexText = (text: string): React.ReactNode => {
  if (!text) return '';
  const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g);
  return parts.map((part, i) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      const formula = part.slice(2, -2).trim();
      return <LatexRenderer key={i} formula={formula} displayMode={true} />;
    } else if (part.startsWith('$') && part.endsWith('$')) {
      const formula = part.slice(1, -1).trim();
      return <LatexRenderer key={i} formula={formula} displayMode={false} />;
    }
    return part;
  });
};

export const processLatexInNodes = (node: React.ReactNode): React.ReactNode => {
  if (typeof node === 'string') {
    return renderLatexText(node);
  }
  
  if (Array.isArray(node)) {
    return node.map((child, i) => <React.Fragment key={i}>{processLatexInNodes(child)}</React.Fragment>);
  }

  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<any>;
    if (element.props && element.props.children) {
      return React.cloneElement(element, {
        children: processLatexInNodes(element.props.children),
      });
    }
  }

  return node;
};

const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;

  // YouTube checks
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // Vimeo checks
  const vimeoMatch = url.match(
    /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i
  );
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
};

export const VideoEmbed = ({ url, caption }: { url: string; caption?: string }) => {
  const embedUrl = getEmbedUrl(url);

  return (
    <div className="my-6 w-full">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md bg-black">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={caption || 'Video embed'}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <video
            src={url}
            controls
            className="absolute inset-0 w-full h-full object-cover"
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      {caption && (
        <p className="mt-2 text-center text-sm text-gray-500 italic">
          {caption}
        </p>
      )}
    </div>
  );
};

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
    'iframe',
    'video',
    'source',
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
    iframe: [
      ...(defaultSchema.attributes?.iframe || []),
      ['src'],
      ['title'],
      ['width'],
      ['height'],
      ['allow'],
      ['allowfullscreen', 'allowFullScreen'],
      ['className'],
    ],
    video: [
      ...(defaultSchema.attributes?.video || []),
      ['src'],
      ['controls'],
      ['width'],
      ['height'],
      ['preload'],
      ['poster'],
      ['loop'],
      ['muted'],
      ['autoplay', 'autoPlay'],
      ['playsinline', 'playsInline'],
      ['className'],
    ],
    source: [
      ...(defaultSchema.attributes?.source || []),
      ['src'],
      ['type'],
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
    video: ({ value }: { value: { url?: string; caption?: string } }) => {
      const url = value?.url || '';
      const caption = value?.caption || '';

      if (!url) {
        return null;
      }

      return <VideoEmbed url={url} caption={caption} />;
    },
    codeBlock: ({ value }: { value: { code?: string; language?: string } }) => {
      const code = value?.code || '';
      const language = value?.language || 'plaintext';

      if (language === 'latex' || language === 'math') {
        return (
          <div className="my-6 p-6 bg-card-bg border border-card-border rounded-2xl flex justify-center items-center overflow-x-auto shadow-md">
            <LatexRenderer formula={code} displayMode={true} />
          </div>
        );
      }

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
  block: {
    normal: ({ children }) => <p>{processLatexInNodes(children)}</p>,
    h1: ({ children }) => <h1>{processLatexInNodes(children)}</h1>,
    h2: ({ children }) => <h2>{processLatexInNodes(children)}</h2>,
    h3: ({ children }) => <h3>{processLatexInNodes(children)}</h3>,
    h4: ({ children }) => <h4>{processLatexInNodes(children)}</h4>,
    h5: ({ children }) => <h5>{processLatexInNodes(children)}</h5>,
    h6: ({ children }) => <h6>{processLatexInNodes(children)}</h6>,
    blockquote: ({ children }) => <blockquote>{processLatexInNodes(children)}</blockquote>,
  },
  listItem: ({ children }) => <li>{processLatexInNodes(children)}</li>,
};

export const RichContent = ({ value }: { value: ArticleContent }) => {
  if (typeof value === 'string') {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeRaw], [rehypeSanitize, contentSchema]]}
        components={{
          p: ({ children }) => <p>{processLatexInNodes(children)}</p>,
          h1: ({ children }) => <h1>{processLatexInNodes(children)}</h1>,
          h2: ({ children }) => <h2>{processLatexInNodes(children)}</h2>,
          h3: ({ children }) => <h3>{processLatexInNodes(children)}</h3>,
          h4: ({ children }) => <h4>{processLatexInNodes(children)}</h4>,
          h5: ({ children }) => <h5>{processLatexInNodes(children)}</h5>,
          h6: ({ children }) => <h6>{processLatexInNodes(children)}</h6>,
          blockquote: ({ children }) => <blockquote>{processLatexInNodes(children)}</blockquote>,
          li: ({ children }) => <li>{processLatexInNodes(children)}</li>,
          iframe: ({ node, ...props }) => {
            return (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md bg-black my-6">
                <iframe
                  {...props}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            );
          },
          video: ({ node, ...props }) => {
            return (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md bg-black my-6">
                <video
                  {...props}
                  controls
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            );
          },
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            if (lang === 'latex' || lang === 'math') {
              return (
                <div className="my-6 p-6 bg-card-bg border border-card-border rounded-2xl flex justify-center items-center overflow-x-auto shadow-md">
                  <LatexRenderer formula={String(children).replace(/\n$/, '')} displayMode={true} />
                </div>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {value}
      </ReactMarkdown>
    );
  }

  return <PortableText value={value as PortableTextValue} components={portableTextComponents} />;
};