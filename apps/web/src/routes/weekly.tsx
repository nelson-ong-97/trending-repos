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

export const Route = createFileRoute("/weekly")({
	validateSearch: searchSchema,
	component: WeeklyComponent,
	head: () => {
		const title = "Weekly Trending GitHub Repositories";
		const description = "Discover the most popular GitHub repositories trending this week. Find the hottest open-source projects updated in the last 7 days.";
		const canonical = `${SITE_URL}/weekly`;

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
			links: [
				{ rel: "canonical", href: canonical },
			],
		};
	},
	beforeLoad: ({ search }) => {
		const page = search.page || 1;
		if (page < 1) {
			throw redirect({
				to: "/weekly",
				search: { page: 1, language: search.language, search: search.search },
			});
		}
	},
});

function WeeklyComponent() {
	const search = Route.useSearch();
	const navigate = useNavigate();
	const page = search.page || 1;
	const language = search.language;
	const searchQuery = search.search || "";
	const trpc = useTRPC();
	
	const { data, isLoading, error, refetch } = useQuery(
		trpc.repos.getTrending.queryOptions({
			timeRange: 'weekly',
			page,
			pageSize: 9,
			language,
			search: searchQuery || undefined,
		})
	);

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
			to: "/weekly",
			search: { page: 1, language, search: value || undefined },
		});
	};

	const handleLanguageChange = (value: string | undefined) => {
		navigate({
			to: "/weekly",
			search: { page: 1, language: value, search: searchQuery || undefined },
		});
	};

	React.useEffect(() => {
		if (error) {
			toast.error('Failed to load trending repositories', {
				description: error.message,
			});
		}
	}, [error]);

	return (
		<main className="container mx-auto px-4 py-8">
			<section className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Weekly Trending Repositories</h1>
				<p className="text-muted-foreground">
					Discover the most popular GitHub repositories trending this week
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
				basePath="/weekly"
				language={language}
				search={searchQuery}
			/>
		</main>
	);
}

