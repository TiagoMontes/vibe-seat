"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/app/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  disablePastDates?: boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Selecione uma data",
  disabled = false,
  className,
  disablePastDates = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const disabledDays = disablePastDates
    ? { before: new Date() }
    : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            onDateChange(newDate)
            if (newDate) {
              setOpen(false)
            }
          }}
          disabled={disabledDays}
          initialFocus
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  )
}