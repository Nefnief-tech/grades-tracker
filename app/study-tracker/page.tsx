"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Timer, BarChart2, ListTodo, Calendar, Clock } from "lucide-react";
import { Empty } from "@/components/Empty";

export default function StudyTrackerPage() {
  return (
    <div className="container py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Clock className="h-7 w-7" />
          <span>Study Tracker</span>
        </h1>
        <p className="text-muted-foreground">
          Track your study sessions and improve your productivity
        </p>
      </div>

      <Tabs defaultValue="timer" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="timer" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span>Study Timer</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Statistics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timer">
          <Card>
            <CardHeader>
              <CardTitle>Study Timer</CardTitle>
              <CardDescription>
                Use the Pomodoro technique to improve your focus and
                productivity
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Empty
                icon={<Timer className="h-12 w-12 text-muted-foreground" />}
                title="Study Timer Coming Soon"
                description="This feature is under development and will be available soon"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Study Sessions</CardTitle>
              <CardDescription>
                View and manage your study sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Empty
                icon={<ListTodo className="h-12 w-12 text-muted-foreground" />}
                title="No Study Sessions Yet"
                description="Start your first study session to track your progress"
                action={<Button>Start Session</Button>}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>Study Statistics</CardTitle>
              <CardDescription>
                Analyze your study habits and productivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Empty
                icon={<BarChart2 className="h-12 w-12 text-muted-foreground" />}
                title="No Statistics Available"
                description="Complete study sessions to see your statistics"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
