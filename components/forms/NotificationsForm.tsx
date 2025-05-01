"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function NotificationsForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Default notification preferences
  const [emailNotifications, setEmailNotifications] = useState({
    newGrades: true,
    courseUpdates: true,
    reminders: false,
    marketing: false,
  });

  const handleUpdateNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // This is a placeholder for actual update logic
      // In a real implementation, you would call your API to update preferences
      
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast({
        title: "Error",
        description: "Could not update notification preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdateNotifications}>
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage how you receive notifications and updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="new-grades">New Grades</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new grades are posted.
                </p>
              </div>
              <Switch
                id="new-grades"
                checked={emailNotifications.newGrades}
                onCheckedChange={(checked) => 
                  setEmailNotifications({ ...emailNotifications, newGrades: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="course-updates">Course Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about changes to your enrolled courses.
                </p>
              </div>
              <Switch
                id="course-updates"
                checked={emailNotifications.courseUpdates}
                onCheckedChange={(checked) => 
                  setEmailNotifications({ ...emailNotifications, courseUpdates: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reminders">Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Receive reminders about upcoming deadlines and exams.
                </p>
              </div>
              <Switch
                id="reminders"
                checked={emailNotifications.reminders}
                onCheckedChange={(checked) => 
                  setEmailNotifications({ ...emailNotifications, reminders: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing">Marketing</Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails about new features and updates.
                </p>
              </div>
              <Switch
                id="marketing"
                checked={emailNotifications.marketing}
                onCheckedChange={(checked) => 
                  setEmailNotifications({ ...emailNotifications, marketing: checked })
                }
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Preferences"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}