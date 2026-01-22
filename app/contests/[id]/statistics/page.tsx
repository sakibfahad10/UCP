"use client"

import { useState, useEffect, use } from "react"
import { createClient } from "@/lib/supabase/client"
import Header from "@/components/header"
import { BarChart3, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function StatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [stats, setStats] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase.rpc('get_contest_stats', { target_contest_id: id })
      setStats(data || [])
    }
    fetchStats()
  }, [id])

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <Header />
      <div className="max-w-4xl mx-auto px-8 py-12">
        <Link href={`/contests/${id}`} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-8">
          <ChevronLeft size={16}/> <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </Link>
        <h1 className="text-3xl font-black uppercase italic mb-8 flex items-center gap-3"><BarChart3/> Solve Analytics</h1>
        
        <div className="grid gap-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl">
              <div className="flex justify-between items-end mb-2">
                <span className="font-black text-xl italic">{s.order_label}. {s.title}</span>
                <span className="text-emerald-500 font-bold">{s.ac_count} Solved</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${(s.ac_count / (s.total_attempts || 1)) * 100}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}