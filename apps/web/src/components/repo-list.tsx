import { Skeleton } from "@/components/ui/skeleton";
import RepoCard from "./repo-card";
import Pagination from "./pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TrendingReposResponse } from "@top-github-repos/api/types/repos";

interface RepoListProps {
  data?: TrendingReposResponse;
  isLoading: boolean;
  error?: Error | null | { message?: string };
  onRetry?: () => void;
  basePath: string;
  language?: string;
  search?: string;
}

export default function RepoList({ data, isLoading, error, onRetry, basePath, language, search }: RepoListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-4 mt-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Unable to fetch trending repositories. Please try again.</span>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="ml-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (!data || data.repos.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No trending repositories found for this time period.
        </AlertDescription>
      </Alert>
    );
  }

  // Success state
  return (
    <div className="space-y-6 mt-6">
      {/* Last updated timestamp */}
      {data.lastUpdated && (
        <div className="text-sm text-muted-foreground">
          Last updated: {new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(data.lastUpdated))}
        </div>
      )}

      {/* Repository grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {data.repos.map((repo) => (
          <RepoCard key={repo.id} repo={repo} />
        ))}
      </div>

      {/* Pagination */}
      {data.pagination && (
        <Pagination pagination={data.pagination} basePath={basePath} language={language} search={search} />
      )}
    </div>
  );
}

