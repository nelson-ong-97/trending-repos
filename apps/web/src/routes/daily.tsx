import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import RepoList from "@/components/repo-list";
import RepoFilters from "@/components/repo-filters";
import { toast } from "sonner";
import { z } from "zod";
import React, { useMemo } from "react";

const searchSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  language: z.string().optional(),
  search: z.string().optional(),
});

const SITE_URL = process.env.SITE_URL || "https://top-github-repos.com";

export const Route = createFileRoute("/daily")({
  validateSearch: searchSchema,
  component: DailyComponent,
  head: () => {
    const title = "Daily Trending GitHub Repositories";
    const description =
      "Discover the most popular GitHub repositories trending today. Find the hottest open-source projects updated in the last 24 hours.";
    const canonical = `${SITE_URL}/daily`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  beforeLoad: ({ search }) => {
    const page = search.page || 1;
    if (page < 1) {
      throw redirect({
        to: "/daily",
        search: { page: 1, language: search.language, search: search.search },
      });
    }
  },
});

function DailyComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const page = search.page || 1;
  const language = search.language;
  const searchQuery = search.search || "";
  const trpc = useTRPC();
  
  const { data, isLoading, error, refetch } = useQuery(
    trpc.repos.getTrending.queryOptions({
      timeRange: "daily",
      page,
      pageSize: 9,
      language,
      search: searchQuery || undefined,
    })
  );

  // Get unique languages from all repositories (for filter dropdown)
  const availableLanguages = useMemo(() => {
    if (!data?.repos) return [];
    const languages = new Set<string>();
    data.repos.forEach((repo) => {
      if (repo.language) {
        languages.add(repo.language);
      }
    });
    return Array.from(languages).sort();
  }, [data]);

  const handleSearchChange = (value: string) => {
    navigate({
      to: "/daily",
      search: { page: 1, language, search: value || undefined },
    });
  };

  const handleLanguageChange = (value: string | undefined) => {
    navigate({
      to: "/daily",
      search: { page: 1, language: value, search: searchQuery || undefined },
    });
  };

  // Show error toast if API fails (using useEffect to avoid render issues)
  React.useEffect(() => {
    if (error) {
      toast.error("Failed to load trending repositories", {
        description: error.message,
      });
    }
  }, [error]);

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Daily Trending Repositories</h1>
        <p className="text-muted-foreground">
          Discover the most popular GitHub repositories trending today
        </p>
      </section>
      
      <RepoFilters
        search={searchQuery}
        language={language}
        onSearchChange={handleSearchChange}
        onLanguageChange={handleLanguageChange}
        availableLanguages={availableLanguages}
      />
      
      <RepoList
        data={data}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        basePath="/daily"
        language={language}
        search={searchQuery}
      />
    </main>
  );
}
