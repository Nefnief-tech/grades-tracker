# Configuration

Grade Tracker is configured through environment variables. Copy `.env.example` to `.env` (or `.env.local`) and set the values described below.

---

## Environment Variables Reference

### Appwrite — Core (Required for cloud features)

| Variable | Type | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | `string` | `https://cloud.appwrite.io/v1` | Full URL of your Appwrite instance |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | `string` | — | Your Appwrite project ID |

### Appwrite — Database (Required for cloud features)

| Variable | Type | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_APPWRITE_DATABASE_ID` | `string` | — | Appwrite database ID |
| `NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID` | `string` | — | Collection ID for user profiles |
| `NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID` | `string` | — | Collection ID for subjects |
| `NEXT_PUBLIC_APPWRITE_GRADES_COLLECTION_ID` | `string` | — | Collection ID for grades |
| `NEXT_PUBLIC_APPWRITE_POMODORO_COLLECTION_ID` | `string` | — | Collection ID for Pomodoro sessions |

### Feature Flags (Optional)

| Variable | Type | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_ENABLE_CLOUD_FEATURES` | `boolean` | `true` | Enable or disable all Appwrite cloud features |
| `NEXT_PUBLIC_ENABLE_ENCRYPTION` | `boolean` | `true` | Enable AES-256-CBC client-side encryption |
| `NEXT_PUBLIC_FORCE_LOCAL_MODE` | `boolean` | `false` | Force local-only mode even if Appwrite is configured |
| `NEXT_PUBLIC_DEBUG` | `boolean` | `false` | Enable verbose console logging |

### Analytics (Optional)

| Variable | Type | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | `string` | — | Your domain for Plausible analytics |
| `NEXT_PUBLIC_PLAUSIBLE_URL` | `string` | — | Plausible API endpoint URL |

### Encryption (Server-side, Optional)

| Variable | Type | Default | Description |
|---|---|---|---|
| `ENCRYPTION_KEY` | `string` | *dev fallback* | 32-character AES key for server-side encryption. **Must be set in production.** |

!!! danger "Security Warning"
    Never commit a real `ENCRYPTION_KEY` or Appwrite credentials to version control. Use environment secrets in your CI/CD platform.

---

## Example `.env` File

```dotenv
# Appwrite configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=64a7b2c8e12f3

# Database collections
NEXT_PUBLIC_APPWRITE_DATABASE_ID=grades_database
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users_collection
NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID=subjects_collection
NEXT_PUBLIC_APPWRITE_GRADES_COLLECTION_ID=grades_collection
NEXT_PUBLIC_APPWRITE_POMODORO_COLLECTION_ID=pomodoro_collection

# Feature flags
NEXT_PUBLIC_ENABLE_CLOUD_FEATURES=true
NEXT_PUBLIC_ENABLE_ENCRYPTION=true
NEXT_PUBLIC_DEBUG=false

# Analytics (optional)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=grades.example.com
NEXT_PUBLIC_PLAUSIBLE_URL=https://plausible.io/api/event
```

---

## Appwrite Setup

!!! note "Self-hosted Appwrite"
    You can use [Appwrite Cloud](https://cloud.appwrite.io) (free tier available) or self-host Appwrite. See the [Appwrite docs](https://appwrite.io/docs) for installation instructions.

### 1. Create a Project

1. Log in to the Appwrite console.
2. Click **Create Project** and give it a name.
3. Copy the **Project ID** into `NEXT_PUBLIC_APPWRITE_PROJECT_ID`.

### 2. Create the Database

1. In your project, open **Databases**.
2. Click **Create Database** and note the **Database ID**.
3. Set `NEXT_PUBLIC_APPWRITE_DATABASE_ID` to this value.

### 3. Create Collections

Create the following collections with the attributes described in `docs/appwrite-schema/`:

| Collection | Key attributes |
|---|---|
| **users** | `userId`, `email`, `name`, `createdAt` |
| **subjects** | `userId`, `name`, `color`, `grades` (array) |
| **grades** | `subjectId`, `value`, `type`, `date`, `weight` |
| **pomodoro** | `userId`, `duration`, `startedAt`, `completedAt` |

### 4. Add Platform

In Appwrite → your project → **Overview → Integrations**, add a **Web** platform with your app's hostname (e.g., `localhost` for development).

---

## Next.js Configuration

Additional behaviour can be tuned in `next.config.js` / `next.config.mjs`:

- **Images**: Remote patterns for optimised `next/image` sources.
- **PWA**: `next-pwa` is configured for offline support.
- **i18n**: Locale routing is managed by `next-intl` (see `i18n.ts`).

---

## Tailwind / Theme Configuration

The colour palette and design tokens live in `tailwind.config.ts`. Custom theme variables (light/dark CSS variables) are defined in `app/globals.css` and the theme config in `lib/theme-config.ts`.
