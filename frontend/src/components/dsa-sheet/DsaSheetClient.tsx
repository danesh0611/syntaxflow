'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DSA_PROBLEMS, DSA_TOPICS, DsaProblem } from '@/lib/dsaSheetData';
import { LeetCodeStatsDashboard, LeetCodeProfileData } from '@/components/dsa-sheet/LeetCodeStatsDashboard';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

interface UserSession {
  name: string;
  email: string;
  registrationId?: string;
  status?: string;
}

export default function DsaSheetClient() {
  // Authentication State
  const [user, setUser] = useState<UserSession | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authReason, setAuthReason] = useState<string>('track your progress');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Tracking State (Manual ticking only)
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [starredIds, setStarredIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});

  // LeetCode Dashboard State
  const [leetcodeUsername, setLeetCodeUsername] = useState<string>('');
  const [leetcodeInput, setLeetCodeInput] = useState<string>('');
  const [leetcodeProfile, setLeetCodeProfile] = useState<LeetCodeProfileData | null>(null);
  const [isFetchingLeetcode, setIsFetchingLeetcode] = useState<boolean>(false);
  const [leetcodeError, setLeetcodeError] = useState<string | null>(null);
  const [showLeetCodeDashboard, setShowLeetCodeDashboard] = useState<boolean>(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unsolved' | 'solved' | 'starred' | 'tutorial'>('all');
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);

  // Modals & Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [randomProblem, setRandomProblem] = useState<DsaProblem | null>(null);
  const [showRandomModal, setShowRandomModal] = useState<boolean>(false);

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Check login state and load user progress
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('sql_course_user') || localStorage.getItem('syntaxflow_user');
      if (stored) {
        const parsedUser: UserSession = JSON.parse(stored);
        if (parsedUser && parsedUser.email) {
          setUser(parsedUser);
          loadUserProgress(parsedUser.email);
        }
      }
    } catch (err) {
      console.error('Error reading auth state:', err);
    }
  }, []);

  // Load progress for authenticated user
  const loadUserProgress = async (userEmail: string) => {
    const emailKey = userEmail.toLowerCase().trim();

    // 1. Try local email-keyed cache
    const cachedSolved = localStorage.getItem(`dsa_solved_${emailKey}`);
    const cachedStarred = localStorage.getItem(`dsa_starred_${emailKey}`);
    const cachedLc = localStorage.getItem(`dsa_lc_${emailKey}`);

    if (cachedSolved) {
      try {
        setSolvedIds(JSON.parse(cachedSolved));
      } catch {}
    }
    if (cachedStarred) {
      try {
        setStarredIds(JSON.parse(cachedStarred));
      } catch {}
    }
    if (cachedLc) {
      setLeetCodeUsername(cachedLc);
      setLeetCodeInput(cachedLc);
      fetchLeetCodeProfile(cachedLc, false);
    }

    // 2. Fetch fresh from backend cloud
    try {
      const res = await fetch(`/api/dsa/progress?email=${encodeURIComponent(emailKey)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.solvedIds) && data.solvedIds.length > 0) {
          setSolvedIds(data.solvedIds);
          localStorage.setItem(`dsa_solved_${emailKey}`, JSON.stringify(data.solvedIds));
        }
        if (Array.isArray(data.starredIds) && data.starredIds.length > 0) {
          setStarredIds(data.starredIds);
          localStorage.setItem(`dsa_starred_${emailKey}`, JSON.stringify(data.starredIds));
        }
        if (data.leetcodeUsername && !cachedLc) {
          setLeetCodeUsername(data.leetcodeUsername);
          setLeetCodeInput(data.leetcodeUsername);
          fetchLeetCodeProfile(data.leetcodeUsername, false);
        }
      }
    } catch (err) {
      console.error('Error fetching cloud DSA progress:', err);
    }
  };

  // Sync progress to cloud & local storage for logged-in user
  const syncProgressToCloud = (updatedSolved: string[], updatedStarred: string[], lcHandle?: string) => {
    if (!user || !user.email) return;

    const emailKey = user.email.toLowerCase().trim();
    localStorage.setItem(`dsa_solved_${emailKey}`, JSON.stringify(updatedSolved));
    localStorage.setItem(`dsa_starred_${emailKey}`, JSON.stringify(updatedStarred));
    if (lcHandle !== undefined) {
      localStorage.setItem(`dsa_lc_${emailKey}`, lcHandle);
    }

    fetch('/api/dsa/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        solvedIds: updatedSolved,
        starredIds: updatedStarred,
        leetcodeUsername: lcHandle !== undefined ? lcHandle : leetcodeUsername,
      }),
    }).catch((err) => console.error('Cloud sync error:', err));
  };

  // Auth guard: if not logged in, pop up login modal!
  const requireAuth = (reason: string, callback: () => void) => {
    if (user) {
      callback();
    } else {
      setAuthReason(reason);
      setPendingAction(() => callback);
      setShowAuthModal(true);
    }
  };

  // Toggle problem solved manually (Guarded by auth)
  const handleToggleSolved = (problem: DsaProblem) => {
    requireAuth(`tick "${problem.title}" as solved and save your progress`, () => {
      const isSolved = solvedIds.includes(problem.id);
      let updated: string[];
      if (isSolved) {
        updated = solvedIds.filter((id) => id !== problem.id);
        showToast(`Marked "${problem.title}" as unsolved`);
      } else {
        updated = [...solvedIds, problem.id];
        showToast(`🎉 "${problem.title}" completed!`);
      }
      setSolvedIds(updated);
      syncProgressToCloud(updated, starredIds);
    });
  };

  // 1-Click tick from LeetCode dashboard recent solves
  const handleTickFromDashboard = (problemId: string) => {
    requireAuth('tick this problem on your sheet', () => {
      if (!solvedIds.includes(problemId)) {
        const updated = [...solvedIds, problemId];
        setSolvedIds(updated);
        syncProgressToCloud(updated, starredIds);
        showToast('✓ Checked off problem on your DSA sheet!');
      }
    });
  };

  // Toggle problem starred (Guarded by auth)
  const handleToggleStarred = (problemId: string, problemTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    requireAuth(`bookmark "${problemTitle}" for revision`, () => {
      const isStarred = starredIds.includes(problemId);
      let updated: string[];
      if (isStarred) {
        updated = starredIds.filter((id) => id !== problemId);
      } else {
        updated = [...starredIds, problemId];
        showToast('Bookmarked for revision');
      }
      setStarredIds(updated);
      syncProgressToCloud(solvedIds, updated);
    });
  };

  // Notes handling (Guarded by auth)
  const handleToggleNotes = (problemId: string, problemTitle: string) => {
    requireAuth(`view or write revision notes for "${problemTitle}"`, () => {
      setExpandedNotesId(expandedNotesId === problemId ? null : problemId);
    });
  };

  const handleSaveNotes = (problemId: string, text: string) => {
    requireAuth('save notes to your account', () => {
      const updated = { ...notes, [problemId]: text };
      setNotes(updated);
      if (user) {
        localStorage.setItem(`dsa_notes_${user.email}`, JSON.stringify(updated));
      }
      showToast('Notes saved successfully!');
    });
  };

  // Connect LeetCode profile (Guarded by auth)
  const handleConnectLeetCodeClick = () => {
    requireAuth('connect your LeetCode profile to view your stats dashboard', () => {
      if (!leetcodeInput.trim()) return;
      fetchLeetCodeProfile(leetcodeInput, true);
    });
  };

  const fetchLeetCodeProfile = async (handle: string, showSuccessToast = true) => {
    const target = handle.trim();
    if (!target) return;

    setIsFetchingLeetcode(true);
    setLeetcodeError(null);

    try {
      const res = await fetch(`/api/dsa/leetcode?username=${encodeURIComponent(target)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLeetcodeError(data.error || 'Failed to fetch LeetCode profile');
        setLeetCodeProfile(null);
        return;
      }

      setLeetCodeProfile(data);
      setLeetCodeUsername(target);
      setShowLeetCodeDashboard(true);

      if (user) {
        syncProgressToCloud(solvedIds, starredIds, target);
      }

      if (showSuccessToast) {
        showToast(`Connected @${target}! Live LeetCode dashboard ready.`);
      }
    } catch (err: any) {
      setLeetcodeError(err.message || 'Error connecting to LeetCode');
    } finally {
      setIsFetchingLeetcode(false);
    }
  };

  const handleDisconnectLeetCode = () => {
    setLeetCodeUsername('');
    setLeetCodeInput('');
    setLeetCodeProfile(null);
    if (user) {
      syncProgressToCloud(solvedIds, starredIds, '');
    }
    showToast('Disconnected LeetCode profile');
  };

  // Copy checklist function
  const handleCopyChecklist = () => {
    let output = '';

    DSA_TOPICS.forEach((topic) => {
      const topicProblems = DSA_PROBLEMS.filter((p) => p.topicId === topic.id);
      const solvedCount = topicProblems.filter((p) => solvedIds.includes(p.id)).length;

      output += `\n${topic.name} ${solvedCount}/${topicProblems.length}\n`;

      topicProblems.forEach((p) => {
        const check = solvedIds.includes(p.id) ? '[x]' : '[ ]';
        output += `${check} ${p.title} #${p.number}\n`;
      });
    });

    navigator.clipboard
      .writeText(output.trim())
      .then(() => {
        showToast('📋 Checklist copied to clipboard!');
      })
      .catch(() => {
        showToast('Failed to copy checklist');
      });
  };

  // Reset progress (Guarded by auth)
  const handleResetClick = () => {
    requireAuth('reset progress', () => {
      setShowResetModal(true);
    });
  };

  const handleConfirmReset = () => {
    setSolvedIds([]);
    setStarredIds([]);
    syncProgressToCloud([], []);
    setShowResetModal(false);
    showToast('Progress has been reset.');
  };

  // Random problem picker
  const handlePickRandom = () => {
    const pool = filteredProblems.length > 0 ? filteredProblems : DSA_PROBLEMS;
    const unsolvedPool = pool.filter((p) => !solvedIds.includes(p.id));
    const targetPool = unsolvedPool.length > 0 ? unsolvedPool : pool;

    if (targetPool.length === 0) return;
    const randomIdx = Math.floor(Math.random() * targetPool.length);
    setRandomProblem(targetPool[randomIdx]);
    setShowRandomModal(true);
  };

  // User Logout
  const handleLogout = () => {
    setUser(null);
    setSolvedIds([]);
    setStarredIds([]);
    setLeetCodeUsername('');
    setLeetCodeInput('');
    setLeetCodeProfile(null);
    localStorage.removeItem('sql_course_user');
    showToast('Logged out. Tracking is locked until you sign in.');
  };

  // Successful Auth Callback
  const handleAuthSuccess = (authenticatedUser: UserSession) => {
    setUser(authenticatedUser);
    setShowAuthModal(false);
    loadUserProgress(authenticatedUser.email);
    showToast(`Welcome, ${authenticatedUser.name}! Your tracking is now active.`);

    if (pendingAction) {
      setTimeout(() => {
        pendingAction();
        setPendingAction(null);
      }, 200);
    }
  };

  // Filtered problems
  const filteredProblems = useMemo(() => {
    return DSA_PROBLEMS.filter((problem) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = problem.title.toLowerCase().includes(q);
        const matchNumber = `#${problem.number}`.includes(q) || String(problem.number) === q;
        const matchPattern = problem.pattern.toLowerCase().includes(q);
        const matchTopic = problem.topicName.toLowerCase().includes(q);
        const matchCompany = problem.companies?.some((c) => c.toLowerCase().includes(q));

        if (!matchTitle && !matchNumber && !matchPattern && !matchTopic && !matchCompany) {
          return false;
        }
      }

      if (selectedTopic !== 'all' && problem.topicId !== selectedTopic) {
        return false;
      }

      if (selectedDifficulty !== 'all' && problem.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) {
        return false;
      }

      if (selectedStatus === 'solved' && !solvedIds.includes(problem.id)) return false;
      if (selectedStatus === 'unsolved' && solvedIds.includes(problem.id)) return false;
      if (selectedStatus === 'starred' && !starredIds.includes(problem.id)) return false;
      if (selectedStatus === 'tutorial' && !problem.articleSlug) return false;

      return true;
    });
  }, [searchQuery, selectedTopic, selectedDifficulty, selectedStatus, solvedIds, starredIds]);

  // Overall Statistics
  const totalCount = DSA_PROBLEMS.length;
  const solvedTotal = solvedIds.length;
  const progressPercentage = Math.round((solvedTotal / totalCount) * 100) || 0;

  const easyTotal = DSA_PROBLEMS.filter((p) => p.difficulty === 'Easy').length;
  const easySolved = DSA_PROBLEMS.filter((p) => p.difficulty === 'Easy' && solvedIds.includes(p.id)).length;

  const medTotal = DSA_PROBLEMS.filter((p) => p.difficulty === 'Medium').length;
  const medSolved = DSA_PROBLEMS.filter((p) => p.difficulty === 'Medium' && solvedIds.includes(p.id)).length;

  const hardTotal = DSA_PROBLEMS.filter((p) => p.difficulty === 'Hard').length;
  const hardSolved = DSA_PROBLEMS.filter((p) => p.difficulty === 'Hard' && solvedIds.includes(p.id)).length;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      <Header />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
          <div className="bg-foreground text-background px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-card-border/40 font-medium text-sm">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Auth Notice Banner for Guest Users */}
        {!user && (
          <div className="rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 via-accent-2/10 to-transparent p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-accent/5">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                🔒
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-foreground">
                  Guest Browsing Mode — Progress Tracking Requires Free Login
                </h2>
                <p className="text-xs text-muted">
                  You can explore all 100 questions and read tutorials. To manually tick solved problems, save notes, or
                  view your live LeetCode stats dashboard, sign in to your free account.
                </p>
              </div>
            </div>
            <button
              id="banner-signin-btn"
              onClick={() => {
                setAuthReason('track your progress and save your solved problems');
                setShowAuthModal(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-accent text-white hover:bg-accent/90 active:scale-95 transition-all shadow-md shadow-accent/20 flex-shrink-0 whitespace-nowrap"
            >
              Log In / Register Free →
            </button>
          </div>
        )}

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-card-border/70 bg-gradient-to-br from-card-bg via-card-bg to-accent/5 p-6 sm:p-10 shadow-xl shadow-accent/5">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  100 Curated FAANG DSA Sheet
                </div>

                {user ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <span>👤</span>
                    <span>Tracking active: {user.name}</span>
                    <button
                      onClick={handleLogout}
                      className="ml-1 text-[10px] uppercase font-bold text-muted hover:text-rose-500 underline"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAuthReason('enable progress tracking');
                      setShowAuthModal(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-colors"
                  >
                    <span>🔒</span>
                    <span>Sign in to save progress</span>
                  </button>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Master DSA with <span className="gradient-text">Manual Checklist Tracking</span> & LeetCode Analytics
              </h1>
              <p className="text-muted text-sm sm:text-base leading-relaxed">
                Check off solved questions at your own pace, explore in-depth tutorials with code & dry-runs, and view an
                interactive dashboard of your live LeetCode stats, activity velocity, and practice feed.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="copy-checklist-btn"
                  onClick={handleCopyChecklist}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-accent text-white hover:bg-accent/90 active:scale-95 transition-all shadow-md shadow-accent/20 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  Copy Checklist
                </button>

                <button
                  id="pick-random-btn"
                  onClick={handlePickRandom}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-card-bg border border-card-border hover:border-accent text-foreground hover:text-accent active:scale-95 transition-all shadow-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Roll Random Problem
                </button>

                {leetcodeProfile && (
                  <button
                    onClick={() => setShowLeetCodeDashboard(!showLeetCodeDashboard)}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#FFA116]/10 border border-[#FFA116]/30 text-[#FFA116] hover:bg-[#FFA116]/20 transition-all flex items-center gap-1.5"
                  >
                    <span>📊</span>
                    <span>{showLeetCodeDashboard ? 'Hide LeetCode Stats' : 'View LeetCode Stats'}</span>
                  </button>
                )}

                {user && (
                  <button
                    id="reset-progress-btn"
                    onClick={handleResetClick}
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    Reset Progress
                  </button>
                )}
              </div>
            </div>

            {/* LeetCode Profile Connector Mini-Card */}
            <div className="w-full lg:w-96 rounded-2xl bg-card-bg/90 border border-card-border p-5 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-card-border/60">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FFA116]/10 flex items-center justify-center font-bold text-[#FFA116]">
                    LC
                  </div>
                  <span className="font-bold text-sm">LeetCode Stats & Activity</span>
                </div>
                {user && leetcodeProfile && (
                  <button
                    onClick={handleDisconnectLeetCode}
                    className="text-xs text-muted hover:text-rose-500 transition-colors"
                  >
                    Disconnect
                  </button>
                )}
              </div>

              {!user ? (
                <div className="pt-3 space-y-3">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
                    <p className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <span>🔒</span> Locked for Guests
                    </p>
                    <p className="text-muted leading-relaxed">
                      Link your LeetCode handle to see your live problem-solving velocity, recent practice feed, and
                      global ranking.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAuthReason('connect your LeetCode profile');
                      setShowAuthModal(true);
                    }}
                    className="w-full py-2.5 text-xs font-bold bg-[#FFA116] hover:bg-[#FFA116]/90 text-white rounded-xl active:scale-95 transition-all shadow-md shadow-[#FFA116]/20 flex items-center justify-center gap-2"
                  >
                    <span>Log In to View LeetCode Stats</span>
                  </button>
                </div>
              ) : !leetcodeProfile ? (
                <div className="pt-3 space-y-3">
                  <p className="text-xs text-muted">
                    Enter your LeetCode username to load your live activity analytics, recent practice feed, and badges.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. chakradhar or neal_wu"
                      value={leetcodeInput}
                      onChange={(e) => setLeetCodeInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleConnectLeetCodeClick()}
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-background border border-card-border focus:outline-none focus:border-accent text-foreground"
                    />
                    <button
                      id="connect-leetcode-btn"
                      disabled={isFetchingLeetcode || !leetcodeInput.trim()}
                      onClick={handleConnectLeetCodeClick}
                      className="px-3.5 py-2 text-xs font-bold bg-[#FFA116] hover:bg-[#FFA116]/90 text-white rounded-xl active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 whitespace-nowrap"
                    >
                      {isFetchingLeetcode ? (
                        <span className="animate-spin text-sm">⏳</span>
                      ) : (
                        <span>Load Stats</span>
                      )}
                    </button>
                  </div>
                  {leetcodeError && (
                    <p className="text-xs text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                      {leetcodeError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="pt-3 space-y-3">
                  <div className="flex items-center gap-3">
                    {leetcodeProfile.profile.userAvatar ? (
                      <img
                        src={leetcodeProfile.profile.userAvatar}
                        alt={leetcodeProfile.username}
                        className="w-10 h-10 rounded-full border border-card-border object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-accent/10 text-accent font-black flex items-center justify-center text-sm">
                        {leetcodeProfile.username.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm truncate">{leetcodeProfile.profile.realName}</span>
                        <span className="text-[10px] text-muted">(@{leetcodeProfile.username})</span>
                      </div>
                      <div className="text-[11px] text-muted flex items-center gap-2">
                        <span>Rank #{leetcodeProfile.profile.ranking?.toLocaleString() || 'N/A'}</span>
                        <span>•</span>
                        <span className="text-emerald-500 font-semibold">
                          {leetcodeProfile.activity?.solvesLast7Days || 0} solves this week
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowLeetCodeDashboard(!showLeetCodeDashboard)}
                    className="w-full py-2 text-xs font-bold bg-[#FFA116]/10 hover:bg-[#FFA116]/20 text-[#FFA116] rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>{showLeetCodeDashboard ? '▲ Hide Full Analytics Dashboard' : '▼ View Full Analytics Dashboard'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive LeetCode Stats & Activity Dashboard Component */}
        {user && leetcodeProfile && showLeetCodeDashboard && (
          <LeetCodeStatsDashboard
            data={leetcodeProfile}
            solvedIds={solvedIds}
            onTickProblem={handleTickFromDashboard}
            onRefresh={() => fetchLeetCodeProfile(leetcodeUsername, true)}
            onDisconnect={handleDisconnectLeetCode}
            isRefreshing={isFetchingLeetcode}
          />
        )}

        {/* Progress Overview Bar & Difficulty Pills */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-card-border bg-card-bg p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                {user ? 'Your Solved Progress' : 'Sheet Overview'}
              </span>
              <span className="text-lg font-black gradient-text">
                {user ? `${progressPercentage}%` : `${totalCount} Problems`}
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-card-border/60 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent-2 rounded-full transition-all duration-500"
                style={{ width: user ? `${progressPercentage}%` : '0%' }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted">
              {user ? (
                <>
                  <span>
                    <strong className="text-foreground">{solvedTotal}</strong> of {totalCount} Solved
                  </span>
                  <span>{totalCount - solvedTotal} Remaining</span>
                </>
              ) : (
                <span className="text-muted/80">Log in to track your personal progress</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-card-border bg-card-bg p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Easy Problems</span>
              <span className="text-xs font-extrabold text-muted">
                {user ? `${easySolved} / ${easyTotal}` : `${easyTotal} Total`}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-card-border/60 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: user && easyTotal ? `${(easySolved / easyTotal) * 100}%` : '0%' }}
              />
            </div>
            <div className="text-[11px] text-muted">
              {user ? `${Math.round(easyTotal ? (easySolved / easyTotal) * 100 : 0)}% Complete` : 'Foundational concepts'}
            </div>
          </div>

          <div className="rounded-2xl border border-card-border bg-card-bg p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Medium Problems</span>
              <span className="text-xs font-extrabold text-muted">
                {user ? `${medSolved} / ${medTotal}` : `${medTotal} Total`}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-card-border/60 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: user && medTotal ? `${(medSolved / medTotal) * 100}%` : '0%' }}
              />
            </div>
            <div className="text-[11px] text-muted">
              {user ? `${Math.round(medTotal ? (medSolved / medTotal) * 100 : 0)}% Complete` : 'Core interview questions'}
            </div>
          </div>

          <div className="rounded-2xl border border-card-border bg-card-bg p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Hard Problems</span>
              <span className="text-xs font-extrabold text-muted">
                {user ? `${hardSolved} / ${hardTotal}` : `${hardTotal} Total`}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-card-border/60 overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{ width: user && hardTotal ? `${(hardSolved / hardTotal) * 100}%` : '0%' }}
              />
            </div>
            <div className="text-[11px] text-muted">
              {user ? `${Math.round(hardTotal ? (hardSolved / hardTotal) * 100 : 0)}% Complete` : 'FAANG tier rounds'}
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="rounded-2xl border border-card-border bg-card-bg p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problem, #number, company (Google), pattern..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-background border border-card-border text-foreground placeholder:text-muted/70 text-sm focus:outline-none focus:border-accent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-foreground text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <span className="text-xs font-semibold text-muted">
                Showing <strong className="text-foreground">{filteredProblems.length}</strong> of {totalCount}
              </span>
              <div className="flex items-center rounded-xl border border-card-border p-1 bg-background">
                <button
                  onClick={() => setViewMode('grouped')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'grouped'
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  By Topic
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'list'
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  All List
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-card-border/60">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="text-[11px] font-bold text-muted uppercase">Status:</span>
              {(['all', 'unsolved', 'solved', 'starred', 'tutorial'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    if ((status === 'solved' || status === 'starred') && !user) {
                      setAuthReason(`view your ${status} questions`);
                      setShowAuthModal(true);
                      return;
                    }
                    setSelectedStatus(status);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    selectedStatus === status
                      ? 'bg-foreground text-background font-bold shadow-sm'
                      : 'bg-background hover:bg-card-border/40 text-muted hover:text-foreground border border-card-border/60'
                  }`}
                >
                  {status === 'all'
                    ? 'All'
                    : status === 'tutorial'
                    ? '📖 Has Tutorial'
                    : status === 'starred'
                    ? '⭐ Starred'
                    : status}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-muted uppercase">Difficulty:</span>
              {['all', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff.toLowerCase())}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedDifficulty === diff.toLowerCase()
                      ? diff === 'Easy'
                        ? 'bg-emerald-500 text-white font-bold'
                        : diff === 'Medium'
                        ? 'bg-amber-500 text-white font-bold'
                        : diff === 'Hard'
                        ? 'bg-rose-500 text-white font-bold'
                        : 'bg-foreground text-background font-bold'
                      : 'bg-background hover:bg-card-border/40 text-muted hover:text-foreground border border-card-border/60'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedTopic('all')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all font-semibold ${
                selectedTopic === 'all'
                  ? 'bg-accent/15 text-accent border border-accent/40 font-bold'
                  : 'bg-background hover:bg-card-border/30 text-muted border border-card-border/50'
              }`}
            >
              All Topics ({totalCount})
            </button>
            {DSA_TOPICS.map((topic) => {
              const topicProblems = DSA_PROBLEMS.filter((p) => p.topicId === topic.id);
              const topicSolved = topicProblems.filter((p) => solvedIds.includes(p.id)).length;
              const isSelected = selectedTopic === topic.id;

              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 font-semibold ${
                    isSelected
                      ? 'bg-accent/15 text-accent border border-accent/40 font-bold'
                      : 'bg-background hover:bg-card-border/30 text-muted border border-card-border/50'
                  }`}
                >
                  <span>{topic.icon}</span>
                  <span>{topic.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      user && topicSolved === topicProblems.length && topicProblems.length > 0
                        ? 'bg-emerald-500 text-white'
                        : 'bg-card-border/60 text-muted'
                    }`}
                  >
                    {user ? `${topicSolved}/${topicProblems.length}` : topicProblems.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Problems List or Grouped View */}
        {viewMode === 'grouped' ? (
          <div className="space-y-6">
            {DSA_TOPICS.filter((topic) => selectedTopic === 'all' || selectedTopic === topic.id).map((topic) => {
              const topicProblems = filteredProblems.filter((p) => p.topicId === topic.id);
              if (topicProblems.length === 0) return null;

              const allTopicProblems = DSA_PROBLEMS.filter((p) => p.topicId === topic.id);
              const solvedInTopic = allTopicProblems.filter((p) => solvedIds.includes(p.id)).length;

              return (
                <div
                  key={topic.id}
                  className="rounded-2xl border border-card-border bg-card-bg overflow-hidden shadow-sm"
                >
                  <div className="px-5 py-4 bg-background/60 border-b border-card-border flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{topic.icon}</span>
                      <div>
                        <h2 className="text-base sm:text-lg font-black tracking-tight">{topic.name}</h2>
                        <p className="text-xs text-muted">{topic.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {user ? (
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-card-border overflow-hidden">
                            <div
                              className="h-full bg-accent transition-all duration-300"
                              style={{
                                width: `${(solvedInTopic / allTopicProblems.length) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-muted">
                            {solvedInTopic}/{allTopicProblems.length}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-muted bg-card-border/40 px-2.5 py-1 rounded-lg">
                          {allTopicProblems.length} Problems
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-card-border/60">
                    {topicProblems.map((problem) => (
                      <ProblemRow
                        key={problem.id}
                        problem={problem}
                        isLoggedIn={!!user}
                        isSolved={solvedIds.includes(problem.id)}
                        isStarred={starredIds.includes(problem.id)}
                        notesText={notes[problem.id] || ''}
                        isNotesOpen={expandedNotesId === problem.id}
                        onToggleSolved={() => handleToggleSolved(problem)}
                        onToggleStarred={(e) => handleToggleStarred(problem.id, problem.title, e)}
                        onToggleNotes={() => handleToggleNotes(problem.id, problem.title)}
                        onSaveNotes={(text) => handleSaveNotes(problem.id, text)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-card-border bg-card-bg overflow-hidden shadow-sm divide-y divide-card-border/60">
            {filteredProblems.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <span className="text-4xl">🔍</span>
                <h3 className="font-bold text-base">No problems match your current filter</h3>
                <p className="text-xs text-muted">Try clearing the search query or changing your filter criteria.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTopic('all');
                    setSelectedDifficulty('all');
                    setSelectedStatus('all');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-accent text-white"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredProblems.map((problem) => (
                <ProblemRow
                  key={problem.id}
                  problem={problem}
                  isLoggedIn={!!user}
                  isSolved={solvedIds.includes(problem.id)}
                  isStarred={starredIds.includes(problem.id)}
                  notesText={notes[problem.id] || ''}
                  isNotesOpen={expandedNotesId === problem.id}
                  onToggleSolved={() => handleToggleSolved(problem)}
                  onToggleStarred={(e) => handleToggleStarred(problem.id, problem.title, e)}
                  onToggleNotes={() => handleToggleNotes(problem.id, problem.title)}
                  onSaveNotes={(text) => handleSaveNotes(problem.id, text)}
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* Login / Auth Modal */}
      {showAuthModal && (
        <DsaAuthModal
          reason={authReason}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Confirmation Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card-bg border border-card-border rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-rose-500">Reset All Progress?</h3>
            <p className="text-xs text-muted leading-relaxed">
              This will clear all your checked problems and bookmarked stars. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                id="confirm-reset-btn"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Random Problem Modal */}
      {showRandomModal && randomProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card-bg border border-card-border rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowRandomModal(false)}
              className="absolute top-4 right-4 text-muted hover:text-foreground text-sm font-bold"
            >
              ✕
            </button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold">
              <span>🎯</span> Your Next Challenge
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted font-semibold">{randomProblem.topicName}</div>
              <h3 className="text-xl sm:text-2xl font-black">
                #{randomProblem.number} {randomProblem.title}
              </h3>
              <div className="flex items-center gap-2 pt-2">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                    randomProblem.difficulty === 'Easy'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : randomProblem.difficulty === 'Medium'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {randomProblem.difficulty}
                </span>
                <span className="text-xs text-muted font-medium bg-card-border/40 px-2 py-0.5 rounded-md">
                  {randomProblem.pattern}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-3">
              <a
                href={randomProblem.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#FFA116] hover:bg-[#FFA116]/90 text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-[#FFA116]/20"
              >
                <span>Solve on LeetCode</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>

              {randomProblem.articleSlug ? (
                <Link
                  href={`/articles/${randomProblem.articleSlug}`}
                  target="_blank"
                  className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-accent hover:bg-accent/90 text-white flex items-center justify-center gap-2 transition-all"
                >
                  <span>📖 Read SyntaxFlow Solution</span>
                </Link>
              ) : null}

              <button
                onClick={() => {
                  handleToggleSolved(randomProblem);
                  setShowRandomModal(false);
                }}
                className="w-full py-2 rounded-xl text-xs font-bold border border-card-border hover:bg-card-border/30 text-foreground transition-all"
              >
                {solvedIds.includes(randomProblem.id) ? 'Mark as Unsolved' : 'Mark as Solved!'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// -------------------------------------------------------------------------------------------------
// ProblemRow Subcomponent
// -------------------------------------------------------------------------------------------------
interface ProblemRowProps {
  problem: DsaProblem;
  isLoggedIn: boolean;
  isSolved: boolean;
  isStarred: boolean;
  notesText: string;
  isNotesOpen: boolean;
  onToggleSolved: () => void;
  onToggleStarred: (e: React.MouseEvent) => void;
  onToggleNotes: () => void;
  onSaveNotes: (text: string) => void;
}

const ProblemRow: React.FC<ProblemRowProps> = ({
  problem,
  isLoggedIn,
  isSolved,
  isStarred,
  notesText,
  isNotesOpen,
  onToggleSolved,
  onToggleStarred,
  onToggleNotes,
  onSaveNotes,
}) => {
  const [localNote, setLocalNote] = useState(notesText);

  useEffect(() => {
    setLocalNote(notesText);
  }, [notesText]);

  return (
    <div
      className={`group transition-all duration-150 ${
        isSolved ? 'bg-emerald-500/[0.03] dark:bg-emerald-500/[0.04]' : 'hover:bg-card-border/20'
      }`}
    >
      <div className="px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Checkbox + Title + Badges */}
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          <button
            type="button"
            id={`checkbox-${problem.id}`}
            onClick={onToggleSolved}
            className={`w-5 h-5 mt-0.5 sm:mt-0 rounded-md border flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
              isSolved
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                : !isLoggedIn
                ? 'border-muted/40 hover:border-accent bg-background/50 hover:bg-accent/10'
                : 'border-muted/50 hover:border-accent bg-background'
            }`}
            title={isLoggedIn ? `Mark ${problem.title} as ${isSolved ? 'unsolved' : 'solved'}` : 'Log in to tick this problem'}
            aria-label={`Mark ${problem.title} as ${isSolved ? 'unsolved' : 'solved'}`}
          >
            {isSolved ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : !isLoggedIn ? (
              <span className="text-[10px] text-muted/60 group-hover:text-accent font-bold">🔒</span>
            ) : null}
          </button>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-muted/80">#{problem.number}</span>
              <a
                href={problem.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm font-bold hover:text-accent transition-colors flex items-center gap-1.5 ${
                  isSolved ? 'line-through text-muted hover:text-foreground' : 'text-foreground'
                }`}
              >
                <span>{problem.title}</span>
                <svg
                  className="w-3 h-3 text-muted/60 group-hover:text-accent transition-colors"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
              <span className="font-medium bg-card-border/40 px-2 py-0.5 rounded-md">{problem.pattern}</span>
              {problem.companies?.slice(0, 3).map((comp) => (
                <span key={comp} className="text-muted/70 text-[10px]">
                  • {comp}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Difficulty + Tutorial Button + Notes & Star */}
        <div className="flex items-center gap-2.5 sm:self-center pl-8 sm:pl-0">
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
              problem.difficulty === 'Easy'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : problem.difficulty === 'Medium'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}
          >
            {problem.difficulty}
          </span>

          {problem.articleSlug ? (
            <Link
              href={`/articles/${problem.articleSlug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/20 transition-all duration-200 active:scale-95 shadow-sm"
              title={problem.tutorialTitle || 'Read Tutorial & Code Breakdown'}
            >
              <span>📖 Tutorial</span>
            </Link>
          ) : (
            <a
              href={`/search?q=${encodeURIComponent(problem.title)}`}
              target="_blank"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium text-muted hover:text-foreground hover:bg-card-border/40 transition-colors"
              title="Search discussion or related questions"
            >
              <span>Search</span>
            </a>
          )}

          <button
            type="button"
            onClick={onToggleNotes}
            className={`p-1.5 rounded-lg transition-colors ${
              notesText ? 'text-accent bg-accent/10' : 'text-muted hover:text-foreground hover:bg-card-border/30'
            }`}
            title={isLoggedIn ? 'Add personal notes' : 'Log in to add personal notes'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={onToggleStarred}
            className={`p-1.5 rounded-lg transition-transform active:scale-125 ${
              isStarred ? 'text-amber-400' : 'text-muted hover:text-amber-400 hover:bg-card-border/30'
            }`}
            title={isLoggedIn ? 'Bookmark for revision' : 'Log in to bookmark this question'}
          >
            <svg
              className="w-4 h-4"
              fill={isStarred ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        </div>
      </div>

      {isNotesOpen && (
        <div className="px-6 pb-4 pt-1 bg-background/50 border-t border-card-border/40 animate-fade-in">
          <div className="max-w-xl space-y-2">
            <label className="text-[11px] font-bold text-muted uppercase">Your Revision Notes & Gotchas</label>
            <textarea
              rows={2}
              value={localNote}
              onChange={(e) => setLocalNote(e.target.value)}
              placeholder="Key takeaway, edge cases (e.g. empty array, negative numbers, overflow)..."
              className="w-full text-xs p-2.5 rounded-xl bg-card-bg border border-card-border focus:outline-none focus:border-accent text-foreground resize-none"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onSaveNotes(localNote)}
                className="px-3 py-1 text-xs font-bold bg-accent text-white rounded-lg hover:bg-accent/90"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------------------------------------------
// DsaAuthModal Subcomponent (Log In / Create Free Account)
// -------------------------------------------------------------------------------------------------
interface DsaAuthModalProps {
  reason: string;
  onClose: () => void;
  onSuccess: (user: UserSession) => void;
}

const DsaAuthModal: React.FC<DsaAuthModalProps> = ({ reason, onClose, onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your email.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/sql-course/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: password.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      if (data.user) {
        localStorage.setItem('sql_course_user', JSON.stringify(data.user));
        onSuccess(data.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/sql-course/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      const newUser: UserSession = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        registrationId: data.registrationId || 'SF-DSA-USER',
        status: 'confirmed',
      };
      localStorage.setItem('sql_course_user', JSON.stringify(newUser));
      onSuccess(newUser);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
      <div className="bg-card-bg border border-card-border rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted hover:text-foreground text-sm font-bold p-1 rounded-lg"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
            <span>🔒</span> Free Account Required
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Sign In to Track Your Progress
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Please log in or create a free account to {reason}. Your progress, notes, and LeetCode stats dashboard will
            be saved across all devices.
          </p>
        </div>

        {/* Google Sign In Option */}
        <div className="space-y-3 pt-1">
          <GoogleSignInButton
            text={tab === 'login' ? 'signin_with' : 'signup_with'}
            onSuccess={(authenticatedUser) => {
              localStorage.setItem('sql_course_user', JSON.stringify(authenticatedUser));
              onSuccess(authenticatedUser);
            }}
            onError={(err) => setErrorMsg(err)}
          />

          <div className="relative flex items-center justify-center">
            <div className="border-t border-card-border/80 w-full" />
            <span className="bg-card-bg px-3 text-[10px] font-bold text-muted uppercase tracking-widest relative">
              Or with email & password
            </span>
            <div className="border-t border-card-border/80 w-full" />
          </div>
        </div>

        <div className="flex rounded-xl bg-background border border-card-border p-1">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'login' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-foreground'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'register' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-foreground'
            }`}
          >
            Create Free Account
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl leading-relaxed">
            {errorMsg}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-card-border focus:outline-none focus:border-accent text-foreground"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-muted">Password</label>
                <Link
                  href="/sql-course/login"
                  target="_blank"
                  className="text-[11px] text-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-card-border focus:outline-none focus:border-accent text-foreground pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-muted hover:text-foreground"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/25 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Log In & Continue</span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Sharma"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-card-border focus:outline-none focus:border-accent text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-card-border focus:outline-none focus:border-accent text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Create Password (min 6 chars)</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-card-border focus:outline-none focus:border-accent text-foreground pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-muted hover:text-foreground"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/25 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Free Account & Save Progress</span>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-[11px] text-muted">
          <span>100% Free · No credit card required · Instant access</span>
        </div>
      </div>
    </div>
  );
};
