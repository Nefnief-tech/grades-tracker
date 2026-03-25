# Guide: Setting Up Cloud Sync and Two-Factor Authentication

This guide walks you through creating a cloud account, enabling synchronisation across devices, and securing it with two-factor authentication (2FA / TOTP).

---

## Prerequisites

- A running Appwrite project (cloud or self-hosted). See [Configuration](../configuration.md#appwrite-setup).
- Grade Tracker deployed with `NEXT_PUBLIC_ENABLE_CLOUD_FEATURES=true`.

---

## Part 1 — Create an Account

### Step 1 — Navigate to Register

Click **"Sign Up"** in the top navigation bar, or go to `/register`.

### Step 2 — Fill in the Form

| Field | Description |
|---|---|
| **Name** | Your display name |
| **Email** | Valid email address |
| **Password** | Minimum 8 characters |

Click **"Create Account"**.

### Step 3 — Verify your Email (if enabled)

If email verification is enabled on your Appwrite project, check your inbox for a verification link and click it.

---

## Part 2 — Enable Cloud Sync

Once logged in, all changes are automatically synced to Appwrite:

1. Grades and subjects created locally will be **migrated to the cloud** on first login.
2. On subsequent logins on any device, your data is fetched from Appwrite.

!!! note "Encryption"
    Your data is encrypted client-side with AES-256 before being sent to Appwrite. The server never sees your raw grade data.

### Manually trigger a sync

Go to **Settings → Account → Sync now** to force an immediate sync.

---

## Part 3 — Enable Two-Factor Authentication

Two-factor authentication (TOTP) adds a second verification step on each login using an authenticator app (Google Authenticator, Authy, etc.).

### Step 1 — Open 2FA Settings

Go to **Settings → Security → Two-Factor Authentication**.

### Step 2 — Scan the QR Code

1. Open your authenticator app.
2. Tap **"+"** or **"Add account"**.
3. Scan the QR code displayed in Grade Tracker.

The app will show a 6-digit code refreshing every 30 seconds.

### Step 3 — Verify the Setup

Enter the current 6-digit code from your authenticator app into the **"Verification Code"** field and click **"Enable 2FA"**.

!!! warning "Save your backup codes"
    Download and store the backup codes shown after enabling 2FA. These are the only way to recover access if you lose your authenticator device.

### Step 4 — Test the Login Flow

Log out and log back in. After entering your password you will be prompted for your TOTP code.

---

## Part 4 — Managing Sessions

View and revoke active sessions at **Settings → Security → Active Sessions**.

- Each session shows device, browser, IP address, and last active time.
- Click **"Revoke"** to immediately invalidate a session on another device.

---

## Troubleshooting

### "Invalid TOTP code"

- Make sure your device's clock is synchronised (TOTP is time-based).
- Try the *next* code (codes refresh every 30 s; there is a ±1 window).
- If still failing, use a backup code to regain access.

### "Cloud sync not working"

- Check that `NEXT_PUBLIC_APPWRITE_ENDPOINT` and `NEXT_PUBLIC_APPWRITE_PROJECT_ID` are set correctly.
- Ensure your Appwrite Web platform entry includes your current hostname.
- Open browser DevTools → Network to inspect failed API calls.
