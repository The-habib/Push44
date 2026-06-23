---
name: Base44 Google Login
description: Base44 email/password login fails for Google-linked accounts; error detection and guided UX fix implemented in settings.tsx
---

## The Rule

Base44's `/api/auth/login` endpoint returns `400 "Invalid email or password"` for accounts created via Google OAuth — not because the password is wrong, but because no password exists for them. Email/password login is only for accounts created directly with email + password.

**Why:** Base44 uses separate auth paths for Google vs email/password. A user who signed up with Google will always get this 400 error from Base44's own server regardless of what password they try.

**How to apply:** When this error fires, never tell the user their credentials are wrong without also explaining the Google account path. The fix is to use the Base44 API token instead.

## Where the Fix Lives

`src/routes/settings.tsx` — `Base44Modal` component:

1. **Email & Password tab** — a note above the form reads "Only works for email/password accounts. Signed up with Google? Use Auth Token →" — clicking it switches tab and clears the error.

2. **Error box** — when `error.toLowerCase().includes("invalid email or password")`, the red error card expands with: "Signed up with Google? Email & Password login won't work — use your API token instead." plus a "Switch to Auth Token →" button.

3. **Auth Token tab** — instructions link to `https://app.base44.com/settings/account` under "API Key".

## Getting the API Token (for Google users)

1. Go to `https://app.base44.com/settings/account`
2. Copy the **API Key** field
3. Paste into Push44 Settings → Connect Base44 → Auth Token tab
