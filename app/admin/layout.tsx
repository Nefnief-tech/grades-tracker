'use client';

import { Shield, BarChart3, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/toaster';

// ADMIN LAYOUT - BYPASS ALL AUTH
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No auth checks, no redirects, just render the children
  return <>{children}</>;
}