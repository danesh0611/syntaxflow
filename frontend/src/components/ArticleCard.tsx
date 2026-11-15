import React from 'react';
import { Article } from '@/lib/types';
import Link from 'next/link';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  index?: number;
  variant?: 'card' | 'row';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  index = 0,
  variant = 'card',
}) => {
  const formattedDate = new Date(article.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (variant === 'row') {
    return (
      <article className="group py-3.5 px-4 rounded-xl border border-card-border/60 hover:border-card-border hover:bg-card-bg/80 transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card-bg/40">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/8 border border-accent/20 px-1.5 py-0.2 rounded">
              {article.category}
            </span>
            <span className="text-[11px] font-mono text-muted">{formattedDate}</span>
          </div>
          <h3 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors truncate">
            <Link href={`/articles/${article.slug}`}>{article.title}</Link>
          </h3>
          {article.excerpt && (
            <p className="text-xs text-muted line-clamp-1 mt-0.5">{article.excerpt}</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 sm:self-center">
          <span className="text-xs text-muted hidden md:inline-block">{article.author}</span>
          <Link
            href={`/articles/${article.slug}`}
            className="text-xs font-semibold text-accent group-hover:translate-x-0.5 transition-transform flex items-center gap-1"
          >
            <span>Read</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article
      className="group relative flex flex-col h-full bg-card-bg border border-card-border hover:border-card-border-hover rounded-xl overflow-hidden transition-all duration-200 shadow-xs hover:shadow-sm hover:-translate-y-0.5 animate-fade-up"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Cover Image */}
      {article.coverImage ? (
        <div className="relative aspect-video w-full overflow-hidden bg-neutral-900 border-b border-card-border">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
          />
        </div>
      ) : (
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-[#0e1117] to-[#151922] p-4 flex flex-col justify-between border-b border-card-border text-slate-400 font-mono select-none">
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>SYNTAXFLOW</span>
            <span className="uppercase">{article.category}</span>
          </div>
          <div className="text-xs font-sans font-bold text-slate-300 line-clamp-2">
            {article.title}
          </div>
          <div className="text-[10px] text-slate-500">
            ENTRY // 0{index + 1}
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        {/* Category & Date */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/8 border border-accent/20 px-2 py-0.5 rounded">
            {article.category}
          </span>
          <span className="text-[11px] font-mono text-muted">{formattedDate}</span>
        </div>

        {/* Title */}
        <h2 className="text-base font-bold mb-2.5 line-clamp-2 leading-snug tracking-tight">
          <Link
            href={`/articles/${article.slug}`}
            className="text-foreground hover:text-accent transition-colors duration-150"
          >
            {article.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className="text-muted text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
          {article.excerpt}
        </p>

        {/* Tags */}
        {article.tags.filter((t) => t.trim()).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.tags
              .filter((t) => t.trim())
              .slice(0, 2)
              .map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono text-muted bg-card-border/30 border border-card-border/60 px-1.5 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
          </div>
        )}

        {/* Meta footer */}
        <div className="pt-3 border-t border-card-border/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-card-border flex items-center justify-center text-[10px] font-mono font-bold text-foreground flex-shrink-0">
              {article.author.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
              {article.author}
            </span>
          </div>

          <Link
            href={`/articles/${article.slug}`}
            className="text-xs font-semibold text-accent group-hover:translate-x-0.5 transition-transform flex items-center gap-1"
          >
            <span>Read</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};
