"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DebugPanelProps {
  subjectId: string;
}

export function DebugPanel({ subjectId }: DebugPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [localStorageData, setLocalStorageData] = useState<any>(null);

  const loadData = () => {
    try {
      const data = localStorage.getItem("gradeCalculator");
      setLocalStorageData(data ? JSON.parse(data) : null);
    } catch (error) {
      console.error("Error parsing localStorage data:", error);
      setLocalStorageData(null);
    }
  };

  useEffect(() => {
    if (isVisible) {
      loadData();
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 opacity-50 hover:opacity-100"
        onClick={() => setIsVisible(true)}
      >
        Debug
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-auto z-50 opacity-90 hover:opacity-100">
      <CardContent className="p-4 text-xs">
        <div className="flex justify-between mb-2">
          <h4 className="font-bold">Debug Info</h4>
          <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
            Close
          </Button>
        </div>

        <div className="mb-2">
          <strong>Current Subject ID:</strong> {subjectId}
        </div>

        <div className="mb-2">
          <Button
            variant="secondary"
            size="sm"
            className="mb-2"
            onClick={loadData}
          >
            Refresh Data
          </Button>

          <div className="max-h-60 overflow-auto bg-muted p-2 rounded">
            <pre>{JSON.stringify(localStorageData, null, 2)}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
