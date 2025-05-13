"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getCurrentUser } from "@/lib/appwrite";
import { useEffect } from "react";

export function AccountForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUserData = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {          setName(user.name || "");
          setEmail(user.email || "");
          // Use a property that likely exists or default to false
          setIsEmailVerified(user.twoFactorEnabled || false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // This is a placeholder for actual update logic
      // In a real implementation, you would call your API to update the account
      
      toast({
        title: "Account updated",
        description: "Your account information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating account:", error);
      toast({
        title: "Error",
        description: "Could not update account information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    setIsLoading(true);
    try {
      // This is a placeholder for actual verification email logic
      
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast({
        title: "Error",
        description: "Could not send verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdateAccount}>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
            />
            {!isEmailVerified && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSendVerificationEmail}
                disabled={isLoading}
                className="mt-2"
              >
                {isLoading ? "Sending..." : "Verify Email"}
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}