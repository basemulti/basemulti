"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
  inputClassName?: string
  placeholder?: string
}

export function DatePicker({
  date,
  onSelect,
  className,
  inputClassName,
  placeholder = "Pick a date...",
}: DatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    onSelect?.(date)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    try {
      const parsedDate = parseISO(value)
      if (!isNaN(parsedDate.getTime())) {
        handleSelect(parsedDate)
      }
    } catch (error) {
      console.error('Invalid date format:', error)
    }
  }

  const formatDate = (date: Date) => {
    return format(date, "yyyy-MM-dd")
  }

  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <style jsx>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          display: none;
        }
      `}</style>
      <Input
        ref={inputRef}
        type="date"
        value={selectedDate ? formatDate(selectedDate) : ""}
        onChange={handleInputChange}
        className={cn("w-full pr-8", inputClassName)}
        placeholder={placeholder}
        style={{ 
          colorScheme: 'normal',
          // @ts-ignore
          '::-webkit-calendar-picker-indicator': { display: 'none' }
        }}
      />
      <CalendarIcon 
        className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
        onClick={() => inputRef.current?.showPicker()}
      />
    </div>
  )
}
