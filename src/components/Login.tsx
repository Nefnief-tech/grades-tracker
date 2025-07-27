import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TwoFactorChallenge } from './auth/TwoFactorChallenge';

export const Login: React.FC = () => {
  const { login, requires2FA, twoFactorChallenge } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [show2FA, setShow2FA] = useState<boolean>(false);
  const [challengeId, setChallengeId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Successful login will be handled by AuthContext
    } catch (err: any) {
      if (err.message === '2FA_REQUIRED') {
        setShow2FA(true);
        setUserEmail(email);
        // Challenge ID will be available from auth context
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASuccess = () => {
    setShow2FA(false);
    // Login success will be handled by AuthContext
  };

  const handle2FABack = () => {
    setShow2FA(false);
    setEmail('');
    setPassword('');
  };

  if ((show2FA || requires2FA) && twoFactorChallenge) {
    return (
      <TwoFactorChallenge
        challengeId={twoFactorChallenge}
        onSuccess={handle2FASuccess}
        onBack={handle2FABack}
        userEmail={userEmail || email}
      />
    );
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};