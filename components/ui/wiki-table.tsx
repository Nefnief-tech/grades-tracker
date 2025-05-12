import React from 'react';
import { cn } from "@/lib/utils";

interface WikiTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export function WikiTable({ children, className, ...props }: WikiTableProps) {
  return (
    <div className="overflow-x-auto">
      <table 
        className={cn(
          "w-full border-collapse text-sm",
          className
        )} 
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function WikiTableHeader({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead 
      className={cn(
        "bg-[#eaecf0] text-left",
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export function WikiTableBody({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("", className)} {...props}>{children}</tbody>;
}

export function WikiTableRow({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr 
      className={cn(
        "border-b border-[#c8ccd1] hover:bg-[#eaf3ff] transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function WikiTableHead({ children, className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th 
      className={cn(
        "px-4 py-3 text-[#202122] font-medium border-b-2 border-[#c8ccd1]",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function WikiTableCell({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td 
      className={cn(
        "px-4 py-3 border-[#eaecf0]",
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}