"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Info, HelpCircle } from "lucide-react";

export interface MfaInfoDrawerProps {
  challengeId?: string;
}

export function MfaInfoDrawer({ challengeId }: MfaInfoDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mt-4 gap-2">
          <HelpCircle size={16} />
          Need help with verification?
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Two-Factor Authentication Help</DrawerTitle>
            <DrawerDescription>
              Information about the verification process
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">What is this verification?</h4>
                <p className="text-sm text-muted-foreground">
                  Two-factor authentication adds an extra layer of security to your account.
                  After entering your password, you need to enter a verification code sent to your email.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">How to complete verification:</h4>
                <ol className="text-sm text-muted-foreground list-decimal pl-4 space-y-1">
                  <li>Check your email inbox for a verification code</li>
                  <li>Enter the 6-digit code in the input field</li>
                  <li>Click "Verify & Continue"</li>
                </ol>
              </div>
              
              {challengeId && (
                <div className="space-y-2">
                  <h4 className="font-medium">Your Challenge ID:</h4>
                  <p className="font-mono text-xs p-2 bg-muted rounded-md overflow-x-auto">
                    {challengeId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    If you contact support, provide this Challenge ID for assistance.
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <h4 className="font-medium">Didn't receive a code?</h4>
                <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                  <li>Check your spam or junk folder</li>
                  <li>Click "Resend code" below the verification form</li>
                  <li>Make sure your email address is correct</li>
                  <li>Wait a few minutes as email delivery may be delayed</li>
                </ul>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button>Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}