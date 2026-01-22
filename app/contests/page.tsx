"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Header from "@/components/header"
import Link from "next/link"
import { Trophy, Calendar, Users, ChevronRight, LayoutGrid } from "lucide-react"

export default function ContestsLobby() {
  const [contests, setContests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function getContests() {
      // স্মার্ট কুয়েরি: প্রবলেম কাউন্টসহ ডাটা নিয়ে আসা
      const { data, error } = await supabase
        .from("contests")
        .select(`*, problems(id)`)
        .order("start_time", { ascending: false })
      
      if (!error) setContests(data || [])
      setLoading(false)
    }
    getContests()
  }, [supabase])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900">
      {/* ১. নেভিগেশন বার এখানে শো করবে */}
      <Header />

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        {/* Hero Section - More Compact */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-0.5 bg-orange-500" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Competitive Arena</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-950">
              Battle <span className="text-orange-500">Arenas</span>
            </h1>
          </div>
          <div className="text-right border-l-2 border-slate-100 pl-4">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Global Nodes</p>
            <p className="text-xl font-black text-slate-900 italic tracking-tighter">{contests.length} ACTIVE</p>
          </div>
        </div>

        {/* Contest Grid - Compact Professional Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {contests.map((contest) => (
            <Link 
              key={contest.id} 
              href={`/contests/${contest.id}`}
              className="group bg-white border border-slate-200/60 p-5 rounded-3xl hover:border-orange-500/40 transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                    <Trophy size={14} />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[7px] font-black uppercase tracking-widest">Live</span>
                  </div>
                </div>

                <h2 className="text-base font-black uppercase italic mb-2 group-hover:text-orange-500 transition-colors leading-tight">
                  {contest.title}
                </h2>
                
                <p className="text-slate-400 text-[10px] line-clamp-2 font-bold uppercase italic mb-5 leading-relaxed">
                  {contest.description || "System ready for deployment."}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-[6px] font-black text-slate-300 uppercase tracking-widest">Start</span>
                      <span className="text-[9px] font-black text-slate-600 flex items-center gap-1">
                        <Calendar size={10} className="text-orange-500" />
                        {new Date(contest.start_time).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <div className="flex flex-col border-l border-slate-100 pl-4">
                      <span className="text-[6px] font-black text-slate-300 uppercase tracking-widest">Payload</span>
                      <span className="text-[9px] font-black text-slate-600 flex items-center gap-1">
                        <LayoutGrid size={10} className="text-orange-500" />
                        {contest.problems?.length || 0} PROBS
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-7 h-7 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-slate-950 group-hover:text-white transition-all transform group-hover:-rotate-45">
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}