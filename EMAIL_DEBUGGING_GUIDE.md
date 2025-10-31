# Email Not Sending - Debugging Guide

## Current Problem
No confirmation emails are being received, even after multiple "Resend Email" attempts.

## Immediate Debugging Steps

### Step 1: Check Browser Console

1. Open Browser DevTools (F12)
2. Go to Console tab
3. Click "Emaili Tekrar Gönder" button
4. Look for logs starting with `[Resend Email]` or `[Signup]`

**What to look for:**
- `[Resend Email] Starting resend...` - Confirms function is called
- `[Resend Email] Email:` - Shows email address being used
- `[Resend Email] emailRedirectTo:` - Shows redirect URL
- `[Resend Email] Response data:` - Shows what Supabase returned
- `[Resend Email] Error details:` - Shows any errors

### Step 2: Check Network Tab

1. DevTools → Network tab
2. Filter by "resend" or "auth"
3. Find the POST request to Supabase
4. Check:
   - **Request URL**: Should be to your Supabase project
   - **Status Code**: 
     - `200` = Success (email should be sent)
     - `400` = Bad request (check error message)
     - `429` = Rate limit exceeded
     - `500` = Server error
   - **Response**: Check for error messages

### Step 3: Check Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: `mqqhelwptynzjuxdrlaq`
3. Navigate to **Authentication** → **Logs**
4. Look for:
   - Signup attempts
   - Email send attempts
   - Any error messages

### Step 4: Common Issues & Solutions

#### Issue 1: Rate Limiting
**Symptom**: Error message contains "rate limit" or "too many"
**Solution**: Wait 5-10 minutes before trying again

#### Issue 2: User Already Exists
**Symptom**: Error message says "user already registered" or "already exists"
**Solution**: 
- Try logging in instead
- Or check if email was already verified

#### Issue 3: Email Configuration
**Symptom**: Success response but no email received
**Solution**: Check Supabase Email Settings:
1. Go to **Authentication** → **Email Templates**
2. Verify "Confirm signup" template exists
3. Check if custom SMTP is configured (Settings → Auth → SMTP)

#### Issue 4: Email in Spam
**Symptom**: No errors but no email
**Solution**: 
- Check spam/junk folder
- Check Gmail "Promotions" tab
- Add `noreply@mqqhelwptynzjuxdrlaq.supabase.co` to contacts

#### Issue 5: Email Domain Blocked
**Symptom**: Error about email domain
**Solution**: 
- Some email providers block Supabase emails
- Try a different email address (Gmail usually works)
- Check if your email provider has security filters

### Step 5: Verify Supabase Email Settings

Check your Supabase project settings:

```bash
# Using curl (replace SERVICE_ROLE_KEY)
curl -H "apikey: YOUR_SERVICE_ROLE_KEY" \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
     https://mqqhelwptynzjuxdrlaq.supabase.co/auth/v1/settings
```

Or manually check:
1. Supabase Dashboard → Settings → Auth
2. Verify:
   - **Site URL**: Should be set (can be `http://localhost:3001` for dev)
   - **Redirect URLs**: Should include `http://localhost:3001/auth/callback`
   - **Email Auth**: Enabled
   - **Confirm email**: Enabled (for signup emails)

### Step 6: Test with Different Email

Try signing up with a different email address:
- Use Gmail (usually most reliable with Supabase)
- Avoid corporate emails that might have filters
- Try a completely different domain

### Step 7: Check Supabase Email Quotas

Free tier Supabase has email limits:
- Check your usage in Dashboard → Settings → Usage
- Free tier: 4 emails/hour per user
- If limit reached, wait 1 hour

## What the Console Logs Should Show

### Successful Resend:
```
[Resend Email] Starting resend...
[Resend Email] Email: user@example.com
[Resend Email] emailRedirectTo: http://localhost:3001/auth/callback
[Resend Email] Supabase URL: https://mqqhelwptynzjuxdrlaq.supabase.co
[Resend Email] Response data: { message: "Email sent successfully" }
[Resend Email] Success! Email should be sent.
```

### Error Example:
```
[Resend Email] Error details: {
  message: "Email rate limit exceeded",
  status: 429,
  name: "AuthError"
}
```

## Next Steps After Debugging

1. **Share console logs** - Copy all `[Resend Email]` logs
2. **Share network request** - Screenshot of Network tab showing the request/response
3. **Check Supabase logs** - Look for any errors in Dashboard → Authentication → Logs

## Quick Test Command

You can test Supabase email sending directly via API:

```powershell
# Replace YOUR_SERVICE_ROLE_KEY and email
$headers = @{
    "apikey" = "YOUR_SERVICE_ROLE_KEY"
    "Authorization" = "Bearer YOUR_SERVICE_ROLE_KEY"
    "Content-Type" = "application/json"
}

$body = @{
    email = "test@example.com"
    type = "signup"
    options = @{
        emailRedirectTo = "http://localhost:3001/auth/callback"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://mqqhelwptynzjuxdrlaq.supabase.co/auth/v1/resend" -Method Post -Headers $headers -Body $body
```

## Most Likely Causes (In Order)

1. **Rate Limiting** - Too many requests (wait 10 minutes)
2. **Email in Spam** - Check spam folder first
3. **User Already Exists** - Account already created (try login)
4. **Supabase Email Configuration** - Check dashboard settings
5. **Email Provider Blocking** - Try different email address

