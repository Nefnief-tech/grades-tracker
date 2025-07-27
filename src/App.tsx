import { EmailVerification } from './components/auth/EmailVerification';
import { TwoFactorChallenge } from './components/auth/TwoFactorChallenge';

// ...existing code...

function App() {
  const { user, loading, requiresEmailVerification, requires2FA, twoFactorChallenge, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show 2FA challenge if required
  if (requires2FA && twoFactorChallenge) {
    return (
      <TwoFactorChallenge
        challengeId={twoFactorChallenge}
        onSuccess={() => {/* handled by auth context */}}
        onBack={() => logout()}
        userEmail={user?.email || ''}
      />
    );
  }

  // Show email verification if required
  if (user && requiresEmailVerification) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <EmailVerification onVerified={() => {/* handled by auth context */}} />
      </div>
    );
  }

  // ...existing code...
}