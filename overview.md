# CrewEnglish.ai – Project Overview

This document summarizes the current state of the CrewEnglish.ai codebase, explains how the major pieces fit together, details external dependencies, and captures security concerns and recommended next steps for anyone taking ownership of the project.

---

## 1. Product & Architecture Snapshot
- **Stack**: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind. Client state is managed with Zustand (`src/lib/store.ts`).  
- **Backend**: Supabase (Auth + Postgres + Storage) accessed from server components/route handlers (`src/lib/supabase/server.ts`) and client components (`src/lib/supabase/client.ts`).  
- **AI Services**: OpenAI Whisper and GPT‑4o power speech transcription and speaking evaluation (`src/app/api/transcribe/route.ts`, `src/app/api/evaluate/route.ts`).  
- **Key flows**: Auth (signup/login/reset/verify), dashboard, and a credit‑based speaking exam workflow (`src/app/exam/*`).  
- **Recent fix**: A shared helper (`src/lib/utils/get-base-url.ts`) normalizes callback URLs so Supabase emails use `localhost` instead of `0.0.0.0`. All auth flows now consume this helper (`src/app/auth/signup/page.tsx`, `src/app/auth/verify-email/VerifyEmailClient.tsx`, `src/app/auth/callback/route.ts`, `src/middleware.ts`).

---

## 2. Runtime Architecture

### Next.js App Router
- `src/app/layout.tsx` & `src/app/page.tsx`: global layout and marketing landing page.  
- Nested routes under `src/app/auth/` cover login, signup, OTP verification, password reset, and the email verification holding screen. Each page is a client component that talks directly to Supabase via the browser SDK.  
- `src/app/dashboard/*` provides authenticated views (profile, history, etc.). Access is gated by middleware (`src/middleware.ts`) which checks the Supabase session and redirects accordingly.  
- `src/app/exam/*` implements the speaking-exam journey: `/start` prepares prerequisites, `/[sessionId]` runs the live exam, `/[sessionId]/results` shows scoring. Components use Zustand (`useAppStore`) to load the Supabase profile and credit balance before letting a user continue.

### API Layer (Next.js Route Handlers)
- `src/app/api/profiles/route.ts`: Called post-signup to upsert profile rows. Uses the Supabase **service role key** via `supabaseAdmin`.  
- `src/app/api/transcribe/route.ts`: Receives audio form-data, enforces a per-user/IP rate limit (`src/lib/rate-limit.ts`), then streams the blob to OpenAI Whisper.  
- `src/app/api/evaluate/route.ts`: Validates question + transcript payloads, rate limits requests, calls GPT‑4o for scoring, and returns structured results.  
- Both API endpoints rely on `createClient()` (server variant) so Supabase sessions can be resolved during SSR/edge execution.

### Data & Business Logic
- `src/lib/database.types.ts`: typed Supabase schema generated via `supabase gen types`.  
- `database.sql`: canonical schema (profiles, test/exam sessions/responses, credit_transactions) with RLS policies, triggers, and helper functions (auto-profile creation, credit deduction, storage bucket policies).  
- `src/app/api/exam/start/route.ts` & `src/app/api/exam/process/route.ts`: server-side orchestration for question generation and scoring (replaces the old `src/lib/exam-queries.ts`).  
- `src/hooks/useDashboardData.ts`, `src/hooks/useTotalUsers.ts`: encapsulate dashboard queries + subscriptions.  
- `src/constants/exam.ts`: centralizes limits for recordings, rate limiting, etc., reused across the front-end and API layer.

### Auth Flow (Email Verification Fix)
- `getBaseUrl()` + `getServerBaseUrl()` ensure every redirect and callback swaps `0.0.0.0` for `localhost` and prefers `NEXT_PUBLIC_SITE_URL` if provided.  
- Signup uses `supabase.auth.signUp` with `emailRedirectTo` from `getAuthCallbackUrl()` (`src/app/auth/signup/page.tsx`).  
- Resend verification emails reuse the same helper (`src/app/auth/verify-email/VerifyEmailClient.tsx`).  
- The callback handler exchanges the code for a session and redirects using the normalized base URL (`src/app/auth/callback/route.ts`).  
- Middleware also derives redirects from `getServerBaseUrl()` so authenticated/unauthenticated routing never produces `0.0.0.0`.

---

## 3. Third-Party Integrations

| Service | Purpose | Implementation | Required Env Vars | Notes & Risks |
| --- | --- | --- | --- | --- |
| **Supabase** | Auth (GoTrue), Postgres, Storage, Realtime | Client SDK (`src/lib/supabase/client.ts`) for browser, server SDK (`src/lib/supabase/server.ts`) for SSR, admin client with service role (`src/lib/supabase-admin.ts`). Database schema & RLS defined in `database.sql`. | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, optional `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`. | Service role key lives in `.env.local` and is used in API routes—must never reach the client. RLS currently allows inserts only via service role. Heavy vendor-lock: moving away would require reimplementing Auth + Postgres functions. |
| **OpenAI** | Whisper for audio transcription and GPT‑4o for scoring | `src/app/api/transcribe/route.ts`, `src/app/api/evaluate/route.ts` instantiate `new OpenAI({ apiKey: env.OPENAI_API_KEY })`. | `OPENAI_API_KEY` | Requests happen server-side (no browser exposure). Consider quotas, latency, and cost. |
| **React Hot Toast, Framer Motion, Lucide, Recharts** | UI feedback, animation, icons, data viz | Used widely across components (e.g., `src/app/auth/signup/page.tsx`, `src/components/dashboard/*`). | none | UI-only dependencies; keep updated for security patches. |
| **Deepgram (scaffolded)** | Placeholder API key is present in `.env.local` but no code paths use it yet. | N/A | `DEEPGRAM_API_KEY` (optional placeholder) | Remove unused secret to avoid confusion. |

---

## 4. Security & Vulnerability Audit

### Critical
- **Secrets committed to the repo**: `.env.local` under version control contains live Supabase anon + service role keys and an OpenAI key (see `git status`). Treat them as compromised. Rotate immediately, delete the file from git, add `.env.local` to `.gitignore`, and recreate keys in Supabase/OpenAI.
- **Service role usage**: API handlers (`src/app/api/profiles/route.ts`) rely on the unrestricted service key. Confirm that the handler never runs in the browser (it currently does not), and consider removing the service key completely by adding a Supabase RPC or policy allowing inserts when `auth.uid() = id`.  

### High
- **Rate limiting**: `src/lib/rate-limit.ts` stores counters in an in-memory map. In multi-instance deployments (e.g., Vercel), this resets per instance and allows bypass. Move to a shared store (Redis/Upstash) or Supabase edge rate limiting before scaling traffic.  
- **Logging PII**: Auth flows log emails, profile data, and Supabase errors to the console (e.g., `src/app/auth/signup/page.tsx`). Remove or guard logs behind `NODE_ENV === 'development'` to avoid leaking sensitive data in production.  
- **Outdated dependencies**: `next@^14.0.0` is several releases behind; update to the latest 14.x LTS for security patches (notably for SWC/webpack CVEs). Audit other packages via `npm audit` before deployment.

### Medium
- **Password reset session check** (`src/app/auth/reset-password/page.tsx`): relies on the client having an active OTP session. Ensure Supabase settings enforce OTP expiry and consider verifying the token on the server instead of trusting client state.  
- **Email resend throttling**: Resend endpoint uses the same in-memory rate limiter; add UX feedback and server-side cooldown to prevent abuse.  
- **Storage bucket policy**: `database.sql` creates a public bucket but the insert policy trusts folder structure. Confirm the client always uploads to paths starting with the user UUID, or enforce it inside the upload code.

### Low / Hygiene
- Remove unused secrets (`DEEPGRAM_API_KEY`), docs with embedded keys, and command outputs containing ANSI mojibake.  
- Add automated lint/test/security checks (GitHub Actions + `npm audit`, `npm run lint`, `npm run test`).  
- Document Supabase configuration (site URL, redirect URLs) in version-controlled docs—`EMAIL_REDIRECT_FIX.md` already covers the recent issue.

---

## 5. Developer Onboarding & Setup

1. **Prerequisites**: Node.js 18+, npm, Supabase CLI (optional), access to Supabase project & OpenAI account.  
2. **Clone & Install**: `npm install`.  
3. **Environment variables**: Copy `env.example` to `.env.local` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase → Project Settings → API).  
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; avoid committing).  
   - `OPENAI_API_KEY`.  
   - `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_APP_URL` (use `http://localhost:3001` for development).  
   - Remove unused entries like `DEEPGRAM_API_KEY` unless you plan to integrate it.  
4. **Supabase database**: In the Supabase Dashboard SQL editor, run `database.sql`. Run supplemental migration scripts in `/supabase/migrations` if needed.  
5. **Supabase auth config**: Under Authentication → URL Configuration, set `Site URL` and redirect patterns (`http://localhost:3001/**`, plus LAN IPs if testing on mobile).  
6. **Run locally**: `npm run dev` (listens on port 3001 via `next dev -H 0.0.0.0 -p 3001`).  
7. **Testing**: `npm run test` (Vitest)—currently minimal coverage; expect to invest in additional tests.  
8. **Common pitfalls**:
   - Forgetting to restart the dev server after changing env vars (Next.js inlines them at build/start time).  
   - Supabase service role key missing/invalid (causes profile creation failures).  
   - Email verification links breaking if the Site URL is not kept in sync across environments—use `get-base-url` helpers everywhere.

---

## 6. Deployment & Infrastructure

- **Hosting**: The project targets Vercel (see README). Deploy by connecting the GitHub repo, configuring environment variables in Vercel (matching `.env.local` but without secrets committed), and letting Vercel run `npm install && npm run build`.  
- **Supabase**: Managed service—ensure production project has matching schema/migrations and distinct API keys.  
- **Build outputs**: Next.js App Router defaults (server components, route handlers). `next.config.js` currently only tweaks page extensions and adds `allowedDevOrigins` for LAN testing; review before production.  
- **Scheduled/Background jobs**: None currently. Exam data and scoring happen synchronously via API routes.  
- **Observability**: No built-in metrics/log streaming. Add Vercel/Supabase logging and consider Sentry or similar before GA.  
- **CI/CD**: No pipeline configured. Recommend adding GitHub Actions for lint, typecheck, tests, and dependency audits.

---

## 7. Priority Next Steps

### Must Do Immediately
1. **Rotate and revoke all leaked secrets**, remove `.env.local` from git, and enforce secrets management (e.g., using Vercel envs and `.env.local` in `.gitignore`).  
2. **Sanitize logging** in auth and API flows to avoid leaking emails or token errors.  
3. **Harden Supabase policies** so profile creation and updates can happen without needing the service role key, or move the logic into a Supabase Function with limited scope.

### Short Term (next 1–2 sprints)
1. Replace the in-memory rate limiter with a shared store or Supabase edge function.  
2. Add automated tests covering signup/login, profile creation, and the exam flow (Vitest + Playwright).  
3. Update dependencies (`npm outdated`) and lock to latest stable patches for Next.js, Supabase SDK, OpenAI SDK.

### Mid Term
1. Instrument monitoring & error tracking (Sentry/Logflare) for API routes and exam flows.  
2. Build a migration checklist for Supabase (SQL migrations, auth settings) and automate applying them in CI/CD.  
3. Revisit credit deduction & exam session handling—move trust-critical logic to server functions to avoid client tampering.

### Long Term
1. Abstract away vendor lock (e.g., define interfaces around Supabase-specific features) if multi-cloud portability becomes a goal.  
2. Consider queuing/offloading AI requests if volumes grow (to manage cost + latency).  
3. Expand security posture: penetration testing, secret scanning, automated dependency updates, and review of storage/file retention policies.

---

With the above actions, a new maintainer should be able to operate, secure, and evolve CrewEnglish.ai confidently. Reach out if deeper dives into specific modules or migrations are needed.
