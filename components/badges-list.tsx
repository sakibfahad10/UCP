"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Award, Zap, Star, Trophy, Target, Crown } from "lucide-react"

interface Badge {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  condition: (stats: any) => boolean
}

export default function BadgesList({ userId }: { userId: string }) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      // Fetch stats from leaderboard view
      const { data, error } = await supabase
        .from("leaderboard")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (error && error.code !== "PGRST116") { // Ignore no rows found (new user)
        console.error("Error fetching stats:", error)
      }
      
      setStats(data || { solved: 0, total_score: 0 })
      setLoading(false)
    }

    if (userId) fetchStats()
  }, [userId])

  const BADGES: Badge[] = [
    {
      id: "novice",
      name: "Novice",
      description: "Solved your first problem",
      icon: Star,
      color: "text-blue-500",
      condition: (s) => s.solved >= 1
    },
    {
      id: "solver",
      name: "Problem Solver",
      description: "Solved 10+ problems",
      icon: Zap,
      color: "text-orange-500",
      condition: (s) => s.solved >= 10
    },
    {
      id: "elite",
      name: "Elite Coder",
      description: "Reached 1000+ points",
      icon: Trophy,
      color: "text-yellow-500",
      condition: (s) => s.total_score >= 1000
    },
    {
      id: "sharp",
      name: "Sharp Shooter",
      description: "Solved 50+ problems",
      icon: Target,
      color: "text-red-500",
      condition: (s) => s.solved >= 50
    },
    {
      id: "legend",
      name: "Legend",
      description: "Reached 5000+ points",
      icon: Crown,
      color: "text-purple-500",
      condition: (s) => s.total_score >= 5000
    }
  ]

  if (loading) return <div className="animate-pulse text-xs text-slate-400">Loading badges...</div>

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {BADGES.map((badge) => {
        const isUnlocked = stats ? badge.condition(stats) : false
        const Icon = badge.icon
        
        return (
          <div 
            key={badge.id}
            className={`p-4 rounded-2xl border transition-all ${
              isUnlocked 
              ? "bg-white border-slate-100 shadow-sm" 
              : "bg-slate-50 border-transparent opacity-60 grayscale"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-xl ${isUnlocked ? "bg-slate-50" : "bg-slate-200"}`}>
                <Icon className={`w-5 h-5 ${isUnlocked ? badge.color : "text-slate-400"}`} />
              </div>
              <div>
                <h5 className="font-bold text-slate-900 text-sm">{badge.name}</h5>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">{badge.description}</p>
          </div>
        )
      })}
    </div>
  )
}
