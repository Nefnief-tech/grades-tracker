# FAQ & Troubleshooting

---

## General

### Q: Do I need to create an account?

**No.** Grade Tracker works entirely in **local-only mode** without an account. All data is stored in your browser's `localStorage`. An account is only needed if you want to sync across multiple devices.

---

### Q: What happens to my data if I clear browser storage?

If you are in local-only mode, clearing `localStorage` will permanently delete all your grades and subjects. To prevent data loss:

- Enable cloud sync by creating an account (data is backed up to Appwrite).
- Export your data as CSV before clearing storage (**Analytics → Export CSV**).

---

### Q: Is my data private?

Yes. When cloud sync is enabled, all data is encrypted client-side with AES-256-CBC **before** being sent to Appwrite. The Appwrite server (and anyone with database access) sees only encrypted blobs, not your actual grades.

---

### Q: What grade scale does the app use?

The default scale is **1 (best) to 6 (worst)**, consistent with the Swiss and German grading systems. You can enter any numeric value; the app does not enforce a maximum.

---

## Installation Issues

### "Module not found: Can't resolve 'swr'"

The SWR package is missing. Install it:

```bash
pnpm add swr
```

---

### "Cannot find module 'appwrite'"

The Appwrite SDK is not installed. Run:

```bash
pnpm install
```

If the issue persists:

```bash
pnpm add appwrite
```

---

### Dev server won't start on port 3000

Another process may be using port 3000. Kill it or start on a different port:

```bash
pnpm dev -- --port 3001
```

---

## Authentication Issues

### "Invalid credentials" on login

- Double-check your email and password.
- Passwords are case-sensitive.
- If you registered with Google/GitHub OAuth (not email/password), use the correct login method.

---

### "Session expired" / auto-logout

Appwrite sessions have a configurable expiry. You can extend it in the Appwrite console under **Auth → Security → Session length**.

---

### "Invalid TOTP code" during 2FA login

1. Ensure your device clock is correct (TOTP is time-based, ±30 s window).
2. Wait for the current code to expire and use the *next* one.
3. If still failing, use one of your backup codes.
4. If you have lost all backup codes, contact your Appwrite project admin to disable 2FA on your account.

---

## Cloud Sync Issues

### Grades not syncing to other devices

1. Verify `NEXT_PUBLIC_APPWRITE_ENDPOINT` and `NEXT_PUBLIC_APPWRITE_PROJECT_ID` are set correctly.
2. Check that you are logged in on both devices.
3. Go to **Settings → Account → Sync now**.
4. Open browser DevTools → Network tab for failed requests.

---

### "Appwrite connection refused" in Docker

Your container cannot reach the Appwrite endpoint. Check:

1. The `NEXT_PUBLIC_APPWRITE_ENDPOINT` URL is reachable from within the container (use the host's IP, not `localhost`).
2. Firewall rules allow outbound HTTPS.
3. The Web platform in Appwrite includes your container's hostname.

---

### Self-hosted Appwrite: CORS errors

In the Appwrite console, add your app's origin (e.g., `http://localhost:3000` or `https://yourdomain.com`) as a **Web platform** under your project settings.

---

## Build Issues

### TypeScript errors during `pnpm build`

Run `pnpm lint` to identify issues. Common causes:

- Missing type imports — add `import type { … }`.
- Using `any` in strict mode — use a proper type or `unknown`.
- Missing `await` on async calls.

---

### Docker build fails with "ENOMEM" or slow performance

Increase Docker's memory limit in Docker Desktop settings (recommended ≥ 4 GB for a Next.js build).

---

## Performance

### Dashboard loads slowly on first visit

The first load fetches subjects from Appwrite. Subsequent loads use the local cache (TTL: 30 s) and are instant. To warm the cache faster, click **Refresh** once after login.

---

## Still Stuck?

- Open a [GitHub Issue](https://github.com/Nefnief-tech/grades-tracker/issues).
- Include: error message, browser console output, and steps to reproduce.
