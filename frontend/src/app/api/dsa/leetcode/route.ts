import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUsername = searchParams.get('username') || '';
    const username = rawUsername.trim().replace(/^@/, '');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const query = `
      query userProfileData($username: String!) {
        allQuestionsCount {
          difficulty
          count
        }
        matchedUser(username: $username) {
          username
          profile {
            realName
            userAvatar
            ranking
            reputation
            countryName
            school
          }
          submitStats {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
            totalSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          badges {
            id
            displayName
            icon
          }
        }
        recentAcSubmissionList(username: $username, limit: 30) {
          id
          title
          titleSlug
          timestamp
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Referer: 'https://leetcode.com',
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `LeetCode API responded with status ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (!data.data?.matchedUser) {
      return NextResponse.json(
        { error: `LeetCode user "${username}" was not found or has a private profile.` },
        { status: 404 }
      );
    }

    const matchedUser = data.data.matchedUser;
    const allQuestions = data.data.allQuestionsCount || [];
    const recentSubmissions = data.data.recentAcSubmissionList || [];

    // Calculate activity metrics
    const nowSec = Math.floor(Date.now() / 1000);
    const oneWeekAgo = nowSec - 7 * 24 * 3600;
    const oneMonthAgo = nowSec - 30 * 24 * 3600;

    const solvesLast7Days = recentSubmissions.filter(
      (s: { timestamp: string }) => parseInt(s.timestamp, 10) >= oneWeekAgo
    ).length;

    const solvesLast30Days = recentSubmissions.filter(
      (s: { timestamp: string }) => parseInt(s.timestamp, 10) >= oneMonthAgo
    ).length;

    // Calculate overall acceptance rate
    const totalAcSubmissions =
      matchedUser.submitStats?.acSubmissionNum?.find((s: any) => s.difficulty === 'All')?.submissions || 0;
    const totalAllSubmissions =
      matchedUser.submitStats?.totalSubmissionNum?.find((s: any) => s.difficulty === 'All')?.submissions || 0;
    const acceptanceRate =
      totalAllSubmissions > 0 ? ((totalAcSubmissions / totalAllSubmissions) * 100).toFixed(1) : null;

    // Extract unique slugs
    const solvedSlugs = Array.from(
      new Set(
        recentSubmissions
          .map((sub: { titleSlug?: string }) => (sub.titleSlug || '').toLowerCase().trim())
          .filter(Boolean)
      )
    );

    return NextResponse.json({
      success: true,
      username: matchedUser.username,
      profile: {
        realName: matchedUser.profile?.realName || matchedUser.username,
        userAvatar: matchedUser.profile?.userAvatar || '',
        ranking: matchedUser.profile?.ranking || 0,
        reputation: matchedUser.profile?.reputation || 0,
        countryName: matchedUser.profile?.countryName || null,
        school: matchedUser.profile?.school || null,
      },
      catalogCounts: allQuestions,
      submitStats: matchedUser.submitStats?.acSubmissionNum || [],
      acceptanceRate,
      badges: matchedUser.badges || [],
      activity: {
        solvesLast7Days,
        solvesLast30Days,
        recentSubmissionsCount: recentSubmissions.length,
        mostRecentTimestamp: recentSubmissions[0]?.timestamp || null,
      },
      solvedSlugs,
      recentSubmissions: recentSubmissions.slice(0, 25),
    });
  } catch (err: any) {
    console.error('LeetCode proxy error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch LeetCode profile' },
      { status: 500 }
    );
  }
}
