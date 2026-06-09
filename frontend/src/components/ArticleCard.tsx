import React from 'react';
import { Article } from '@/lib/types';
import Link from 'next/link';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  index?: number;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, index = 0 }) => {
  const formattedDate = new Date(article.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <article
      className="card-glow group relative flex flex-col h-full bg-card-bg border border-card-border rounded-[1.125rem] overflow-hidden animate-fade-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Cover Image */}
      {article.coverImage ? (
        <div className="relative aspect-video w-full overflow-hidden bg-card-bg">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out"
          />
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      ) : (
        <div className="relative aspect-video w-full overflow-hidden flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0d1035 0%, #1a0a2e 50%, #0d1035 100%)' }}
        >
          {/* Ambient blobs in placeholder */}
          <div className="absolute w-24 h-24 rounded-full opacity-20 blur-2xl"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent)', top: '20%', left: '20%' }} />
          <div className="absolute w-20 h-20 rounded-full opacity-15 blur-2xl"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', bottom: '20%', right: '20%' }} />
          <span className="relative text-xs font-black tracking-[0.3em] uppercase text-indigo-400/50">
            SyntaxFlow
          </span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        {/* Category */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-bold text-accent tracking-wider uppercase bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-lg">
            {article.category}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-base font-bold mb-3 line-clamp-2 leading-snug tracking-tight">
          <Link
            href={`/articles/${article.slug}`}
            className="text-foreground hover:text-accent transition-colors duration-300"
          >
            {article.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className="text-muted text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
          {article.excerpt}
        </p>

        {/* Tags */}
        {article.tags.filter(t => t.trim()).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.tags.filter(t => t.trim()).slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium text-muted bg-card-border/60 border border-card-border px-2 py-0.5 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta footer */}
        <div className="pt-3.5 border-t border-card-border/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent/30 to-accent-2/30 border border-accent/25 flex items-center justify-center text-[10px] font-black text-accent flex-shrink-0">
              {article.author.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-foreground/80 truncate max-w-[100px]">
              {article.author}
            </span>
          </div>
          <span className="text-[11px] text-muted flex-shrink-0">{formattedDate}</span>
        </div>
      </div>
    </article>
  );
};
