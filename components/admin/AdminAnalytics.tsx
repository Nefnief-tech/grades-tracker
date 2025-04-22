"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Sample data for charts
const userGrowthData = [
  { month: "Jan", users: 150 },
  { month: "Feb", users: 220 },
  { month: "Mar", users: 310 },
  { month: "Apr", users: 430 },
  { month: "May", users: 570 },
  { month: "Jun", users: 650 },
  { month: "Jul", users: 800 },
  { month: "Aug", users: 920 },
  { month: "Sep", users: 1050 },
  { month: "Oct", users: 1240 },
  { month: "Nov", users: 1480 },
  { month: "Dec", users: 1750 },
];

const activityData = [
  { day: "Mon", active: 845 },
  { day: "Tue", active: 932 },
  { day: "Wed", active: 1053 },
  { day: "Thu", active: 968 },
  { day: "Fri", active: 823 },
  { day: "Sat", active: 672 },
  { day: "Sun", active: 741 },
];

const subjectDistributionData = [
  { name: "Mathematics", count: 385, fill: "#0ea5e9" },
  { name: "Physics", count: 278, fill: "#8b5cf6" },
  { name: "Computer Science", count: 320, fill: "#10b981" },
  { name: "Chemistry", count: 185, fill: "#f59e0b" },
  { name: "Biology", count: 240, fill: "#ef4444" },
  { name: "Languages", count: 310, fill: "#6366f1" },
  { name: "Economics", count: 195, fill: "#ec4899" },
];

export function AdminAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalUsers: 2350,
    activeUsers: 1430,
    averageGrade: 78.5,
    totalSubjects: 12540,
    totalGrades: 47320,
  });

  // In a real app, we would fetch these metrics from the backend
  useEffect(() => {
    // Simulating data fetching
    const fetchAnalyticsData = () => {
      // This would be a real API call in production
      console.log("Fetching analytics data...");
      // setAnalytics(data)
    };

    fetchAnalyticsData();
  }, []);

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">User Growth</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={userGrowthData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Daily Active Users
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activityData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="active" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Subject Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {subjectDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="grades">
            <TabsList>
              <TabsTrigger value="grades">Grade Statistics</TabsTrigger>
              <TabsTrigger value="activity">User Activity</TabsTrigger>
              <TabsTrigger value="system">System Performance</TabsTrigger>
            </TabsList>
            <TabsContent value="grades" className="pt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-xl font-bold">
                    {analytics.averageGrade}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Average grade across all users
                  </p>
                </div>
                <div>
                  <div className="text-xl font-bold">
                    {analytics.totalSubjects.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total subjects tracked
                  </p>
                </div>
                <div>
                  <div className="text-xl font-bold">
                    {analytics.totalGrades.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total grades recorded
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="mb-4 font-medium">Top Performing Subjects</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="w-32">Mathematics</span>
                    <div className="flex-1">
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-full w-[85%] rounded-full bg-primary"></div>
                      </div>
                    </div>
                    <span className="ml-2">85%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32">Computer Science</span>
                    <div className="flex-1">
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-full w-[82%] rounded-full bg-primary"></div>
                      </div>
                    </div>
                    <span className="ml-2">82%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32">Physics</span>
                    <div className="flex-1">
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-full w-[76%] rounded-full bg-primary"></div>
                      </div>
                    </div>
                    <span className="ml-2">76%</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="activity" className="pt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-xl font-bold">45 min</div>
                  <p className="text-sm text-muted-foreground">
                    Average session time
                  </p>
                </div>
                <div>
                  <div className="text-xl font-bold">6.3</div>
                  <p className="text-sm text-muted-foreground">
                    Weekly sessions per user
                  </p>
                </div>
                <div>
                  <div className="text-xl font-bold">92%</div>
                  <p className="text-sm text-muted-foreground">
                    Retention rate (30d)
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="system" className="pt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-xl font-bold">385 ms</div>
                  <p className="text-sm text-muted-foreground">
                    Average API response time
                  </p>
                </div>
                <div>
                  <div className="text-xl font-bold">0.12%</div>
                  <p className="text-sm text-muted-foreground">Error rate</p>
                </div>
                <div>
                  <div className="text-xl font-bold">63%</div>
                  <p className="text-sm text-muted-foreground">
                    Database usage
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
