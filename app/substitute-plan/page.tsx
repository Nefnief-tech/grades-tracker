'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter, 
  CardDescription 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { fetchSubstitutePlan, parseSubstitutePlan, SubstituteDay, SubstituteEntry } from "@/lib/substitute-plan-service";
import { AlertCircle, Calendar, Clock, ListFilter, LayoutGrid, LayoutList, RefreshCw, Info } from "lucide-react";
import FallbackBanner from "@/components/ui/fallback-banner";

export default function SubstitutePlanPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [speech, setSpeech] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [substituteDays, setSubstituteDays] = useState<SubstituteDay[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchSubstitutePlan();
      if (data.success) {
        setSpeech(data.speech);
        setLastUpdated(new Date(data.timestamp.replace(/-/g, ':')).toLocaleString());
        
        const parsedDays = parseSubstitutePlan(data.rawData);
        setSubstituteDays(parsedDays);
      } else {
        setError('Failed to load substitute plan data');
      }
    } catch (err) {
      let errorMessage = `Error loading substitute plan: ${err instanceof Error ? err.message : 'Unknown error'}`;
      
      // Check if this might be a CORS error
      if (errorMessage.includes('NetworkError') || errorMessage.includes('CORS')) {
        errorMessage = 'Network error: Cannot access the substitute plan API. The server might be unavailable or there might be a CORS issue.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  // Function to get badge variant based on info text
  const getBadgeVariant = (info: string): "default" | "destructive" | "outline" | "secondary" => {
    const lowercaseInfo = info.toLowerCase();
    if (lowercaseInfo.includes('entfällt')) return "destructive";
    if (lowercaseInfo.includes('raumänderung')) return "secondary";
    if (lowercaseInfo.includes('sondereinsatz')) return "outline";
    return "default";
  };
  
  // Function to render a substitute entry as a card
  const renderEntryCard = (entry: SubstituteEntry, index: number) => (
    <Card key={index} className="mb-3">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Period {entry.period}</CardTitle>
          <Badge variant={getBadgeVariant(entry.info)}>{entry.info}</Badge>
        </div>
        <CardDescription>{entry.subject}</CardDescription>
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Substitute</p>
            <p>{entry.substitute || "—"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Room</p>
            <p>{entry.room || "—"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  // Function to get a style class for a cell based on info text
  const getCellClass = (info: string): string => {
    const lowercaseInfo = info.toLowerCase();
    if (lowercaseInfo.includes('entfällt')) return "text-destructive";
    return "";
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Substitute Plan</h1>
          <div className="flex items-center text-muted-foreground text-sm gap-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Last updated: {lastUpdated || "—"}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setViewMode('card')}
            className={viewMode === 'card' ? 'bg-secondary' : ''}
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            Cards
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setViewMode('table')}
            className={viewMode === 'table' ? 'bg-secondary' : ''}
          >
            <LayoutList className="h-4 w-4 mr-1" />
            Table
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchData} 
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>
        {/* Fallback data notice */}
      {speech && speech.includes("Fallback substitute plan data") && (
        <FallbackBanner message="The substitute plan API is currently unavailable. Showing cached data instead." />
      )}

      {/* Speech announcement */}
      {speech && (
        <Card className="mb-6 bg-muted/50">
          <CardContent className="pt-4">
            <p className="text-center italic">{speech}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}
      
      {/* No data message */}
      {!loading && substituteDays.length === 0 && !error && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6 pb-6">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-lg font-medium">No substitutions found</p>
              <p className="text-muted-foreground mt-1">There are no substitute lessons scheduled at the moment.</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Substitute plan content */}
      {!loading && substituteDays.length > 0 && (
        <div className="space-y-6">
          {substituteDays.map((day, dayIndex) => (
            <Card key={dayIndex}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  {day.date} (KW {day.weekNumber})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {viewMode === 'card' ? (
                  <div className="space-y-3">
                    {day.entries.map((entry, entryIndex) => renderEntryCard(entry, entryIndex))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Period</TableHead>
                        <TableHead>Substitute</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Info</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {day.entries.map((entry, entryIndex) => (
                        <TableRow key={entryIndex}>
                          <TableCell>{entry.period}</TableCell>
                          <TableCell>{entry.substitute || "—"}</TableCell>
                          <TableCell>{entry.subject}</TableCell>
                          <TableCell>{entry.room}</TableCell>
                          <TableCell className={getCellClass(entry.info)}>
                            {entry.info}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                {day.entries.length} substitutions for this day
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Note at the bottom */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>The substitute plan shown here is non-binding. Short-term changes are possible at any time.</p>
      </div>
    </div>
  );
}