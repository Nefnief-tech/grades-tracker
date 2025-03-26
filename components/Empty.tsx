import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function Empty({ icon, title, description, action }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg border border-dashed">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  );
}
