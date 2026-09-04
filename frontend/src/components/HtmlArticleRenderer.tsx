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

  // Clean & prepare HTML document with isolated reset and instant postMessage bridge
  const preparedHtml = React.useMemo(() => {
    if (!html) return '';

    // Injected styles & high-speed bridge: hide duplicate navbar/footer, auto-resize, theme sync, and instant load signal
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
          overflow-x: hidden !important;
          overflow-y: hidden !important;
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

          function notifyParent() {
            try {
              var body = document.body;
              var doc = document.documentElement;
              var h = Math.ceil(Math.max(
                body ? body.scrollHeight : 0,
                doc ? doc.scrollHeight : 0,
                body ? body.offsetHeight : 0,
                doc ? doc.offsetHeight : 0
              ));
              if (h > 50) {
                window.parent.postMessage({ type: 'SYNTAXFLOW_IFRAME_RESIZE', height: h }, '*');
              }
            } catch(e) {}
          }

          window.addEventListener('message', function(event) {
            if (event.data && event.data.theme) {
              applyTheme(event.data.theme);
            }
          });

          // Send immediate ready/dimensions
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', notifyParent);
          } else {
            notifyParent();
          }

          window.addEventListener('load', notifyParent);

          // Observe DOM updates, accordions, simulator executions, etc.
          if (typeof ResizeObserver !== 'undefined') {
            var ro = new ResizeObserver(function() {
              notifyParent();
            });
            if (document.body) {
              ro.observe(document.body);
            } else {
              document.addEventListener('DOMContentLoaded', function() {
                if (document.body) ro.observe(document.body);
              });
            }
          }
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
        const docEl = doc.documentElement;
        if (body || docEl) {
          const measuredHeight = Math.ceil(
            Math.max(
              body ? body.getBoundingClientRect().height : 0,
              body ? body.scrollHeight : 0,
              body ? body.offsetHeight : 0,
              docEl ? docEl.scrollHeight : 0,
              docEl ? docEl.offsetHeight : 0
            )
          );

          if (measuredHeight > 100 && Math.abs(measuredHeight - currentHeightRef.current) > 3) {
            currentHeightRef.current = measuredHeight;
            setHeight(measuredHeight);
          }
        }
      }
    } catch {
      // Cross-origin fallback (ignore)
    }
  }, []);

  const handleLoaded = useCallback(() => {
    setIsLoaded(true);
    updateHeight();

    try {
      const isDark = document.documentElement.classList.contains('dark');
      iframeRef.current?.contentWindow?.postMessage({ theme: isDark ? 'dark' : 'light' }, '*');
    } catch {}
  }, [updateHeight]);

  useEffect(() => {
    // Listen to fast messages posted from inside iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNTAXFLOW_IFRAME_RESIZE') {
        const measuredHeight = event.data.height;
        if (typeof measuredHeight === 'number' && measuredHeight > 100) {
          if (Math.abs(measuredHeight - currentHeightRef.current) > 3) {
            currentHeightRef.current = measuredHeight;
            setHeight(measuredHeight);
          }
          setIsLoaded(true);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('resize', updateHeight);

    // Fast fallback timer: never block the user behind a long spinner
    const timer = setTimeout(() => {
      setIsLoaded(true);
      updateHeight();
    }, 120);

    const checkTimer = setTimeout(() => {
      updateHeight();
    }, 400);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('resize', updateHeight);
      clearTimeout(timer);
      clearTimeout(checkTimer);
    };
  }, [updateHeight]);

  // Check if iframe is already ready on mount / html update
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    if (
      iframe.contentDocument &&
      (iframe.contentDocument.readyState === 'complete' || iframe.contentDocument.readyState === 'interactive')
    ) {
      handleLoaded();
    }
  }, [preparedHtml, handleLoaded]);

  return (
    <div className="w-full relative my-0 rounded-xl overflow-hidden bg-transparent transition-all duration-200">
      {/* Subtle non-blocking top shimmer loader while initializing */}
      {!isLoaded && (
        <div className="w-full h-40 flex flex-col items-center justify-center bg-card-bg/40 border border-card-border/40 rounded-2xl animate-pulse my-2">
          <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium text-muted">Rendering lesson...</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        srcDoc={preparedHtml}
        title={title}
        onLoad={handleLoaded}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        className={`w-full border-0 transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0 absolute -top-[9999px] left-0 pointer-events-none'}`}
        style={{ height: `${height}px`, display: 'block', width: '100%' }}
      />
    </div>
  );
}

