'use client';

import React, { useState, useEffect } from 'react';

interface MarkAsReadButtonProps {
  slug: string;
  title?: string;
  isSqlCategory?: boolean;
}

export const MarkAsReadButton: React.FC<MarkAsReadButtonProps> = ({
  slug,
  title,
  isSqlCategory = false,
}) => {
  const [isRead, setIsRead] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    if (!isSqlCategory) return;

    try {
      let email = '';
      const storedUser = localStorage.getItem('sql_course_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        email = parsed.email || '';
        setUserEmail(email);
      }

      const storageKey = email ? `sql_read_articles_${email}` : 'sql_read_articles';
      const readList = JSON.parse(localStorage.getItem(storageKey) || localStorage.getItem('sql_read_articles') || '[]');
      if (Array.isArray(readList) && readList.includes(slug)) {
        setIsRead(true);
      }
    } catch {
      setIsRead(false);
    }
  }, [slug, isSqlCategory]);

  if (!isSqlCategory || !isMounted) {
    return null;
  }

  const toggleReadStatus = async () => {
    try {
      const storageKey = userEmail ? `sql_read_articles_${userEmail}` : 'sql_read_articles';
      const readList = JSON.parse(localStorage.getItem(storageKey) || localStorage.getItem('sql_read_articles') || '[]');
      let updated: string[];

      if (readList.includes(slug)) {
        updated = readList.filter((s: string) => s !== slug);
        setIsRead(false);
      } else {
        updated = [...readList, slug];
        setIsRead(true);
      }

      localStorage.setItem(storageKey, JSON.stringify(updated));
      localStorage.setItem('sql_read_articles', JSON.stringify(updated));

      // Sync with Firestore if user is authenticated
      if (userEmail) {
        fetch('/api/sql-course/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, readArticles: updated }),
        }).catch((err) => console.error('Failed to sync progress:', err));
      }
    } catch (e) {
      console.error('Failed to update read status:', e);
    }
  };

  return (
    <div className="my-8 p-6 rounded-2xl border border-card-border bg-card-bg/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors ${
            isRead
              ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
              : 'bg-accent/10 text-accent border border-accent/20'
          }`}
        >
          {isRead ? '✅' : '📖'}
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground">
            {isRead ? 'Lesson Completed!' : 'Finished reading this lesson?'}
          </h4>
          <p className="text-xs text-muted">
            {isRead
              ? 'Marked as completed in your personalized SQL Course dashboard.'
              : 'Mark as read to update your progress on the dashboard.'}
          </p>
        </div>
      </div>

      <button
        onClick={toggleReadStatus}
        className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer flex-shrink-0 ${
          isRead
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600'
            : 'bg-accent text-white shadow-lg shadow-accent/25 hover:bg-accent/90 hover:scale-[1.02]'
        }`}
      >
        {isRead ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span>Completed (Click to Undo)</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Mark as Read</span>
          </>
        )}
      </button>
    </div>
  );
};

export default MarkAsReadButton;
