"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface LanguageStatsProps {
  userId: string
}

interface LanguageData {
  name: string
  percent: number
  color: string
}

const LANGUAGE_COLORS: Record<string, string> = {
  "python": "bg-yellow-500",
  "javascript": "bg-yellow-400",
  "typescript": "bg-blue-600",
  "cpp": "bg-blue-500",
  "c": "bg-blue-700",
  "java": "bg-red-500",
  "go": "bg-cyan-500",
  "rust": "bg-orange-600",
}

export default function LanguageStats({ userId }: LanguageStatsProps) {
  const [stats, setStats] = useState<LanguageData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchLanguages() {
      const { data, error } = await supabase
        .from("submissions")
        .select("language")
        .eq("user_id", userId)

      if (error) {
        console.error("Error fetching languages:", error)
        setLoading(false)
        return
      }

      if (!data || data.length === 0) {
        setStats([])
        setLoading(false)
        return
      }

      const counts: Record<string, number> = {}
      data.forEach((sub) => {
        const lang = sub.language?.toLowerCase() || "unknown"
        counts[lang] = (counts[lang] || 0) + 1
      })

      const total = data.length
      const languageData = Object.entries(counts)
        .map(([name, count]) => ({
          name,
          percent: Math.round((count / total) * 100),
          color: LANGUAGE_COLORS[name] || "bg-slate-400"
        }))
        .sort((a, b) => b.percent - a.percent)
        .slice(0, 5) // Top 5 languages

      setStats(languageData)
      setLoading(false)
    }

    if (userId) fetchLanguages()
  }, [userId])

  if (loading) {
    return <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-8 bg-slate-100 rounded-lg" />
      ))}
    </div>
  }

  if (stats.length === 0) {
    return <p className="text-slate-400 text-sm">No submissions yet.</p>
  }

  return (
    <div className="space-y-4">
      {stats.map((lang) => (
        <div key={lang.name} className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-700 capitalize">{lang.name}</span>
            <span className="text-slate-400">{lang.percent}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${lang.color} rounded-full transition-all duration-500`} 
              style={{ width: `${lang.percent}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
