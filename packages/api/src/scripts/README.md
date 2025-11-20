# Sync Scripts

## Manual Sync Script

The `sync-trending-repos.ts` script allows you to manually populate the database with GitHub repository data without requiring Trigger.dev setup.

### Prerequisites

1. **Database Migration**: Ensure the database tables are created:
   ```bash
   bun run db:push
   ```

2. **Environment Variables**: Set the following in `apps/web/.env` or `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/top_github_repos"
   GITHUB_API_TOKEN="your_github_personal_access_token"
   ```

### Usage

Run the sync script from the project root:

```bash
bun run sync:repos
```

Or directly:

```bash
bun run packages/api/src/scripts/sync-trending-repos.ts
```

### What It Does

1. Fetches trending repositories from GitHub API for all time ranges (daily, weekly, monthly, yearly)
2. Upserts repository data into the `Repository` table
3. Creates or updates `RepositorySnapshot` records for each time range
4. Calculates trending scores based on star growth

### Output

The script provides progress updates:
- Number of repositories found per time range
- Number of repositories created vs updated
- Total sync duration
- Error messages for any failed operations

### Background Job (Production)

For production, Vercel Cron automatically syncs data every 6 hours via the `/api/cron/sync-repos` endpoint.

**Vercel Cron Setup:**
1. Deploy your application to Vercel
2. The cron job is configured in `vercel.json` with schedule: `0 */6 * * *` (every 6 hours)
3. Optionally set `CRON_SECRET` environment variable for additional security
4. Vercel will automatically call `/api/cron/sync-repos` on schedule

**Manual Trigger:**
You can also manually trigger the sync by calling:
```bash
curl https://your-domain.com/api/cron/sync-repos
```

### Troubleshooting

**Empty database after sync:**
- Check that `DATABASE_URL` is correct and database is accessible
- Verify `GITHUB_API_TOKEN` is valid and has proper permissions
- Check console output for error messages

**Rate limit errors:**
- GitHub API has rate limits (5,000 requests/hour for authenticated users)
- The script includes Redis caching to minimize API calls
- If hitting limits, wait and retry

**Database connection errors:**
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` format is correct
- Check database exists: `createdb top_github_repos`

