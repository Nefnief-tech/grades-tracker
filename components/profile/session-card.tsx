"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Globe, Laptop, LogOut, Smartphone } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

interface SessionCardProps {
  session: any;
  isCurrentSession: boolean;
  onEndSession: (sessionId: string) => void;
}

export function SessionCard({
  session,
  isCurrentSession,
  onEndSession,
}: SessionCardProps) {
  if (!session) return null;
  
  // Format dates
  let createdAtFormatted = 'Unknown date';
  if (session.createdAt) {
    try {
      const createdAt = parseISO(session.createdAt);
      createdAtFormatted = formatDistanceToNow(createdAt, { addSuffix: true });
    } catch (error) {
      console.error('Error parsing session.createdAt:', error, session);
    }
  }
  
  // Determine device icon
  function getDeviceIcon() {
    const ua = session.userAgent?.toLowerCase() || '';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="h-4 w-4 mr-2" />;
    }
    return <Laptop className="h-4 w-4 mr-2" />;
  }
  return (
    <Card className={`mb-4 ${isCurrentSession ? 'border-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              {getDeviceIcon()}
              <h3 className="font-medium">
                {isCurrentSession ? 'Current Session' : 'Session'} 
                {session.clientName && ` - ${session.clientName}`}
                {(!session.clientName && session.provider) && ` - ${session.provider}`}
              </h3>
            </div>
            
            <div className="text-sm text-muted-foreground mt-2">
              <div className="flex items-center mb-1">
                <Calendar className="h-3.5 w-3.5 mr-2" />
                <span>Created: {createdAtFormatted}</span>
              </div>
              
              {session.ip && (
                <div className="flex items-center mb-1">
                  <Globe className="h-3.5 w-3.5 mr-2" />
                  <span>IP: {session.ip}</span>
                </div>
              )}
              
              {/* Show OS info if available */}
              {(session.osName || session.clientType) && (
                <div className="flex items-center">
                  <Laptop className="h-3.5 w-3.5 mr-2" />
                  <span>{session.osName || session.clientType || "Unknown"} {session.osVersion || ""}</span>
                </div>
              )}
            </div>
          </div>
          
          {!isCurrentSession && (
            <Button 
              variant="destructive" 
              size="sm" 
              className="ml-2"
              onClick={() => onEndSession(session.$id)}
            >
              <LogOut className="h-4 w-4 mr-2" />
              End Session
            </Button>
          )}
          
          {isCurrentSession && (
            <div className="bg-primary/20 text-primary px-2 py-1 text-xs rounded-md font-medium">
              Current
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}