export type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Repository {
  id: number;
  githubId: number;
  owner: string;
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  language: string | null;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number | null;
  topics: string[] | null;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string;
}

export interface RepositoryWithTrending extends Repository {
  trendingScore: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRepos: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface TrendingReposResponse {
  repos: RepositoryWithTrending[];
  pagination: PaginationMeta;
  lastUpdated: string;
}

