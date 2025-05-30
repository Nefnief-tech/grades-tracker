import React from 'react';
import Link from 'next/link';
import { CalendarClock } from 'lucide-react';

export function TimetableLink() {
  return (
    <Link 
      href="/timetable"
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
    >
      <CalendarClock className="h-4 w-4" />
      <span>Timetable</span>
    </Link>
  );
}

export default TimetableLink;