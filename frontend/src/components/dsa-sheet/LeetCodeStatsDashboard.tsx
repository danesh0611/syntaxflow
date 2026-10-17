'use client';

import React from 'react';
import { DSA_PROBLEMS } from '@/lib/dsaSheetData';

export interface LeetCodeProfileData {
  username: string;
  profile: {
    realName: string;
    userAvatar: string;
    ranking: number;
    reputation: number;
    countryName?: string | null;
    school?: string | null;
  };
  catalogCounts?: Array<{ difficulty: string; count: number }>;
  submitStats: Array<{ difficulty: string; count: number; submissions?: number }>;
  acceptanceRate?: string | null;
  badges?: Array<{ id: string; displayName: string; icon: string }>;
  activity?: {
    solvesLast7Days: number;
    solvesLast30Days: number;
    recentSubmissionsCount: number;
    mostRecentTimestamp: string | null;
  };
  recentSubmissions: Array<{
    id: string;
    title: string;
    titleSlug: string;
    timestamp: string;
  }>;
}

interface LeetCodeStatsDashboardProps {
  data: LeetCodeProfileData;
  solvedIds: string[];
  onTickProblem: (problemId: string) => void;
  onRefresh: () => void;
  onDisconnect: () => void;
  isRefreshing?: boolean;
}

function timeAgo(unixTimestampStr: string): string {
  const timestamp = parseInt(unixTimestampStr, 10);
  if (!timestamp || isNaN(timestamp)) return 'Recently';

  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export const LeetCodeStatsDashboard: React.FC<LeetCodeStatsDashboardProps> = ({
  data,
  solvedIds,
  onTickProblem,
  onRefresh,
  onDisconnect,
  isRefreshing = false,
}) => {
  // Stat counts
  const allSolved = data.submitStats?.find((s) => s.difficulty === 'All')?.count || 0;
  const easySolved = data.submitStats?.find((s) => s.difficulty === 'Easy')?.count || 0;
  const medSolved = data.submitStats?.find((s) => s.difficulty === 'Medium')?.count || 0;
  const hardSolved = data.submitStats?.find((s) => s.difficulty === 'Hard')?.count || 0;

  // Catalog totals from LeetCode
  const easyCatalog = data.catalogCounts?.find((c) => c.difficulty === 'Easy')?.count || 850;
  const medCatalog = data.catalogCounts?.find((c) => c.difficulty === 'Medium')?.count || 1780;
  const hardCatalog = data.catalogCounts?.find((c) => c.difficulty === 'Hard')?.count || 770;
  const allCatalog = easyCatalog + medCatalog + hardCatalog;

  // Activity calculation
  const solves7d = data.activity?.solvesLast7Days || 0;
  const solves30d = data.activity?.solvesLast30Days || 0;

  // Consistency & Monthly Recommendation Calculations
  const RECOMMENDED_MONTHLY_TARGET = 30; // 1 problem/day
  const monthlyGoalPercent = Math.min(100, Math.round((solves30d / RECOMMENDED_MONTHLY_TARGET) * 100));

  let consistencyScore = '3.0';
  let consistencyStars = '⭐⭐⭐';
  let consistencyTier = 'Tier B — Casual Practice';
  let consistencyBadgeColor = 'text-amber-500 bg-amber-500/10 border-amber-500/30';
  let monthlyAdvice = '';
  let timelineEstimate = '';

  if (solves30d >= 35) {
    consistencyScore = '5.0';
    consistencyStars = '⭐⭐⭐⭐⭐';
    consistencyTier = 'Tier S+ — Elite Interview Velocity';
    consistencyBadgeColor = 'text-rose-500 bg-rose-500/10 border-rose-500/30';
    monthlyAdvice =
      'Outstanding momentum! You are solving over 1 problem every single day. Keep this up for 2 months and you will comfortably breeze through Amazon, Google, and Tier-1 startup coding rounds.';
    timelineEstimate = 'Ready in 2 — 3 months';
  } else if (solves30d >= 22) {
    consistencyScore = '4.6';
    consistencyStars = '⭐⭐⭐⭐½';
    consistencyTier = 'Tier A — Placement Ready Consistency';
    consistencyBadgeColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    monthlyAdvice =
      'Great consistency! You are well within the sweet spot for campus placement and off-campus drives (~5-6 problems per week). Maintain this rhythm to solidify your pattern recognition.';
    timelineEstimate = 'Ready in 3 — 4 months';
  } else if (solves30d >= 10) {
    consistencyScore = '3.5';
    consistencyStars = '⭐⭐⭐½';
    consistencyTier = 'Tier B — Active Learner';
    consistencyBadgeColor = 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    monthlyAdvice =
      'Good active start! To reach peak interview readiness, push towards 1 problem per day (~30 problems/month). Spending 45-60 minutes daily will double your progress.';
    timelineEstimate = 'Ready in 4 — 6 months';
  } else if (solves30d >= 3) {
    consistencyScore = '2.5';
    consistencyStars = '⭐⭐½';
    consistencyTier = 'Tier C — Needs Regular Momentum';
    consistencyBadgeColor = 'text-amber-600 bg-amber-600/10 border-amber-600/30';
    monthlyAdvice =
      'Occasional practice. To build intuitive problem-solving muscle memory, consistency is key. Aim for 25 to 30 problems per month (1 question daily or 7 per weekend).';
    timelineEstimate = 'Needs more daily consistency';
  } else {
    consistencyScore = '1.5';
    consistencyStars = '⭐½';
    consistencyTier = 'Tier D — Low Consistency';
    consistencyBadgeColor = 'text-muted bg-card-border/50 border-card-border';
    monthlyAdvice =
      'Low activity recorded this month. Coding interviews require active habit formation. Start by dedicating 45 minutes daily to solve at least 20-30 questions a month.';
    timelineEstimate = 'Start your daily streak';
  }

  return (
    <div className="rounded-3xl border border-card-border/80 bg-gradient-to-br from-card-bg via-card-bg to-[#FFA116]/5 p-6 sm:p-8 shadow-xl shadow-[#FFA116]/5 space-y-7 animate-fade-in relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-[#FFA116]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: User Profile Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-card-border/60 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            {data.profile.userAvatar ? (
              <img
                src={data.profile.userAvatar}
                alt={data.username}
                className="w-16 h-16 rounded-2xl border-2 border-[#FFA116]/40 object-cover shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFA116] to-amber-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {data.username.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-card-bg flex items-center justify-center text-[10px] text-white">
              ✓
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {data.profile.realName || data.username}
              </h2>
              <a
                href={`https://leetcode.com/u/${data.username}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono font-bold text-[#FFA116] hover:underline flex items-center gap-1"
              >
                <span>@{data.username}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              {data.profile.ranking > 0 && (
                <span className="font-semibold bg-card-border/50 px-2 py-0.5 rounded-md">
                  Rank #{data.profile.ranking.toLocaleString()}
                </span>
              )}
              {data.profile.reputation > 0 && (
                <span className="font-semibold bg-card-border/50 px-2 py-0.5 rounded-md">
                  ⭐ {data.profile.reputation} Rep
                </span>
              )}
              {data.profile.countryName && <span>📍 {data.profile.countryName}</span>}
              {data.profile.school && <span>🎓 {data.profile.school}</span>}
            </div>
          </div>
        </div>

        {/* Dashboard Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-card-bg border border-card-border hover:border-[#FFA116] text-foreground hover:text-[#FFA116] transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
            title="Fetch latest submission activity from LeetCode"
          >
            <span>{isRefreshing ? '⏳' : '🔄'}</span>
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Activity'}</span>
          </button>
          <button
            onClick={onDisconnect}
            className="px-3 py-2 text-xs font-semibold rounded-xl text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Consistency Rating & Monthly Recommendation Engine */}
      <div className="rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/5 via-card-bg to-card-bg p-5 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-card-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-accent">Consistency Rating</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${consistencyBadgeColor}`}>
                {consistencyTier}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-foreground">{consistencyScore}</span>
              <span className="text-xs text-muted font-bold">/ 5.0</span>
              <span className="text-sm ml-1">{consistencyStars}</span>
            </div>
          </div>

          {/* Monthly Target Meter */}
          <div className="md:w-80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Monthly Problem Target</span>
              <span className="font-extrabold text-accent">
                {solves30d} / {RECOMMENDED_MONTHLY_TARGET} Solved
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-card-border/60 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent-2 rounded-full transition-all duration-500"
                style={{ width: `${monthlyGoalPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-muted">
              <span>Goal: 1 problem/day</span>
              <span className="font-semibold">{monthlyGoalPercent}% Achieved</span>
            </div>
          </div>
        </div>

        {/* Personalized Practice Timeline & Advice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Time Commitment Card */}
          <div className="p-3.5 rounded-xl bg-card-bg border border-card-border space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <span>⏱️</span> Recommended Time
            </div>
            <div className="text-sm font-extrabold text-foreground">45 — 60 mins / day</div>
            <p className="text-[11px] text-muted leading-relaxed">
              Target ~25 to 30 hours per month. Focus 20 mins on intuition, 20 mins on code & dry-run.
            </p>
          </div>

          {/* Monthly Target Breakdown */}
          <div className="p-3.5 rounded-xl bg-card-bg border border-card-border space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <span>🎯</span> How Much to Solve / Month
            </div>
            <div className="text-sm font-extrabold text-foreground">30 Problems / Month</div>
            <p className="text-[11px] text-muted leading-relaxed">
              Ideal split: <strong>10 Easy</strong> (speed warmup) + <strong>17 Medium</strong> (core rounds) +{' '}
              <strong>3 Hard</strong>.
            </p>
          </div>

          {/* Readiness Timeline */}
          <div className="p-3.5 rounded-xl bg-card-bg border border-card-border space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <span>🚀</span> Placement Readiness
            </div>
            <div className="text-sm font-extrabold text-accent">{timelineEstimate}</div>
            <p className="text-[11px] text-muted leading-relaxed">
              At 30 problems/month, you will master the 100 FAANG curated sheet in ~3.3 months.
            </p>
          </div>
        </div>

        {/* Personalized Coach Note */}
        <div className="p-3 rounded-xl bg-card-border/30 border border-card-border/50 text-xs text-muted flex items-start gap-2.5">
          <span className="text-base">💡</span>
          <p className="leading-relaxed">
            <strong className="text-foreground">Coach&apos;s Advice:</strong> {monthlyAdvice}
          </p>
        </div>
      </div>

      {/* Highlights: Total Solved, Velocity, Acceptance Rate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Solved */}
        <div className="p-4 rounded-2xl bg-card-bg/70 border border-card-border space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-muted">LeetCode Solved</div>
          <div className="text-2xl sm:text-3xl font-black text-foreground flex items-baseline gap-2">
            <span>{allSolved}</span>
            <span className="text-xs font-semibold text-muted font-normal">/ {allCatalog}</span>
          </div>
          <div className="text-[11px] text-muted">
            {((allSolved / (allCatalog || 1)) * 100).toFixed(1)}% of total LeetCode library
          </div>
        </div>

        {/* Velocity */}
        <div className="p-4 rounded-2xl bg-card-bg/70 border border-card-border space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-muted">Weekly Velocity</div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            {solves7d} <span className="text-xs text-muted font-normal">in 7 days</span>
          </div>
          <div className="text-[11px] text-muted">
            {solves7d >= 7 ? '🔥 1+ problems/day velocity' : `${7 - solves7d} more to hit 1/day goal`}
          </div>
        </div>

        {/* Acceptance Rate */}
        <div className="p-4 rounded-2xl bg-card-bg/70 border border-card-border space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-muted">Acceptance Rate</div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            {data.acceptanceRate ? `${data.acceptanceRate}%` : 'High'}
          </div>
          <div className="text-[11px] text-muted">Clean first-attempt solution accuracy</div>
        </div>

        {/* Most Recent Solve */}
        <div className="p-4 rounded-2xl bg-card-bg/70 border border-card-border space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-muted">Last Solved</div>
          <div className="text-base sm:text-lg font-black text-foreground truncate">
            {data.recentSubmissions[0]?.title || 'No recent solves'}
          </div>
          <div className="text-[11px] text-muted">
            {data.activity?.mostRecentTimestamp ? timeAgo(data.activity.mostRecentTimestamp) : 'Check profile'}
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Easy */}
        <div className="p-4 rounded-2xl bg-card-bg/70 border border-card-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Easy</span>
            <span className="font-extrabold text-foreground">
              {easySolved} <span className="text-muted font-normal">/ {easyCatalog}</span>
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-card-border/60 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (easySolved / (easyCatalog || 1)) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-muted flex justify-between">
            <span>Accuracy target</span>
            <span>{((easySolved / (easyCatalog || 1)) * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Medium */}
        <div className="p-4 rounded-2xl bg-card-bg/70 border border-card-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-600 dark:text-amber-400">Medium</span>
            <span className="font-extrabold text-foreground">
              {medSolved} <span className="text-muted font-normal">/ {medCatalog}</span>
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-card-border/60 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (medSolved / (medCatalog || 1)) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-muted flex justify-between">
            <span>Interview core</span>
            <span>{((medSolved / (medCatalog || 1)) * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Hard */}
        <div className="p-4 rounded-2xl bg-card-bg/70 border border-card-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-600 dark:text-rose-400">Hard</span>
            <span className="font-extrabold text-foreground">
              {hardSolved} <span className="text-muted font-normal">/ {hardCatalog}</span>
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-card-border/60 overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (hardSolved / (hardCatalog || 1)) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-muted flex justify-between">
            <span>FAANG distinction</span>
            <span>{((hardSolved / (hardCatalog || 1)) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Badges showcase if user has any */}
      {data.badges && data.badges.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <span>🏅</span>
            <span>Earned LeetCode Badges ({data.badges.length})</span>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {data.badges.map((b) => (
              <div
                key={b.id || b.displayName}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card-bg border border-card-border shadow-sm flex-shrink-0"
              >
                {b.icon?.startsWith('http') ? (
                  <img src={b.icon} alt={b.displayName} className="w-6 h-6 object-contain" />
                ) : (
                  <span className="text-lg">🎖️</span>
                )}
                <span className="text-xs font-bold text-foreground">{b.displayName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What are they practicing? (Recent Submissions Feed) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-foreground">What Are You Practicing?</span>
            <span className="text-[11px] font-semibold text-muted bg-card-border/50 px-2 py-0.5 rounded-md">
              Recent Accepted Submissions ({data.recentSubmissions.length})
            </span>
          </div>
          <span className="text-xs text-muted">Synced from LeetCode</span>
        </div>

        {data.recentSubmissions.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted border border-dashed border-card-border rounded-2xl">
            No recent submissions found. Go solve a problem on LeetCode and click &quot;Refresh Activity&quot;!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.recentSubmissions.map((sub) => {
              const matchedSheetProblem = DSA_PROBLEMS.find(
                (p) => p.leetcodeSlug.toLowerCase() === sub.titleSlug.toLowerCase()
              );
              const isTickedInSheet = matchedSheetProblem ? solvedIds.includes(matchedSheetProblem.id) : false;

              return (
                <div
                  key={sub.id || sub.titleSlug}
                  className="p-3.5 rounded-2xl bg-card-bg border border-card-border hover:border-accent/50 transition-all space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-muted font-medium">{timeAgo(sub.timestamp)}</span>
                      {matchedSheetProblem ? (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/25">
                          In Your DSA Sheet
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted/70 bg-card-border/40 px-1.5 py-0.5 rounded">
                          LeetCode Practice
                        </span>
                      )}
                    </div>

                    <a
                      href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-foreground hover:text-accent transition-colors block line-clamp-1"
                    >
                      {sub.title} ↗
                    </a>
                  </div>

                  {matchedSheetProblem && (
                    <div className="pt-1 flex items-center justify-between border-t border-card-border/50">
                      <span className="text-[10px] font-semibold text-muted">
                        Topic: {matchedSheetProblem.topicName}
                      </span>
                      {isTickedInSheet ? (
                        <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                          ✓ Ticked in Sheet
                        </span>
                      ) : (
                        <button
                          onClick={() => onTickProblem(matchedSheetProblem.id)}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-accent text-white hover:bg-accent/90 transition-all active:scale-95"
                        >
                          + Tick in Sheet
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
