"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

type Props = {
  startDate?: Date
  endDate?: Date
  loading: boolean
  isInvalidDateRange: boolean
  onStartDateChange: (date?: Date) => void
  onEndDateChange: (date?: Date) => void
}

export const ProjectDatesSection: React.FC<Props> = ({
  startDate,
  endDate,
  loading,
  isInvalidDateRange,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label>Start Date Project</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !startDate && "text-muted-foreground",
              )}
              disabled={loading}
            >
              <CalendarIcon className="mr-2 size-4" />
              {startDate ? format(startDate, "PPP") : "Pilih tanggal mulai"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => onStartDateChange(date || undefined)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>End Date Project</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !endDate && "text-muted-foreground",
                isInvalidDateRange && "border-red-500 text-red-600",
              )}
              disabled={loading}
            >
              <CalendarIcon className="mr-2 size-4" />
              {endDate ? format(endDate, "PPP") : "Pilih tanggal selesai"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => onEndDateChange(date || undefined)}
              initialFocus
              disabled={(date) =>
                startDate ? date <= startDate : false
              }
            />
          </PopoverContent>
        </Popover>
        {isInvalidDateRange && (
          <p className="text-red-600 text-sm">
            Tanggal selesai tidak boleh sebelum atau sama dengan tanggal mulai project.
          </p>
        )}
      </div>
    </div>
  )
}
        