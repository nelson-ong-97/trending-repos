import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Star, GitFork, Circle } from "lucide-react";
import type { RepositoryWithTrending } from "@top-github-repos/api/types/repos";

interface RepoCardProps {
  repo: RepositoryWithTrending;
}

// Language color mapping (common GitHub language colors)
const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#FA7343',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#4FC08D',
  React: '#61dafb',
  Angular: '#DD0031',
  Svelte: '#ff3e00',
};

export default function RepoCard({ repo }: RepoCardProps) {
  const languageColor = repo.language ? languageColors[repo.language] || '#6b7280' : undefined;
  
  // Format numbers with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Format date
  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  // Truncate description if too long
  const truncateDescription = (text: string | null, maxLength: number = 120) => {
    if (!text) return 'No description provided';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="min-w-0 w-full overflow-hidden">
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1.5 group w-full min-w-0"
                aria-label={`View ${repo.fullName} on GitHub`}
              >
                <span className="font-semibold text-lg truncate min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{repo.fullName}</span>
                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex-shrink-0" />
              </a>
            </CardTitle>
            <CardDescription className="mt-2 line-clamp-2">
              {truncateDescription(repo.description)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {/* Stats */}
          <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4" />
              <span>{formatNumber(repo.stargazersCount)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GitFork className="h-4 w-4" />
              <span>{formatNumber(repo.forksCount)}</span>
            </div>
            {repo.language && (
              <div className="flex items-center gap-1.5">
                <Circle 
                  className="h-3 w-3 fill-current" 
                  style={{ color: languageColor }}
                  aria-hidden="true"
                />
                <span>{repo.language}</span>
              </div>
            )}
            {!repo.language && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs">N/A</span>
              </div>
            )}
          </div>

          {/* Topics badges */}
          {repo.topics && repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {repo.topics.slice(0, 5).map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground border border-border"
                >
                  {topic}
                </span>
              ))}
              {repo.topics.length > 5 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-muted-foreground">
                  +{repo.topics.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Last updated */}
          <div className="text-xs text-muted-foreground">
            Updated {formatDate(repo.updatedAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

