"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AuthModal } from "./auth/AuthModal"
import { SettingsModal } from "./SettingsModal"
import { User, LogOut, Settings, WifiOff, CloudOff, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "./ThemeToggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function UserMenu() {
  const { user, logout, isOffline, cloudFeaturesEnabled } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {!cloudFeaturesEnabled && (
          <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
            <CloudOff className="h-3 w-3" />
            <span className="text-xs">Local Mode</span>
          </Badge>
        )}

        {isOffline && cloudFeaturesEnabled && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="destructive" className="flex items-center gap-1 px-2 py-1 cursor-help">
                  <WifiOff className="h-3 w-3" />
                  <span className="text-xs">Offline</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  Network connection to cloud is unavailable. <br />
                  The app will work in offline mode with local storage.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {cloudFeaturesEnabled && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline-block">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-sm">
                <span className="font-medium">{user.email}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsSettingsModalOpen(true)} disabled={isOffline}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
                {isOffline && <WifiOff className="h-3 w-3 ml-2 text-destructive" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : cloudFeaturesEnabled ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => setIsAuthModalOpen(true)}
                  disabled={isOffline}
                  className="relative"
                >
                  {isOffline ? (
                    <>
                      <WifiOff className="h-3 w-3 mr-2" />
                      Offline
                    </>
                  ) : (
                    <>
                      Login
                      {cloudFeaturesEnabled && <AlertTriangle className="h-3 w-3 ml-1 text-amber-500" />}
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {isOffline
                    ? "You are currently offline. Login is unavailable."
                    : "Cloud features may be experiencing connection issues. Your data will be saved locally."}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}

        <ThemeToggle />
      </div>

      {cloudFeaturesEnabled && (
        <>
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
          <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
        </>
      )}
    </>
  )
}

