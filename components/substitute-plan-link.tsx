import React from 'react';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';

export function SubstitutePlanLink() {
  return (
    <Link 
      href="/substitute-plan"
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
    >
      <CalendarDays className="h-4 w-4" />
      <span>Substitute Plan</span>
    </Link>
  );
}

export default SubstitutePlanLink;