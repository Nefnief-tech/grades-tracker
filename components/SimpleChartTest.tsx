"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Mock static data guaranteed to work
const data = [
  { name: "Jan", value: 2 },
  { name: "Feb", value: 3 },
  { name: "Mar", value: 1.5 },
  { name: "Apr", value: 4 },
  { name: "May", value: 2.5 },
];

// Simple chart test to verify Recharts is working correctly
export default function SimpleChartTest() {
  return (
    <div
      className="border border-border rounded p-4 bg-card mb-6"
      style={{ height: "400px" }}
    >
      <h3 className="text-lg font-bold mb-4 text-card-foreground">
        Simple Chart Test
      </h3>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#4f46e5"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
