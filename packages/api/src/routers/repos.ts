import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, router } from '../index';
import prisma from '@top-github-repos/db';
import type { TrendingReposResponse, PaginationMeta } from '../types/repos';

const timeRangeSchema = z.enum(['daily', 'weekly', 'monthly', 'yearly']);

export const reposRouter = router({
  getTrending: publicProcedure
    .input(
      z.object({
        timeRange: timeRangeSchema,
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(9),
        language: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }): Promise<TrendingReposResponse> => {
      const { timeRange, page, pageSize, language, search } = input;

      try {
        // Build where clause for repository filtering
        const repositoryWhere: any = {};
        if (language) {
          repositoryWhere.language = language;
        }
        if (search) {
          const searchLower = search.toLowerCase();
          repositoryWhere.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { owner: { contains: search, mode: 'insensitive' } },
            { topics: { has: searchLower } }, // Search in topics array
          ];
        }

        // Query snapshots for this time range
        // Get all snapshots, then deduplicate to get most recent per repository
        const allSnapshots = await prisma.repositorySnapshot.findMany({
          where: {
            period: timeRange,
            repository: Object.keys(repositoryWhere).length > 0 ? repositoryWhere : undefined,
          },
          include: {
            repository: true,
          },
          orderBy: {
            snapshotDate: 'desc', // Most recent first
          },
        });

        // Deduplicate: Get only the most recent snapshot per repository
        const snapshotMap = new Map<bigint, typeof allSnapshots[0]>();
        for (const snapshot of allSnapshots) {
          if (!snapshotMap.has(snapshot.repositoryId)) {
            snapshotMap.set(snapshot.repositoryId, snapshot);
          }
        }

        // Convert to array and sort by trending score (descending - highest first)
        // Trending score = starsAtEnd for new snapshots, growth rate for updated snapshots
        // Secondary sort by stars for tie-breaking
        const snapshots = Array.from(snapshotMap.values()).sort((a, b) => {
          // Primary sort: by trending score (descending)
          const scoreA = a.trendingScore ? Number(a.trendingScore) : 0;
          const scoreB = b.trendingScore ? Number(b.trendingScore) : 0;
          if (scoreB !== scoreA) {
            return scoreB - scoreA; // Descending order (highest trending score first)
          }
          // Secondary sort: by stars (descending) if trending scores are equal
          const starsA = a.repository.stargazersCount;
          const starsB = b.repository.stargazersCount;
          return starsB - starsA; // Descending order (highest stars first)
        });

        // Calculate pagination indices
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        // If no snapshots exist, fall back to repositories sorted by stars
        // This handles the case where sync hasn't created snapshots yet
        if (snapshots.length === 0) {
          const repositories = await prisma.repository.findMany({
            where: repositoryWhere,
            orderBy: {
              stargazersCount: 'desc',
            },
            take: pageSize * 10, // Get more to allow for pagination
          });

          const repos = repositories.slice(startIndex, endIndex).map((repo) => ({
            id: Number(repo.id),
            githubId: Number(repo.githubId),
            owner: repo.owner,
            name: repo.name,
            fullName: repo.fullName,
            url: repo.url,
            description: repo.description,
            language: repo.language,
            stargazersCount: repo.stargazersCount,
            forksCount: repo.forksCount,
            openIssuesCount: repo.openIssuesCount,
            topics: repo.topics,
            createdAt: repo.createdAt.toISOString(),
            updatedAt: repo.updatedAt.toISOString(),
            lastSyncedAt: repo.lastSyncedAt.toISOString(),
            trendingScore: 0, // No trending score available without snapshots
          }));

          const pagination: PaginationMeta = {
            currentPage: page,
            totalPages: Math.ceil(repositories.length / pageSize),
            pageSize,
            totalRepos: repositories.length,
            hasNext: endIndex < repositories.length,
            hasPrevious: page > 1,
          };

          const mostRecentSync = await prisma.repository.findFirst({
            orderBy: {
              lastSyncedAt: 'desc',
            },
            select: {
              lastSyncedAt: true,
            },
          });

          return {
            repos,
            pagination,
            lastUpdated: mostRecentSync?.lastSyncedAt.toISOString() || new Date().toISOString(),
          };
        }

        // Calculate pagination for snapshots
        const totalRepos = snapshots.length;
        const totalPages = Math.ceil(totalRepos / pageSize);
        const paginatedSnapshots = snapshots.slice(startIndex, endIndex);

        // Transform to response format
        const repos = paginatedSnapshots.map((snapshot) => ({
          id: Number(snapshot.repository.id),
          githubId: Number(snapshot.repository.githubId),
          owner: snapshot.repository.owner,
          name: snapshot.repository.name,
          fullName: snapshot.repository.fullName,
          url: snapshot.repository.url,
          description: snapshot.repository.description,
          language: snapshot.repository.language,
          stargazersCount: snapshot.repository.stargazersCount,
          forksCount: snapshot.repository.forksCount,
          openIssuesCount: snapshot.repository.openIssuesCount,
          topics: snapshot.repository.topics,
          createdAt: snapshot.repository.createdAt.toISOString(),
          updatedAt: snapshot.repository.updatedAt.toISOString(),
          lastSyncedAt: snapshot.repository.lastSyncedAt.toISOString(),
          trendingScore: snapshot.trendingScore ? Number(snapshot.trendingScore) : 0,
        }));

        const pagination: PaginationMeta = {
          currentPage: page,
          totalPages,
          pageSize,
          totalRepos,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        };

        // Get most recent sync time
        const mostRecentSync = await prisma.repository.findFirst({
          orderBy: {
            lastSyncedAt: 'desc',
          },
          select: {
            lastSyncedAt: true,
          },
        });

        return {
          repos,
          pagination,
          lastUpdated: mostRecentSync?.lastSyncedAt.toISOString() || new Date().toISOString(),
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch trending repositories',
          cause: error,
        });
      }
    }),

  getByFullName: publicProcedure
    .input(
      z.object({
        fullName: z.string().regex(/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/),
      })
    )
    .query(async ({ input }) => {
      const { fullName } = input;

      try {
        const repository = await prisma.repository.findUnique({
          where: { fullName },
        });

        if (!repository) {
          return null;
        }

        return {
          id: Number(repository.id),
          githubId: Number(repository.githubId),
          owner: repository.owner,
          name: repository.name,
          fullName: repository.fullName,
          url: repository.url,
          description: repository.description,
          language: repository.language,
          stargazersCount: repository.stargazersCount,
          forksCount: repository.forksCount,
          openIssuesCount: repository.openIssuesCount,
          topics: repository.topics,
          createdAt: repository.createdAt,
          updatedAt: repository.updatedAt,
          lastSyncedAt: repository.lastSyncedAt,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch repository',
          cause: error,
        });
      }
    }),
});

