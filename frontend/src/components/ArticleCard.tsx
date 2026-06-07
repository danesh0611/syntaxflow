import React from 'react';
import { Article } from '@/lib/types';
import Link from 'next/link';

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const formattedDate = new Date(article.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="group relative flex flex-col h-full bg-card-bg border border-card-border rounded-2xl overflow-hidden hover:border-accent/45 hover:shadow-xl hover:shadow-accent-glow/5 transition-all duration-300">
      {article.coverImage ? (
        <div className="relative aspect-video w-full overflow-hidden bg-card-bg border-b border-card-border/50">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-indigo-950 to-slate-900 border-b border-card-border/50 flex items-center justify-center p-6">
          <span className="text-sm font-black text-indigo-400/70 tracking-widest uppercase">SyntaxFlow</span>
        </div>
      )}
      
      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-xs font-bold text-accent tracking-wider uppercase bg-accent/10 border border-accent/25 px-2.5 py-1 rounded-md">
            {article.category}
          </span>
        </div>
        
        <h2 className="text-lg font-bold mb-3 line-clamp-2 leading-snug">
          <Link href={`/articles/${article.slug}`} className="text-foreground hover:text-accent transition-colors duration-200">
            {article.title}
          </Link>
        </h2>
        
        <p className="text-muted text-sm mb-5 line-clamp-3 leading-relaxed">
          {article.excerpt}
        </p>
        
        <div className="mt-auto pt-4 border-t border-card-border/60">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.tags.filter(tag => tag.trim()).slice(0, 2).map((tag) => (
              <span key={tag} className="text-[11px] font-medium text-foreground bg-card-border/50 border border-card-border px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-[10px] font-black text-accent">
                {article.author.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-foreground/80">{article.author}</span>
            </div>
            <span className="text-xs text-muted">{formattedDate}</span>
          </div>
        </div>
      </div>
    </article>
  );
};
