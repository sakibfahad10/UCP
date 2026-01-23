"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { subMonths, eachDayOfInterval, format, isSameDay } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ActivityHeatmap({ userId }: { userId: string }) {
  const [activity, setActivity] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchActivity() {
      const sixMonthsAgo = subMonths(new Date(), 6).toISOString()
      
      const { data, error } = await supabase
        .from("submissions")
        .select("created_at")
        .eq("user_id", userId)
        .gte("created_at", sixMonthsAgo)

      if (error) {
        console.error("Error fetching activity:", error)
        setLoading(false)
        return
      }

      const counts: Record<string, number> = {}
      data.forEach((sub) => {
        const date = format(new Date(sub.created_at), "yyyy-MM-dd")
        counts[date] = (counts[date] || 0) + 1
      })
      
      setActivity(counts)
      setLoading(false)
    }

    if (userId) fetchActivity()
  }, [userId])

  if (loading) return <div className="h-32 bg-slate-100 animate-pulse rounded-xl w-full" />

  const today = new Date()
  const startDate = subMonths(today, 6)
  const dates = eachDayOfInterval({ start: startDate, end: today })

  // Group dates by week
  const weeks: Date[][] = []
  let currentWeek: Date[] = []

  dates.forEach((date) => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push(date)
  })
  if (currentWeek.length > 0) weeks.push(currentWeek)

  const getColor = (count: number) => {
    if (count === 0) return "bg-slate-100"
    if (count <= 2) return "bg-orange-200"
    if (count <= 5) return "bg-orange-400"
    return "bg-orange-600"
  }

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, i) => (
          <div key={i} className="flex flex-col gap-1">
            {week.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd")
              const count = activity[dateKey] || 0
              return (
                <TooltipProvider key={dateKey}>
                  <Tooltip>
                    <TooltipTrigger>
                      <div 
                        className={`w-3 h-3 rounded-sm ${getColor(count)}`} 
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs font-bold">{count} submissions on {format(day, "MMM d, yyyy")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
