import { createFileRoute } from "@tanstack/react-router";
import { syncTrendingRepos } from "@top-github-repos/api/lib/sync-trending-repos";

/**
 * Vercel Cron Job: Sync Trending Repositories
 *
 * This endpoint is called by Vercel Cron every 6 hours to sync trending repositories
 * from GitHub API to the database.
 *
 * Configured in vercel.json with schedule: daily (Hobby plan) or every 6 hours (Pro plan)
 *
 * Security: Optionally uses CRON_SECRET environment variable for additional security
 */
export const Route = createFileRoute("/api/cron/sync-repos")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Verify this is a Vercel Cron request
        // Optionally use CRON_SECRET environment variable for additional security
        const cronSecret = process.env.CRON_SECRET;
        const authHeader = request.headers.get("authorization");

        // If CRON_SECRET is set, require it for security
        if (cronSecret) {
          if (authHeader !== `Bearer ${cronSecret}`) {
            return new Response("Unauthorized", { status: 401 });
          }
        }
        // Otherwise, trust Vercel Cron (only works on Vercel platform)
        // In development, allow manual calls for testing

        try {
          const result = await syncTrendingRepos();

          return Response.json({
            success: true,
            message: "Sync completed successfully",
            result: {
              syncedAt: result.syncedAt.toISOString(),
              duration: result.duration,
              timeRanges: result.timeRanges,
            },
          });
        } catch (error) {
          console.error("Cron job error:", error);
          return Response.json(
            {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
          );
        }
      },
    },
  },
});
