# Deployment Checklist

## Backend

- [ ] **Environment variables** — Set `JWT_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL`, `PORT`, `NODE_ENV=production`
- [ ] **Database** — Run `npx prisma migrate deploy` using production database URL
- [ ] **Build** — Run `npm run build` (compiles TypeScript to `dist/`)
- [ ] **Start** — Run `npm start` (uses: `node dist/index.js`)
- [ ] **Rate limiting** — Auth: 20 requests/15min, API: 200 requests/15min (disabled in test mode)
- [ ] **Security headers** — Helmet is enabled (CSP, X-Frame-Options, etc.)
- [ ] **CORS** — Currently allows all origins (`cors()`); restrict in production
- [ ] **Logging** — Morgan in `combined` format; ship logs to stdout for capture by container runtime/cloud logger
- [ ] **Graceful shutdown** — Not implemented; add `process.on('SIGTERM')` handler for production
- [ ] **Health check** — No `/health` endpoint; consider adding for load balancers

## Frontend

- [ ] **Environment variables** — Set `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] **Build** — Run `npm run build`
- [ ] **Start** — Run `npm start` (deploy the built output to Vercel, Netlify, or a Node server)
- [ ] **Static export** — App uses client-side API calls; server-side rendering may need special config

## CI/CD (GitHub Actions)

- [ ] **Secrets** — Add `JWT_SECRET` and `JWT_REFRESH_SECRET` to GitHub repository secrets (used for test env fallback)
- [ ] **Workflow** — `.github/workflows/ci.yml` runs on push/PR to `main`/`master`
- [ ] **PostgreSQL service** — CI uses Docker-based Postgres 16 for integration tests

## Security

- [ ] Rotate `JWT_SECRET` and `JWT_REFRESH_SECRET` before deploying to production
- [ ] Use strong, randomly generated secrets (e.g., `openssl rand -hex 64`)
- [ ] Restrict CORS to known origins (e.g., just the frontend domain)
- [ ] Review helmet configuration for production CSP policy
- [ ] Consider adding `hpp` (HTTP parameter pollution) protection

## Monitoring & Operations

- [ ] Add a `/health` endpoint returning `{ status: "ok", timestamp }`
- [ ] Add structured logging (e.g., Winston/Pino) for production log aggregation
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure database connection pooling (Prisma handles this; adjust `connection_limit` in `DATABASE_URL`)
