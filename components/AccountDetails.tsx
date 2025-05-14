'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, Mail, Calendar, Upload } from "lucide-react";

interface User {
  id?: string;
  name?: string;
  email?: string;
  createdAt?: string;
  avatarUrl?: string;
}

export function AccountDetails({ user }: { user?: User }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'User Name',
    email: user?.email || 'user@example.com',
  });

  const createdAt = user?.createdAt || 'January 1, 2023';
  const userInitials = formData.name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // In a real app, call API to save user details
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your account profile information and email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.avatarUrl || ''} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{formData.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formData.email}
              </p>
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                <span>Joined on {createdAt}</span>
              </div>
            </div>
            <div className="sm:ml-auto">
              <Button variant="outline" size="sm">
                <Camera className="mr-2 h-4 w-4" /> Change Photo
              </Button>
            </div>
          </div>

          <Separator />
          
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="p-2 border rounded-md bg-muted/20">
                    {formData.name}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="p-2 border rounded-md bg-muted/20">
                    {formData.email}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Preferences</CardTitle>
          <CardDescription>
            Update your account preferences and settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-medium mb-1">Time Zone</h3>
              <p className="text-sm text-muted-foreground">
                Your current timezone is set to <strong>UTC (GMT+0)</strong>
              </p>
            </div>
            <div className="sm:flex sm:justify-end">
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-medium mb-1">Language</h3>
              <p className="text-sm text-muted-foreground">
                Your current language is set to <strong>English (US)</strong>
              </p>
            </div>
            <div className="sm:flex sm:justify-end">
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions for your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-medium text-destructive mb-1">Delete Account</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <div className="sm:flex sm:justify-end">
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}