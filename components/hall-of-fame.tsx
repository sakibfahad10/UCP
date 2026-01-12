"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Crown, Trophy, Medal, Star, Sparkles, ArrowRight } from "lucide-react"
import UserAvatar from "@/components/user-avatar"

export default function HallOfFame() {
  const [topCoders, setTopCoders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchTopCoders() {
      try {
        // Fetch from the 'leaderboard' view
        const { data, error } = await supabase
          .from("leaderboard")
          .select("*")
          .order("total_score", { ascending: false })
          .limit(3)

        if (error) throw error
        setTopCoders(data || [])
      } catch (error) {
        console.error("Error fetching Hall of Fame:", JSON.stringify(error, null, 2))
      } finally {
        setLoading(false)
      }
    }

    fetchTopCoders()
  }, [])

  const getRankStyle = (index: number) => {
    if (index === 0) return {
      card: "bg-gradient-to-b from-amber-100 to-amber-50 border-amber-200 shadow-amber-100",
      icon: <Crown size={32} className="text-amber-500 fill-amber-500 animate-bounce" />,
      badge: "bg-amber-500 text-white",
      title: "Grandmaster" 
    }
    if (index === 1) return {
      card: "bg-gradient-to-b from-slate-100 to-slate-50 border-slate-200 shadow-slate-100",
      icon: <Medal size={28} className="text-slate-400 fill-slate-400" />,
      badge: "bg-slate-400 text-white",
      title: "Master"
    }
    return {
      card: "bg-gradient-to-b from-orange-100 to-orange-50 border-orange-200 shadow-orange-100",
      icon: <Medal size={28} className="text-orange-400 fill-orange-400" />,
      badge: "bg-orange-400 text-white",
      title: "Expert"
    }
  }

  if (loading) return (
     <section className="max-w-7xl mx-auto px-6 py-24 mb-10">
        <div className="animate-pulse space-y-8">
           <div className="h-12 w-64 bg-slate-200 rounded-full mx-auto"/>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-[2.5rem]" />)}
           </div>
        </div>
     </section>
  )

  return (
    <section className="max-w-7xl mx-auto px-6 py-24 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-orange-200/20 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <div className="text-center mb-16 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest mb-4">
           <Sparkles size={12} /> Elite Division
        </div>
        <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic">
          Hall of Fame
        </h2>
        <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
          Honoring the architectural masterminds defining the standard of excellence.
        </p>
      </div>

      {/* Podium Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-16 max-w-5xl mx-auto">
        {/* Reordering for Podium Visualization: 2nd, 1st, 3rd */}
        {[topCoders[1], topCoders[0], topCoders[2]].map((coder, idx) => {
          if (!coder) return null
          // Restore original rank based on visual position
          // idx 0 -> 2nd place (Rank 2)
          // idx 1 -> 1st place (Rank 1)
          // idx 2 -> 3rd place (Rank 3)
          const actualRank = idx === 0 ? 1 : idx === 1 ? 0 : 2
          const style = getRankStyle(actualRank)
          const isWinner = actualRank === 0

          return (
            <div 
              key={coder.user_id} 
              className={`relative flex flex-col items-center p-8 rounded-[2.5rem] border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${style.card} ${isWinner ? 'md:scale-110 z-10 shadow-xl' : 'shadow-lg bg-white'}`}
            >
              <div className="absolute -top-6">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 ${style.badge}`}>
                    <span className="font-black text-xl">#{actualRank + 1}</span>
                 </div>
              </div>

              <div className="mb-6 mt-4 relative">
                <div className={`border-4 ${isWinner ? 'border-amber-400' : 'border-white'} shadow-md rounded-full p-1`}>
                   <UserAvatar 
                      avatarUrl={coder.avatar_url}
                      name={coder.display_name || coder.username}
                      size="lg"
                      className="w-24 h-24"
                   />
                </div>
                {isWinner && (
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                      {style.icon}
                   </div>
                )}
              </div>

              <div className="text-center space-y-1">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">{coder.display_name || "Unknown"}</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">@{coder.username}</p>
                 
                 <div className="pt-4 pb-2">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white border border-slate-100 shadow-sm`}>
                       {style.title}
                    </span>
                 </div>
              </div>

              <div className="mt-6 w-full pt-6 border-t border-black/5 flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Score</span>
                    <span className="text-xl font-black text-slate-900">{coder.total_score}</span>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Solved</span>
                    <span className="text-xl font-black text-slate-900">{coder.solved}</span>
                 </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl hover:shadow-orange-500/20 group"
        >
          View Full Rankings
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
        </Link>
      </div>
    </section>
  )
}
