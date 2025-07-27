"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { EmailVerificationForm } from "./EmailVerificationForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'login' | 'signup' | 'verify-email';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [emailToVerify, setEmailToVerify] = useState<string>('');

  const handleSignupSuccess = (email: string) => {
    setEmailToVerify(email);
    setCurrentView('verify-email');
  };

  const handleVerificationSuccess = () => {
    onClose();
    setCurrentView('login');
    setEmailToVerify('');
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
    setEmailToVerify('');
  };

  const toggleForm = () => {
    setCurrentView(currentView === 'login' ? 'signup' : 'login');
  };

  const getTitle = () => {
    switch (currentView) {
      case 'login':
        return 'Login';
      case 'signup':
        return 'Sign Up';
      case 'verify-email':
        return 'Verify Email';
      default:
        return 'Authentication';
    }
  };

  const getDescription = () => {
    switch (currentView) {
      case 'login':
        return 'Login to your account';
      case 'signup':
        return 'Create a new account';
      case 'verify-email':
        return 'Please check your email for a verification code';
      default:
        return 'Authentication';
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        {currentView === 'login' && (
          <LoginForm onToggleForm={toggleForm} />
        )}
        {currentView === 'signup' && (
          <SignupForm onToggleForm={toggleForm} onSignupSuccess={handleSignupSuccess} />
        )}
        {currentView === 'verify-email' && (
          <EmailVerificationForm 
            email={emailToVerify}
            onVerificationSuccess={handleVerificationSuccess}
            onBackToLogin={handleBackToLogin}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
