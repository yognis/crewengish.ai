# Email Redirect URL Fix - Diagnosis & Solution

## Root Cause Analysis

### Problem
Email confirmation links were using `http://0.0.0.0:3001/auth/callback` instead of `http://localhost:3001/auth/callback`, causing `ERR_ADDRESS_INVALID` errors.

### Why This Happened

1. **Missing Environment Variable**: `.env.local` file doesn't exist or `NEXT_PUBLIC_SITE_URL` wasn't set
2. **Next.js Build-Time Inlining**: `NEXT_PUBLIC_*` variables are inlined at build time, not runtime
   - If the variable isn't set when the dev server starts, it becomes `undefined` in the browser
   - Code falls back to `window.location.origin`, which was `http://0.0.0.0:3001`
3. **Missing Resend Option**: The "Resend Email" function in `VerifyEmailClient.tsx` wasn't passing `emailRedirectTo`, so Supabase used its default/dashboard configuration

### Solution Implemented

1. **Created Helper Function** (`src/lib/utils/get-base-url.ts`):
   - Checks `NEXT_PUBLIC_SITE_URL` first (if set at build time)
   - Falls back to `window.location.origin` but replaces `0.0.0.0` with `localhost`
   - Final fallback to `http://localhost:3001`

2. **Updated All Auth Flows**:
   - ✅ Signup (`src/app/auth/signup/page.tsx`)
   - ✅ Resend Email (`src/app/auth/verify-email/VerifyEmailClient.tsx`)
   - ✅ Forgot Password (`src/app/auth/forgot-password/page.tsx`)

3. **Added Debug Logging**: Console logs show the actual URL being sent to Supabase

## Verification Steps

### Step 1: Verify Environment Variable

Check if `.env.local` exists and has the correct value:

```bash
# Windows PowerShell
Get-Content .env.local | Select-String "NEXT_PUBLIC_SITE_URL"

# Or check if file exists
Test-Path .env.local
```

If `.env.local` doesn't exist, create it:

```bash
# Create from example
Copy-Item env.example .env.local

# Or manually create with:
# NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

### Step 2: Check Compiled Build

Look at what URL is actually in the compiled code:

```bash
# Search for emailRedirectTo in build output
# (After building or during dev)
Get-ChildItem -Recurse .next\**\*.js | Select-String "emailRedirectTo" | Select-Object -First 5
```

### Step 3: Test in Browser

1. **Start Dev Server** (if not running):
   ```bash
   npm run dev
   ```

2. **Open Browser Console** (F12 → Console tab)

3. **Attempt Signup**:
   - Go to `/auth/signup`
   - Fill out form and submit
   - Check console for: `[Signup] emailRedirectTo: ...`
   - Should see: `http://localhost:3001/auth/callback` (NOT `0.0.0.0`)

4. **Check Network Request**:
   - Open DevTools → Network tab
   - Filter by "signup" or "auth"
   - Find the POST request to Supabase
   - Inspect request payload → `options.emailRedirectTo`
   - Verify it shows `http://localhost:3001/auth/callback`

### Step 4: Test Resend Email

1. Go to `/auth/verify-email?email=test@example.com`
2. Click "Emaili Tekrar Gönder"
3. Check console for: `[Resend Email] emailRedirectTo: ...`
4. Should see: `http://localhost:3001/auth/callback`

### Step 5: Check Supabase Dashboard

Verify Supabase isn't overriding the redirect URL:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Check "Site URL" field
3. Should be: `http://localhost:3001` (or your production URL)
4. Check "Redirect URLs" allowlist
5. Should include: `http://localhost:3001/auth/callback`

### Step 6: Check Email Template (if custom)

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Check "Confirm signup" template
3. If custom template exists, verify it uses the redirect URL from the request, not hardcoded

## Testing Commands

### Quick Test Script

Create `test-redirect.js` in project root:

```javascript
// Test what URL would be generated
const baseUrl = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin.replace('0.0.0.0', 'localhost'))
  : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001');

console.log('Base URL:', baseUrl);
console.log('Callback URL:', `${baseUrl}/auth/callback`);
```

### PowerShell Verification

```powershell
# 1. Check if .env.local exists
if (Test-Path .env.local) {
    Write-Host "✓ .env.local exists"
    $content = Get-Content .env.local
    if ($content -match "NEXT_PUBLIC_SITE_URL") {
        Write-Host "✓ NEXT_PUBLIC_SITE_URL found"
        $content | Select-String "NEXT_PUBLIC_SITE_URL"
    } else {
        Write-Host "✗ NEXT_PUBLIC_SITE_URL NOT found in .env.local"
    }
} else {
    Write-Host "✗ .env.local does NOT exist"
    Write-Host "Create it with: NEXT_PUBLIC_SITE_URL=http://localhost:3001"
}

# 2. Check if dev server is running
$process = Get-Process | Where-Object { $_.ProcessName -like "*node*" }
if ($process) {
    Write-Host "✓ Node.js process detected (dev server might be running)"
} else {
    Write-Host "✗ No Node.js process found"
}

# 3. Check Next.js config
if (Test-Path next.config.js) {
    Write-Host "✓ next.config.js exists"
    $config = Get-Content next.config.js
    Write-Host "Config preview:"
    $config | Select-Object -First 5
}
```

## Expected Behavior After Fix

### Before Fix:
- ❌ Email link: `http://0.0.0.0:3001/auth/callback?token=...`
- ❌ Browser error: `ERR_ADDRESS_INVALID`
- ❌ Verification fails

### After Fix:
- ✅ Email link: `http://localhost:3001/auth/callback?token=...`
- ✅ Browser opens link successfully
- ✅ User redirected to dashboard after verification

## If Issue Persists

### 1. Clear Next.js Cache

```bash
# Delete .next folder
Remove-Item -Recurse -Force .next

# Restart dev server
npm run dev
```

### 2. Check Supabase API Settings

Use this curl command (replace `SERVICE_ROLE_KEY` with your actual key):

```bash
curl -H "apikey: YOUR_SERVICE_ROLE_KEY" \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
     https://mqqhelwptynzjuxdrlaq.supabase.co/auth/v1/settings
```

Check for:
- `site_url`: Should be `http://localhost:3001` (or your production URL)
- `redirect_urls`: Should include your callback URL

### 3. Verify Network Request

In Browser DevTools → Network:
1. Filter by "auth" or "signup"
2. Find POST to `supabase.co/auth/v1/signup`
3. Click on request → Payload tab
4. Check `options.emailRedirectTo` value
5. If it shows `0.0.0.0`, the code fix didn't work
6. If it shows `localhost:3001`, but emails still have `0.0.0.0`, Supabase dashboard config might be overriding

### 4. Check Middleware

Verify `src/middleware.ts` isn't rewriting URLs:
- Check for any URL manipulation
- Ensure it's not modifying request headers

### 5. Check for Service Workers

1. DevTools → Application → Service Workers
2. Unregister any service workers
3. Hard refresh (Ctrl+Shift+R)

## Additional Notes

### Why 0.0.0.0 Appears

- `0.0.0.0` is often used as a bind address for dev servers
- Allows access from network devices (mobile phones, tablets)
- But browsers can't navigate to `0.0.0.0` URLs (it's not a valid web address)
- The fix replaces `0.0.0.0` with `localhost` which browsers can navigate to

### Environment Variable Priority

Next.js environment variables priority:
1. `.env.local` (always loaded, except in test)
2. `.env.development` / `.env.production`
3. `.env`

`NEXT_PUBLIC_*` variables:
- Inlined at **build time** (not runtime)
- Must restart dev server after adding/changing
- Available in both client and server code

## Summary

**Root Cause**: Missing `NEXT_PUBLIC_SITE_URL` caused fallback to `window.location.origin` which was `http://0.0.0.0:3001`.

**Fix**: Created helper function that:
1. Checks env variable first
2. Replaces `0.0.0.0` with `localhost` in fallback
3. Applied to all auth redirect locations

**Next Steps**:
1. Create `.env.local` with `NEXT_PUBLIC_SITE_URL=http://localhost:3001`
2. Restart dev server
3. Test signup and verify console logs show `localhost:3001`
4. Check email link in actual email (should be `localhost`, not `0.0.0.0`)

