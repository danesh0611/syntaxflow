'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface HtmlArticleRendererProps {
  html: string;
  title?: string;
}

export function HtmlArticleRenderer({ html, title = 'Article Content' }: HtmlArticleRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>(800);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const currentHeightRef = useRef<number>(800);

  // Clean & prepare HTML document with isolated reset
  const preparedHtml = React.useMemo(() => {
    if (!html) return '';

    // Injected styles & theme sync: hide duplicate navbar/footer, prevent infinite scroll expansion, and sync dark/light theme
    const seamlessOverrides = `
      <style id="syntaxflow-seamless-overrides">
        /* Hide duplicate navbar, progress-bar, and standalone footer from embedded HTML */
        .top-nav, 
        header.top-nav, 
        #progress-bar, 
        .article-footer,
        footer.article-footer,
        .stars-badge {
          display: none !important;
        }
        
        html, body {
          background-color: transparent !important;
          margin: 0 !important;
          padding: 0 !important;
          height: auto !important;
          min-height: auto !important;
          overflow: hidden !important;
        }
        
        .article-layout {
          padding-top: 0.25rem !important;
          padding-bottom: 0 !important;
          margin: 0 auto !important;
        }

        .prose-section:last-of-type,
        .quiz-section,
        .next-chapter-card {
          margin-bottom: 1.5rem !important;
        }
      </style>
      <script>
        (function() {
          function applyTheme(theme) {
            var isDark = theme === 'dark';
            if (isDark) {
              document.documentElement.classList.add('dark');
              document.documentElement.classList.remove('light');
              if (document.body) {
                document.body.classList.add('dark');
                document.body.classList.remove('light');
              }
            } else {
              document.documentElement.classList.add('light');
              document.documentElement.classList.remove('dark');
              if (document.body) {
                document.body.classList.add('light');
                document.body.classList.remove('dark');
              }
            }
          }
          window.addEventListener('message', function(event) {
            if (event.data && event.data.theme) {
              applyTheme(event.data.theme);
            }
          });
        })();
      </script>
    `;

    const trimmed = html.trim();
    if (trimmed.toLowerCase().startsWith('<!doctype') || trimmed.toLowerCase().startsWith('<html')) {
      if (html.includes('</head>')) {
        return html.replace('</head>', `${seamlessOverrides}</head>`);
      }
      return `${seamlessOverrides}${html}`;
    }

    // Wrap partial HTML snippet
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      color-scheme: dark light;
    }
    html, body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.8;
      color: #e2e8f0;
      background-color: transparent;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      word-wrap: break-word;
      height: auto !important;
      min-height: auto !important;
      overflow: hidden !important;
    }
    img { max-width: 100%; height: auto; border-radius: 8px; }
    pre { background: #0f172a; padding: 16px; border-radius: 8px; overflow-x: auto; border: 1px solid rgba(255,255,255,0.1); }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.9em; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid rgba(255,255,255,0.15); padding: 10px 14px; text-align: left; }
    th { background: rgba(255,255,255,0.05); }
    a { color: #60a5fa; text-decoration: underline; }
    blockquote { border-left: 4px solid #3b82f6; margin: 16px 0; padding-left: 16px; color: #94a3b8; }
  </style>
  ${seamlessOverrides}
</head>
<body>
  ${html}
</body>
</html>`;
  }, [html]);

  const updateHeight = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      if (iframe.contentWindow && iframe.contentDocument) {
        const doc = iframe.contentDocument;
        const body = doc.body;
        if (body) {
          // Precise content measurement without recursive growth loops
          const measuredHeight = Math.ceil(
            Math.max(
              body.getBoundingClientRect().height,
              body.scrollHeight,
              body.offsetHeight
            )
          );

          if (measuredHeight > 100 && Math.abs(measuredHeight - currentHeightRef.current) > 3) {
            currentHeightRef.current = measuredHeight;
            setHeight(measuredHeight);
          }
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setIsLoaded(true);
      // Double check dimensions after rendering
      updateHeight();
      setTimeout(updateHeight, 150);
      setTimeout(updateHeight, 600);

      try {
        const isDark = document.documentElement.classList.contains('dark');
        iframe.contentWindow?.postMessage({ theme: isDark ? 'dark' : 'light' }, '*');
      } catch {}

      try {
        const doc = iframe.contentDocument;
        if (doc) {
          doc.querySelectorAll('img, video, iframe').forEach((el) => {
            el.addEventListener('load', updateHeight);
          });
        }
      } catch {}
    };

    iframe.addEventListener('load', handleLoad);
    window.addEventListener('resize', updateHeight);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      window.removeEventListener('resize', updateHeight);
    };
  }, [preparedHtml, updateHeight]);

  return (
    <div className="w-full relative my-0 rounded-xl overflow-hidden bg-transparent">
      {!isLoaded && (
        <div className="w-full h-80 flex flex-col items-center justify-center bg-card-bg/50 border border-card-border/60 rounded-2xl animate-pulse">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-muted">Loading interactive lesson...</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        srcDoc={preparedHtml}
        title={title}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        className={`w-full border-0 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0 h-0'}`}
        style={{ height: `${height}px`, display: 'block', width: '100%' }}
      />
    </div>
  );
}
