# Loupe: a photo sharing website

Next.js 15 (App Router) + PostgreSQL. Sign up / log in, upload photos, like, follow.

## Run it locally

You need **Node.js 20+** and **Docker Desktop** (running).

```bash
npm install            # install dependencies
cp .env.example .env   # database connection string (Windows: copy .env.example .env)
npm run db:up          # start Postgres in Docker (creates the tables on first start)
npm run db:migrate     # apply db/schema.sql (safe to re-run)
npm run db:seed        # optional: demo users alice / bob, password: password123
npm run dev            # open http://localhost:3000
```

Stop the database with `docker compose down`. Add `-v` to also delete its data.

**Port 5432 already in use?** You have another Postgres running. Change `"5432:5432"` to `"5433:5432"` in
`docker-compose.yml` and use `localhost:5433` in `.env`.

## How it's built

```
app/
  layout.tsx            header + nav; reads the logged-in user
  page.tsx              feed (Everyone / Following)
  explore/              grid, most liked first
  u/[username]/         profile: posts, followers, following
  p/[id]/               one post
  login/ signup/        auth forms (server actions)
  new/                  upload form -> POST /api/posts
  api/posts/            saves the file to ./uploads and inserts a row
  api/images/[file]/    serves uploaded photos
  lib/
    db.ts               pg connection pool + sql() helper
    auth.ts             sessions: random token in an httpOnly cookie, row in `sessions`
    actions.ts          signup, login, logout, toggleLike, toggleFollow, deletePost
    queries.ts          feed query (like counts, "liked by me")
db/schema.sql           tables: users, sessions, posts, likes, follows
```

Design notes:

- **Passwords** are hashed with bcrypt and never stored in plain text.
- **Sessions** are rows in the database. Logging out deletes the row, so the cookie stops working right away.
- **Likes and follows** use composite primary keys (`(user_id, post_id)`, `(follower_id, following_id)`), so the
  database itself makes a double-like or double-follow impossible.
- **Every query is parameterized** (`$1, $2`), which prevents SQL injection.
- **Photos** are saved to `./uploads`. In production you'd put them in S3 or Cloudinary and store the URL.

## Ideas to extend it

Comments, a user search box, pagination (infinite scroll), image resizing with `sharp`, or deploying to Vercel + Neon.
