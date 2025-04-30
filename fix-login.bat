@echo off
echo Fixing login page router error...
copy /y app\login\page-with-2fa.tsx app\login\page.tsx
echo Login page fixed successfully!
echo.
echo Setting up password reset and 2FA pages without sidebar...
if not exist app\reset-password\metadata.ts (
  echo export const metadata = { title: 'Reset Password - GradeTracker', description: 'Reset your password for GradeTracker' }; > app\reset-password\metadata.ts
  echo export const useDefaultLayout = false; >> app\reset-password\metadata.ts
)
if not exist app\verify-email\metadata.ts (
  echo export const metadata = { title: 'Verify Email - GradeTracker', description: 'Verify your email address for GradeTracker' }; > app\verify-email\metadata.ts
  echo export const useDefaultLayout = false; >> app\verify-email\metadata.ts
)
if not exist app\verify-2fa\metadata.ts (
  echo export const metadata = { title: 'Two-Factor Authentication - GradeTracker', description: 'Verify your identity with two-factor authentication' }; > app\verify-2fa\metadata.ts
  echo export const useDefaultLayout = false; >> app\verify-2fa\metadata.ts
)
echo Setup complete!