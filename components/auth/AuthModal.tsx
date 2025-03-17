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

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLoginView, setIsLoginView] = useState(true);

  const toggleForm = () => {
    setIsLoginView(!isLoginView);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">
            {isLoginView ? "Login" : "Sign Up"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isLoginView ? "Login to your account" : "Create a new account"}
          </DialogDescription>
        </DialogHeader>
        {isLoginView ? (
          <LoginForm onToggleForm={toggleForm} />
        ) : (
          <SignupForm onToggleForm={toggleForm} />
        )}
      </DialogContent>
    </Dialog>
  );
}
