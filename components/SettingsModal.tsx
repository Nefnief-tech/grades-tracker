"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, CloudIcon as CloudSync, WifiOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, updateSyncPreference, isOffline } = useAuth()
  const [syncEnabled, setSyncEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setSyncEnabled(user.syncEnabled)
    }
  }, [user])

  const handleSyncToggle = async (checked: boolean) => {
    if (!user) return

    // Check if offline
    if (isOffline) {
      setError("Cannot update sync settings while offline. Please check your internet connection and try again.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await updateSyncPreference(checked)
      setSyncEnabled(checked)
    } catch (err: any) {
      setError(err.message || "Failed to update sync preference")
      // Revert the switch state on error
      setSyncEnabled(!checked)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure your account settings</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center">
                <CloudSync className="h-4 w-4 mr-2 text-primary" />
                <Label htmlFor="sync-toggle" className="font-medium">
                  Sync Grades
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">Synchronize your grades across all your devices</p>
            </div>
            <Switch
              id="sync-toggle"
              checked={syncEnabled}
              onCheckedChange={handleSyncToggle}
              disabled={isLoading || !user || isOffline}
            />
          </div>

          {isOffline && (
            <Alert variant="warning" className="bg-amber-500/10 text-amber-500 border-amber-500/50">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                You are currently offline. Sync settings cannot be changed until you're back online.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

