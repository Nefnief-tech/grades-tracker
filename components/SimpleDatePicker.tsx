"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SimpleDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  disabledDates?: (date: Date) => boolean;
}

export function SimpleDatePicker({
  date,
  onDateChange,
  label = "Select date",
  placeholder = "Pick a date",
  className,
  disabled = false,
  disabledDates,
}: SimpleDatePickerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date | undefined>(date);

  const handleSave = () => {
    onDateChange(tempDate);
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setTempDate(date);
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !date && "text-muted-foreground",
          className
        )}
        disabled={disabled}
        onClick={() => setIsDialogOpen(true)}
        type="button"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "PPP") : placeholder}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex justify-center">
            <Calendar
              mode="single"
              selected={tempDate}
              onSelect={setTempDate}
              disabled={disabledDates}
              initialFocus
              className="rounded-md border"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
