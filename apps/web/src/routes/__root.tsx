import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/error-boundary";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Header from "../components/header";
import appCss from "../index.css?url";
import type { QueryClient } from "@tanstack/react-query";

import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@top-github-repos/api/routers/index";
export interface RouterAppContext {
	trpc: TRPCOptionsProxy<AppRouter>;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "My App",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	component: RootDocument,
});

function RootDocument() {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<ErrorBoundary>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
						<div className="grid h-svh grid-rows-[auto_1fr]">
							<Header />
							<Outlet />
						</div>
						<Toaster richColors />
						<TanStackRouterDevtools position="bottom-left" />
						<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
						<Scripts />
					</ThemeProvider>
				</ErrorBoundary>
			</body>
		</html>
	);
}
