'use client';

import { SessionsManager } from "@/components/SessionsManager";
import { Card } from "@/components/ui/card";

export default function SessionsPage() {
  return (
    <div className="container max-w-4xl py-6">
      <SessionsManager />
    </div>
  );
}