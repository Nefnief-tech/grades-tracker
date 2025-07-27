"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { TwoFactorSetupForm } from "./auth/TwoFactorSetupForm";

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TwoFactorModal({ isOpen, onClose }: TwoFactorModalProps) {
  const handleSetupComplete = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Secure your account with two-factor authentication
          </DialogDescription>
        </DialogHeader>
        <TwoFactorSetupForm 
          onSetupComplete={handleSetupComplete}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}