# Environment Variable Configuration

This document explains all environment variables used in the Grades Tracker application.

## Required Environment Variables

The following environment variables are required for the application to function properly with cloud features:

### Appwrite Configuration

| Variable                          | Description               | Example                        |
| --------------------------------- | ------------------------- | ------------------------------ |
| `NEXT_PUBLIC_APPWRITE_ENDPOINT`   | Appwrite API endpoint URL | `https://cloud.appwrite.io/v1` |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | Your Appwrite project ID  | `64a7b2c8e12f3`                |

### Database Configuration

| Variable                                      | Description                         | Example               |
| --------------------------------------------- | ----------------------------------- | --------------------- |
| `NEXT_PUBLIC_APPWRITE_DATABASE_ID`            | Your Appwrite database ID           | `grades_database`     |
| `NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID`    | Collection ID for users             | `users_collection`    |
| `NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID` | Collection ID for subjects          | `subjects_collection` |
| `NEXT_PUBLIC_APPWRITE_GRADES_COLLECTION_ID`   | Collection ID for grades            | `grades_collection`   |
| `NEXT_PUBLIC_APPWRITE_POMODORO_COLLECTION_ID` | Collection ID for pomodoro sessions | `pomodoro_collection` |

## Optional Environment Variables

These variables are optional but recommended for production environments:

| Variable                            | Description                           | Default | Example           |
| ----------------------------------- | ------------------------------------- | ------- | ----------------- |
| `NEXT_PUBLIC_ENABLE_CLOUD_FEATURES` | Enable/disable cloud features         | `true`  | `true` or `false` |
| `NEXT_PUBLIC_ENABLE_ENCRYPTION`     | Enable/disable client-side encryption | `true`  | `true` or `false` |
| `NEXT_PUBLIC_DEBUG`                 | Enable verbose logging                | `false` | `true` or `false` |

## Analytics (Optional)

| Variable                       | Description                    | Example                          |
| ------------------------------ | ------------------------------ | -------------------------------- |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Domain for Plausible analytics | `grades.example.com`             |
| `NEXT_PUBLIC_PLAUSIBLE_URL`    | URL for Plausible analytics    | `https://plausible.io/api/event` |

## Setting Environment Variables

### Local Development

Create a `.env.local` file in the root directory with your environment variables:
