"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const DebugFixedPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="py-10">
        <h1 className="text-2xl font-bold mb-6">Debug Fixed Page</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
              <CardDescription>This is a fixed version of the debug page</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Use this page to test fixed functionality and components.</p>
            </CardContent>
            <CardFooter>
              <Button>Test Connection</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DebugFixedPage;