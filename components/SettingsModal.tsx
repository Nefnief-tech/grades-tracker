"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shield, Mail, Smartphone, AlertTriangle } from "lucide-react";
import { TwoFactorModal } from "./TwoFactorModal";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<'app' | 'email' | null>(null);

  const handleEnable2FA = () => {
    setIsTwoFactorModalOpen(true);
  };

  const handleDisable2FA = () => {
    // TODO: Add confirmation dialog
    setTwoFactorEnabled(false);
    setTwoFactorMethod(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Account Settings</DialogTitle>
            <DialogDescription>
              Manage your account preferences and security settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Security Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>
                  Manage your account security and authentication methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                    {twoFactorEnabled && twoFactorMethod && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {twoFactorMethod === 'app' ? (
                            <>
                              <Smartphone className="h-3 w-3" />
                              Authenticator App
                            </>
                          ) : (
                            <>
                              <Mail className="h-3 w-3" />
                              Email
                            </>
                          )}
                        </Badge>
                        <Badge variant="secondary" className="text-green-700 bg-green-100">
                          Enabled
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {twoFactorEnabled ? (
                      <Button variant="outline" size="sm" onClick={handleDisable2FA}>
                        Disable
                      </Button>
                    ) : (
                      <Button size="sm" onClick={handleEnable2FA}>
                        Enable 2FA
                      </Button>
                    )}
                  </div>
                </div>

                {!twoFactorEnabled && (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800">
                        Your account is not protected by 2FA
                      </p>
                      <p className="text-amber-700 mt-1">
                        Enable two-factor authentication to secure your account against unauthorized access.
                      </p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Password</Label>
                    <p className="text-sm text-muted-foreground">
                      Change your account password
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important updates via email
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Grade Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about upcoming assignments and deadlines
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TwoFactorModal 
        isOpen={isTwoFactorModalOpen} 
        onClose={() => setIsTwoFactorModalOpen(false)}
      />
    </>
  );
}

