"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";

export function DisplayForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [animate, setAnimate] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    // Update local state when theme changes
    setCurrentTheme(theme);
  }, [theme]);

  const handleUpdateDisplay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update theme if it changed
      if (currentTheme !== theme) {
        setTheme(currentTheme || "system");
      }
      
      // This is a placeholder for actual update logic for other preferences
      // In a real implementation, you would call your API to update preferences
      
      toast({
        title: "Display settings updated",
        description: "Your display preferences have been saved.",
      });
    } catch (error) {
      console.error("Error updating display settings:", error);
      toast({
        title: "Error",
        description: "Could not update display settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdateDisplay}>
      <Card>
        <CardHeader>
          <CardTitle>Display</CardTitle>
          <CardDescription>
            Customize how the application looks and behaves.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={currentTheme} onValueChange={setCurrentTheme}>
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="animations">Animations</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable UI animations and transitions.
              </p>
            </div>
            <Switch
              id="animations"
              checked={animate}
              onCheckedChange={setAnimate}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compact">Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Reduce spacing and sizing of UI elements.
              </p>
            </div>
            <Switch
              id="compact"
              checked={compactMode}
              onCheckedChange={setCompactMode}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}