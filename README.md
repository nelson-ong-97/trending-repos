# top-github-repos

Discover and explore the most popular and trending GitHub repositories. This application fetches trending repositories from GitHub API and displays them with filtering, search, and pagination capabilities.

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Start, tRPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Start** - SSR framework with TanStack Router
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **tRPC** - End-to-end type-safe APIs
- **Prisma** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Vercel Cron** - Automated repository syncing daily (Hobby plan) or every 6 hours (Pro plan)
- **Upstash Redis** - Caching layer for GitHub API responses

## Getting Started

### Prerequisites

- Node.js 18+ and Bun 1.2.22+ installed
- PostgreSQL database running
- GitHub Personal Access Token (for GitHub API access)

### Installation

First, install the dependencies:

```bash
bun install
```

### Database Setup

This project uses PostgreSQL with Prisma.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/web/.env` file with your PostgreSQL connection details:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/top_github_repos"
GITHUB_API_TOKEN="your_github_personal_access_token"
UPSTASH_REDIS_URL="your_upstash_redis_url"  # Optional but recommended
UPSTASH_REDIS_TOKEN="your_upstash_redis_token"  # Optional but recommended
```

3. Generate the Prisma client and push the schema:

```bash
bun run db:push
```

### Run Development Server

Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see your fullstack application.

### Initial Data Sync

To populate the database with trending repositories:

```bash
bun run sync:repos
```

## Project Structure

```
top-github-repos/
├── apps/
│   └── web/                    # Fullstack application (React + TanStack Start)
│       ├── src/
│       │   ├── routes/          # Page routes (index, daily, weekly, etc.)
│       │   ├── components/      # React components
│       │   └── api/             # API routes (including cron jobs)
├── packages/
│   ├── api/                     # API layer / business logic
│   │   ├── src/
│   │   │   ├── routers/         # tRPC routers
│   │   │   ├── services/        # Business logic (GitHub API integration)
│   │   │   └── lib/             # Shared utilities (sync functions)
│   ├── auth/                    # Authentication configuration & logic
│   └── db/                      # Database schema & queries
│       └── prisma/schema/
└── vercel.json                  # Vercel deployment configuration
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run check-types`: Check TypeScript types across all apps
- `bun run db:push`: Push schema changes to database
- `bun run db:studio`: Open database studio UI
- `bun run db:generate`: Generate Prisma client
- `bun run sync:repos`: Manually sync trending repositories from GitHub API

## Deployment

This application is configured for deployment on Vercel with automatic cron jobs.

### Quick Deploy

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com/new)
3. Configure environment variables (see `DEPLOYMENT.md` for details)
4. Deploy!

The cron job will automatically sync repositories daily (Hobby plan) or every 6 hours (Pro plan).

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Environment Variables

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `GITHUB_API_TOKEN` - GitHub Personal Access Token

Optional environment variables:

- `UPSTASH_REDIS_URL` - Upstash Redis URL (for caching)
- `UPSTASH_REDIS_TOKEN` - Upstash Redis token
- `CRON_SECRET` - Secret for securing cron endpoint (production)
- `SITE_URL` - Site URL for SEO and canonical links

## Features Overview

- **Trending Repositories**: View trending repos by daily, weekly, monthly, or yearly time ranges
- **Search**: Search repositories by name or description
- **Language Filter**: Filter repositories by programming language
- **Pagination**: Navigate through pages of results (9 repos per page)
- **Topics Display**: View repository topics as badges
- **Auto Sync**: Automatic syncing via Vercel Cron daily (Hobby plan) or every 6 hours (Pro plan)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
