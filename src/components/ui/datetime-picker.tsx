"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export interface DateTimePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
  inputClassName?: string
  placeholder?: string
}

export function DateTimePicker({
  date,
  onSelect,
  className,
  inputClassName,
  placeholder = "Pick a date...",
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    onSelect?.(date)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    try {
      // 确保输入值包含秒
      const normalizedValue = value.includes(':') && value.split(':').length === 2 
        ? `${value}:00`
        : value
      const parsedDate = parseISO(normalizedValue)
      if (!isNaN(parsedDate.getTime())) {
        handleSelect(parsedDate)
      }
    } catch (error) {
      console.error('Invalid date format:', error)
    }
  }

  const formatDate = (date: Date) => {
    // 使用固定格式确保始终显示秒
    return format(date, "yyyy-MM-dd'T'HH:mm:ss")
  }

  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <style jsx>{`
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          display: none;
        }
      `}</style>
      <Input
        ref={inputRef}
        type="datetime-local"
        step="1"
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
