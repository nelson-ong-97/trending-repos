/**
 * GitHub API Service
 * 
 * Handles authenticated requests to GitHub REST API v3
 * Includes Redis caching layer to minimize rate limit issues
 */

import { redis } from '../lib/redis';

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics?: string[];
  created_at: string;
  updated_at: string;
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepository[];
}

export class GitHubService {
  private baseUrl = 'https://api.github.com';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  /**
   * Fetch repository by full name (owner/repo)
   * Uses Redis cache to minimize API calls
   */
  async getRepository(fullName: string, useCache = true): Promise<GitHubRepository> {
    const cacheKey = `github:repo:${fullName}`;
    
    // Try cache first
    if (useCache && redis) {
      try {
        const cached = await redis.get<GitHubRepository>(cacheKey);
        if (cached) {
          return cached;
        }
      } catch (error) {
        // Redis error - continue without cache
        console.warn('Redis cache error:', error);
      }
    }
    
    // Fetch from API
    const url = `${this.baseUrl}/repos/${fullName}`;
    const response = await this.fetchWithAuth(url);
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    
    const repo = await response.json() as GitHubRepository;
    
    // Cache for 1 hour
    if (useCache && redis) {
      try {
        await redis.setex(cacheKey, 3600, repo);
      } catch (error) {
        // Redis error - continue without cache
        console.warn('Redis cache error:', error);
      }
    }
    
    return repo;
  }

  /**
   * Search repositories with query
   * Uses Redis cache to minimize API calls
   */
  async searchRepositories(query: string, sort: 'stars' | 'updated' | 'forks' = 'stars', order: 'desc' | 'asc' = 'desc', useCache = true): Promise<GitHubSearchResponse> {
    const cacheKey = `github:search:${query}:${sort}:${order}`;
    
    // Try cache first
    if (useCache && redis) {
      try {
        const cached = await redis.get<GitHubSearchResponse>(cacheKey);
        if (cached) {
          return cached;
        }
      } catch (error) {
        // Redis error - continue without cache
        console.warn('Redis cache error:', error);
      }
    }
    
    // Fetch from API
    const url = `${this.baseUrl}/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=${order}`;
    const response = await this.fetchWithAuth(url);
    
    if (!response.ok) {
      let errorMessage = `GitHub API error: ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.json() as { message?: string; errors?: Array<{ message: string }> };
        if (errorBody.message) {
          errorMessage += ` - ${errorBody.message}`;
        }
        if (errorBody.errors && errorBody.errors.length > 0) {
          errorMessage += ` - ${errorBody.errors.map(e => e.message).join(', ')}`;
        }
      } catch {
        // If JSON parsing fails, use the status text
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json() as GitHubSearchResponse;
    
    // Cache for 30 minutes (search results change frequently)
    if (useCache && redis) {
      try {
        await redis.setex(cacheKey, 1800, result);
      } catch (error) {
        // Redis error - continue without cache
        console.warn('Redis cache error:', error);
      }
    }
    
    return result;
  }

  /**
   * Fetch trending repositories (approximated via search)
   * This is a placeholder - actual trending calculation happens via background job
   */
  async getTrendingRepositories(timeRange: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<GitHubRepository[]> {
    // Calculate date range
    const now = new Date();
    const daysAgo = timeRange === 'daily' ? 1 : timeRange === 'weekly' ? 7 : timeRange === 'monthly' ? 30 : 365;
    const dateStr = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // GitHub search API: Use pushed: qualifier to find repos updated in the time range
    // Sort by stars to get the most popular ones
    // Format: pushed:>=YYYY-MM-DD
    const query = `pushed:>=${dateStr}`;
    const result = await this.searchRepositories(query, 'stars', 'desc');
    
    return result.items.slice(0, 100); // Limit to top 100
  }

  /**
   * Fetch with authentication headers
   */
  private async fetchWithAuth(url: string): Promise<Response> {
    return fetch(url, {
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'top-github-repos',
      },
    });
  }
}

