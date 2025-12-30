# Pastebin Lite

A modern pastebin application built with Next.js, TypeScript, and Supabase, deployable on Vercel.

## Features

- Create text pastes with optional expiry (TTL) and maximum view limits
- Shareable URLs for each paste
- Automatic expiry when TTL or view limit is reached
- Safe HTML rendering (no script execution)
- RESTful API endpoints
- Persistent storage using Supabase Postgres
- Production-ready with atomic view counting

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Database**: Supabase (Postgres)
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## API Endpoints

### GET /api/healthz
Health check endpoint that confirms database connectivity.

**Response:**
```json
{
  "ok": true
}
```

### POST /api/pastes
Create a new paste.

**Request Body:**
```json
{
  "content": "Your text content here",
  "ttl": 3600,         // Optional: Time to live in seconds
  "max_views": 10      // Optional: Maximum number of views
}
```

**Response:**
```json
{
  "id": "abc123xyz",
  "url": "https://your-domain.com/p/abc123xyz"
}
```

### GET /api/pastes/:id
Get a paste by ID. This endpoint increments the view count atomically.

**Response:**
```json
{
  "content": "Your text content here",
  "remaining_views": 9,
  "expires_at": "2024-01-01T12:00:00Z"
}
```

**Error Response (404):**
```json
{
  "error": "Paste not found"
}
```

### GET /p/:id
View a paste in the browser. Returns a formatted HTML page with the paste content.

## Database Schema

### pastes table
- `id` (text, primary key) - Unique identifier
- `content` (text) - The paste content
- `max_views` (integer, nullable) - Maximum number of views
- `view_count` (integer) - Current view count
- `expires_at` (timestamptz, nullable) - Expiration timestamp
- `created_at` (timestamptz) - Creation timestamp

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
TEST_MODE=0
```

## Deployment

### Vercel Deployment

1. Push your code to a Git repository
2. Import the project in Vercel
3. Set the environment variables in Vercel project settings
4. Deploy

### Environment Variables in Vercel

Set the following environment variables in your Vercel project:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_BASE_URL` (optional, will auto-detect if not set)
- `TEST_MODE` (set to `1` only for testing with deterministic time)

## Test Mode

When `TEST_MODE=1`, the application supports deterministic time for testing expiry logic:
- Include the `x-test-now-ms` header with a Unix timestamp in milliseconds
- The application will use this timestamp instead of the current time for expiry calculations

Example:
```bash
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -H "x-test-now-ms: 1704110400000" \
  -d '{"content":"Test","ttl":60}'
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see `.env.example`)

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Security

- Row Level Security (RLS) is enabled on the database
- HTML content is escaped to prevent XSS attacks
- No inline script execution on paste view pages
- Atomic view counting prevents race conditions
