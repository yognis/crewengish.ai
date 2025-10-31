# Production Configuration Verification & Fix

## Current Status
✅ Supabase Redirect URLs added (I can see them in your screenshot)
❌ Still getting localhost:3001 in emails from production

## What We Need to Check

### 1. Supabase Site URL (CRITICAL)

**Location:** Supabase Dashboard → Authentication → URL Configuration

**Scroll up in that same page** - at the TOP there should be a field called **"Site URL"**

**What it currently shows:**
- If it says: `http://localhost:3001` or `http://192.168.1.5:3001` → **WRONG** ❌
- Should say: `https://crewengish-ai.vercel.app` → **CORRECT** ✅

**To fix:**
1. Click the Site URL field
2. Change it to: `https://crewengish-ai.vercel.app`
3. Click **Save**

---

### 2. Vercel Environment Variables

**How to check:**

#### Method 1: Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Select project: `crewengish-ai`
3. **Settings** → **Environment Variables**
4. Look for: `NEXT_PUBLIC_SITE_URL`

**What you should see:**
- If variable exists with value `https://crewengish-ai.vercel.app` → ✅ Good
- If variable is missing or shows `localhost:3001` → ❌ Need to fix

**To fix if missing:**
1. Click **Add New**
2. **Key:** `NEXT_PUBLIC_SITE_URL`
3. **Value:** `https://crewengish-ai.vercel.app`
4. Check: ✅ **Production** (also check Preview if you want)
5. Click **Save**
6. **IMPORTANT:** After saving, you MUST redeploy!

#### Method 2: Quick Browser Test
1. Visit: `https://crewengish-ai.vercel.app`
2. Open browser console (F12)
3. Type:
```javascript
console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);
```
4. Check output:
   - Shows `https://crewengish-ai.vercel.app` → ✅ Good
   - Shows `undefined` → ❌ Variable not set in Vercel
   - Shows `http://localhost:3001` → ❌ Wrong value set

---

## Step-by-Step Fix Process

### Step 1: Fix Supabase Site URL
```
1. Supabase Dashboard
2. Authentication → URL Configuration
3. Scroll to top
4. Find "Site URL" field
5. Change to: https://crewengish-ai.vercel.app
6. Save
```

### Step 2: Fix Vercel Environment Variable
```
1. Vercel Dashboard
2. Project Settings → Environment Variables
3. Add: NEXT_PUBLIC_SITE_URL = https://crewengish-ai.vercel.app
4. Environment: Production ✓
5. Save
```

### Step 3: Redeploy
```
Option A: Via Dashboard
- Vercel → Deployments → Latest → "..." → Redeploy

Option B: Via Git
git commit --allow-empty -m "Redeploy with production env vars"
git push origin main
```

### Step 4: Wait & Test
```
1. Wait for deployment (2-3 minutes)
2. Go to: https://crewengish-ai.vercel.app/auth/signup
3. Sign up with NEW email (e.g., test-prod@gmail.com)
4. Check email
5. Verify link shows: https://crewengish-ai.vercel.app/auth/callback
6. Click link from Samsung
7. Should work! ✅
```

---

## Quick Diagnostic

### Test 1: Check Current Build
Visit production site and run in console:
```javascript
console.log('Site URL:', process.env.NEXT_PUBLIC_SITE_URL);
console.log('Window origin:', window.location.origin);
```

**Expected output:**
```
Site URL: https://crewengish-ai.vercel.app
Window origin: https://crewengish-ai.vercel.app
```

### Test 2: Check What Gets Sent to Supabase
After you add the env var and redeploy:
1. Go to signup page
2. Open Network tab (F12 → Network)
3. Sign up
4. Find POST request to Supabase
5. Check payload → `options.emailRedirectTo`
6. Should show: `https://crewengish-ai.vercel.app/auth/callback`

---

## Most Likely Issue

**Supabase Site URL** is probably still set to `localhost:3001`.

Even though our code sends the correct `emailRedirectTo`, Supabase might be overriding it with the Site URL from its dashboard settings.

**The fix:**
Change Supabase Site URL to production URL, then test again.

---

## After You Fix It

Let me know what you find:
1. What does Supabase Site URL currently show?
2. Does Vercel have NEXT_PUBLIC_SITE_URL environment variable?
3. After fixing and redeploying, does the email link work from Samsung?

