# Production Deployment Fix - Email Links Show localhost

## Problem
Production site emails contain `http://localhost:3001` links instead of `https://crewengish-ai.vercel.app`.

## Root Causes
1. `NEXT_PUBLIC_SITE_URL` not set in Vercel production environment
2. Supabase Site URL points to localhost

## Fix Instructions

### Step 1: Add Environment Variable in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project: `crewengish-ai`
3. Go to: **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `NEXT_PUBLIC_SITE_URL`
   - **Value:** `https://crewengish-ai.vercel.app`
   - **Environment:** Check **Production** (and optionally Preview)
5. Click **Save**

### Step 2: Update Supabase Site URL

1. Go to: https://supabase.com/dashboard/project/mqqhelwptynzjuxdrlaq
2. Navigate to: **Authentication** → **URL Configuration**
3. Update **Site URL:**
   - Change from: `http://localhost:3001` or whatever it shows
   - Change to: `https://crewengish-ai.vercel.app`
4. Click **Save**

### Step 3: Add Redirect URLs to Supabase Allowlist

In the same Supabase **URL Configuration** page:

**Redirect URLs** - Add these (one per line):
```
https://crewengish-ai.vercel.app/**
https://crewengish-ai.vercel.app/auth/callback
http://localhost:3001/**
http://localhost:3001/auth/callback
```

This allows both production and local development.

### Step 4: Redeploy Vercel

After adding environment variables, you must redeploy:

**Option A: Trigger New Deployment**
1. In Vercel Dashboard → **Deployments**
2. Click the `...` menu on latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes

**Option B: Push Any Small Change**
```bash
# Make a small change and push
git commit --allow-empty -m "Trigger redeploy for env vars"
git push origin main
```

### Step 5: Test Production

1. **From Samsung phone**, go to: `https://crewengish-ai.vercel.app`
2. Sign up with a **NEW email** (not previously used)
3. Check email
4. **Before clicking**, check the link URL:
   - ✅ Should be: `https://crewengish-ai.vercel.app/auth/callback?token=...`
   - ❌ Should NOT be: `http://localhost:3001/...`
5. Click the link
6. Should successfully verify and redirect to dashboard

---

## Verification Checklist

### Before Fix:
- [ ] Vercel has `NEXT_PUBLIC_SITE_URL` environment variable
- [ ] Supabase Site URL is set to production URL
- [ ] Supabase Redirect URLs include production URL

### After Fix:
- [ ] New signup from production site
- [ ] Email link shows production URL (not localhost)
- [ ] Clicking email link works from Samsung phone
- [ ] Successfully redirects to dashboard

---

## Quick Debug Commands

### Check what Vercel is using:
1. Visit: `https://crewengish-ai.vercel.app`
2. Open browser console (F12)
3. Type:
```javascript
console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);
```
4. Check what it shows (might be `undefined` or `localhost:3001`)

### After fixing, it should show:
```javascript
NEXT_PUBLIC_SITE_URL: "https://crewengish-ai.vercel.app"
```

---

## Important Notes

### Environment Variables in Vercel
- `NEXT_PUBLIC_*` variables are **build-time** variables
- Changing them requires **redeployment** (not just save)
- They get inlined into the JavaScript bundle

### Supabase Site URL
- This is what Supabase uses as the default redirect
- If not overridden in code, emails use this URL
- Our code DOES override it with `emailRedirectTo`
- But `emailRedirectTo` uses `NEXT_PUBLIC_SITE_URL`
- So if that's missing → falls back to localhost

---

## Expected Result

After fixing both:
1. Vercel builds with production URL
2. Signup sends: `emailRedirectTo: https://crewengish-ai.vercel.app/auth/callback`
3. Supabase generates email with production link
4. Samsung phone can click and verify successfully

---

**Next:** Fix Vercel env vars → Update Supabase config → Redeploy → Test

