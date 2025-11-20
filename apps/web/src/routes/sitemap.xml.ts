import { createFileRoute } from "@tanstack/react-router";

const SITE_URL = process.env.SITE_URL || "https://top-github-repos.com";

export const Route = createFileRoute("/sitemap/xml")({
	server: {
		handlers: {
			GET: () => {
				const routes = [
					{ path: "/", priority: "1.0", changefreq: "daily" },
					{ path: "/daily", priority: "0.9", changefreq: "daily" },
					{ path: "/weekly", priority: "0.9", changefreq: "weekly" },
					{ path: "/monthly", priority: "0.8", changefreq: "monthly" },
					{ path: "/yearly", priority: "0.7", changefreq: "yearly" },
				]

				const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
	.map(
		(route) => `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
	)
	.join("\n")}
</urlset>`;

				return new Response(sitemap, {
					headers: {
						"Content-Type": "application/xml; charset=utf-8",
					},
				})
			},
		},
	},
});

