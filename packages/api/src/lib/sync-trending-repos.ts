/**
 * Shared sync function for trending repositories
 * Used by both manual sync script and Vercel cron job
 */

import { GitHubService } from '../services/github';
import prisma from '@top-github-repos/db';
import type { TimeRange } from '../types/repos';

export interface SyncResult {
  success: boolean;
  syncedAt: Date;
  timeRanges: {
    timeRange: TimeRange;
    synced: number;
    created: number;
    updated: number;
    errors: number;
  }[];
  duration: number;
}

export async function syncTrendingRepos(): Promise<SyncResult> {
  if (!process.env.GITHUB_API_TOKEN) {
    throw new Error('GITHUB_API_TOKEN must be set');
  }

  const githubService = new GitHubService(process.env.GITHUB_API_TOKEN);
  const timeRanges: TimeRange[] = ['daily', 'weekly', 'monthly', 'yearly'];
  const startTime = Date.now();
  const results: SyncResult['timeRanges'] = [];

  for (const timeRange of timeRanges) {
    let syncedCount = 0;
    let updatedCount = 0;
    let createdCount = 0;
    let errorCount = 0;

    try {
      // Fetch trending repos from GitHub
      const repos = await githubService.getTrendingRepositories(timeRange);

      // Process each repository
      for (const repo of repos) {
        try {
          // Check if repo exists before upsert
          const existingRepo = await prisma.repository.findUnique({
            where: { githubId: BigInt(repo.id) },
          });

          // Upsert repository
          const repository = await prisma.repository.upsert({
            where: { githubId: BigInt(repo.id) },
            update: {
              owner: repo.owner.login,
              name: repo.name,
              fullName: repo.full_name,
              url: repo.html_url,
              description: repo.description,
              language: repo.language,
              stargazersCount: repo.stargazers_count,
              forksCount: repo.forks_count,
              openIssuesCount: repo.open_issues_count,
              topics: repo.topics || [],
              createdAt: new Date(repo.created_at),
              updatedAt: new Date(repo.updated_at),
              lastSyncedAt: new Date(),
            },
            create: {
              githubId: BigInt(repo.id),
              owner: repo.owner.login,
              name: repo.name,
              fullName: repo.full_name,
              url: repo.html_url,
              description: repo.description,
              language: repo.language,
              stargazersCount: repo.stargazers_count,
              forksCount: repo.forks_count,
              openIssuesCount: repo.open_issues_count,
              topics: repo.topics || [],
              createdAt: new Date(repo.created_at),
              updatedAt: new Date(repo.updated_at),
              lastSyncedAt: new Date(),
            },
          });

          // Track if created or updated
          if (existingRepo) {
            updatedCount++;
          } else {
            createdCount++;
          }

          // Calculate period start date
          const now = new Date();
          const daysAgo = timeRange === 'daily' ? 1 : timeRange === 'weekly' ? 7 : timeRange === 'monthly' ? 30 : 365;
          const periodStartDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

          // Find or create snapshot for this period
          const existingSnapshot = await prisma.repositorySnapshot.findFirst({
            where: {
              repositoryId: repository.id,
              period: timeRange,
              periodStartDate: periodStartDate,
            },
          });

          if (existingSnapshot) {
            // Update existing snapshot
            const starsAtStart = Number(existingSnapshot.starsAtStart);
            const trendingScore = daysAgo > 0
              ? (repo.stargazers_count - starsAtStart) / daysAgo
              : 0;

            await prisma.repositorySnapshot.update({
              where: { id: existingSnapshot.id },
              data: {
                starsAtEnd: repo.stargazers_count,
                forksAtEnd: repo.forks_count,
                trendingScore: trendingScore,
                snapshotDate: new Date(),
              },
            });
          } else {
            // Create new snapshot
            // Use starsAtEnd as initial trending score since GitHub already sorted by trending
            // This provides immediate meaningful scores, then transitions to growth-based scores on updates
            const trendingScore = repo.stargazers_count;

            await prisma.repositorySnapshot.create({
              data: {
                repositoryId: repository.id,
                period: timeRange,
                periodStartDate: periodStartDate,
                starsAtStart: repo.stargazers_count,
                starsAtEnd: repo.stargazers_count,
                forksAtStart: repo.forks_count,
                forksAtEnd: repo.forks_count,
                trendingScore: trendingScore,
                snapshotDate: new Date(),
              },
            });
          }

          syncedCount++;
        } catch (error) {
          errorCount++;
          console.error(`Error processing repo ${repo.full_name}:`, error);
          // Continue with next repo
        }
      }

      results.push({
        timeRange,
        synced: syncedCount,
        created: createdCount,
        updated: updatedCount,
        errors: errorCount,
      });
    } catch (error) {
      errorCount = repos?.length || 0;
      results.push({
        timeRange,
        synced: 0,
        created: 0,
        updated: 0,
        errors: errorCount,
      });
      console.error(`Error syncing ${timeRange} repos:`, error);
      // Continue with next time range
    }
  }

  const duration = Date.now() - startTime;

  return {
    success: true,
    syncedAt: new Date(),
    timeRanges: results,
    duration,
  };
}

