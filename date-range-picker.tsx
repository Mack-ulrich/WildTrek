"use client"

import { useState } from "react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/utils"
import { Button } from "@/button"
import { Calendar } from "@/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/popover"

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
  placeholder?: string
}

export function DateRangePicker({ value, onChange, className, placeholder = "Pick a date range" }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  const displayText = value?.from
    ? value.to
      ? `${format(value.from, "LLL dd, y")} – ${format(value.to, "LLL dd, y")}`
      : format(value.from, "LLL dd, y")
    : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !value?.from && "text-muted-foreground", className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          autoFocus
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          onSelect={r => { onChange?.(r); if (r?.to) setOpen(false) }}
          numberOfMonths={2}
          disabled={date => date < new Date()}
        />
      </PopoverContent>
    </Popover>
  )
}
