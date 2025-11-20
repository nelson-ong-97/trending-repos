/**
 * Manual sync script for trending repositories
 * 
 * This script can be run directly to populate the database with GitHub data.
 * Useful for initial data population and development/testing.
 * 
 * In production, Vercel Cron automatically runs this sync daily (Hobby plan) or every 6 hours (Pro plan).
 * 
 * Usage: bun run packages/api/src/scripts/sync-trending-repos.ts
 */

import '../lib/env'; // Load environment variables first
import { syncTrendingRepos } from '../lib/sync-trending-repos';
import prisma from '@top-github-repos/db';

if (!process.env.GITHUB_API_TOKEN) {
  console.error('❌ Error: GITHUB_API_TOKEN must be set in environment variables');
  console.error('   Please set it in apps/web/.env or .env file');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL must be set in environment variables');
  console.error('   Please set it in apps/web/.env or .env file');
  process.exit(1);
}

async function runSync() {
  console.log('🚀 Starting sync of trending repositories...\n');
  
  const result = await syncTrendingRepos();
  
  // Display results
  for (const rangeResult of result.timeRanges) {
    console.log(`📦 ${rangeResult.timeRange}:`);
    console.log(`   ✅ Synced ${rangeResult.synced} repos (${rangeResult.created} created, ${rangeResult.updated} updated)`);
    if (rangeResult.errors > 0) {
      console.log(`   ⚠️  ${rangeResult.errors} errors`);
    }
  }
  
  const duration = (result.duration / 1000).toFixed(2);
  console.log(`\n✨ Sync completed in ${duration}s`);
  console.log(`\n💡 Tip: Vercel Cron will keep this data updated daily automatically (Hobby plan) or every 6 hours (Pro plan).`);
}

// Run the sync
runSync()
  .then(() => {
    console.log('\n✅ Sync script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Sync script failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

