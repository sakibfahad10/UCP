"use client"

import { useState, useEffect, use } from "react"
import { createClient } from "@/lib/supabase/client"
import Header from "@/components/header"
import { Trophy, Timer, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function LeaderboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [standings, setStandings] = useState<any[]>([])
  const [contest, setContest] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: contestData } = await supabase.from("contests").select("*").eq("id", id).single()
      setContest(contestData)

      const { data } = await supabase.from("contest_leaderboard").select("*").eq("contest_id", id)
      setStandings(data || [])
    }
    fetchData()

    // Requirement 13: Real-time reflection
    const channel = supabase.channel('standings-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => fetchData())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id, supabase])

  if (!contest) return <div className="p-20 text-center font-black animate-pulse">RANKING ARCHITECTS...</div>

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <Header />
      <div className="bg-slate-900 text-white py-12 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <div>
            <Link href={`/contests/${id}`} className="flex items-center gap-2 text-slate-500 hover:text-orange-500 mb-4 transition-colors">
              <ChevronLeft size={16}/> <span className="text-[10px] font-black uppercase tracking-widest">Back to Arena</span>
            </Link>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Live <span className="text-orange-500">Standings</span></h1>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 w-20 text-center">Rank</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">User ID</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Solved</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Penalty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {standings.map((row, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6 text-center font-black">{index + 1}</td>
                  <td className="p-6 font-bold text-slate-700">{row.user_id}</td>
                  <td className="p-6 text-center"><span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-black">{row.solved_count}</span></td>
                  <td className="p-6 text-center font-mono text-slate-500">{Math.floor(row.total_penalty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}