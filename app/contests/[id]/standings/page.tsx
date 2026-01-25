"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Header from "@/components/header"
import ArenaNav from "@/components/arena-nav"
import { Loader2, Trophy, Minus, Timer } from "lucide-react"

export default function ContestStandingsPage() {
  const { id } = useParams() as { id: string }
  const [standings, setStandings] = useState<any[]>([])
  const [problems, setProblems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // 1. Fetch contest problems
        const { data: contest } = await supabase
          .from("contests")
          .select("problems")
          .eq("id", id)
          .single()
        
        const problemList = contest?.problems || []
        setProblems(problemList)

        // 2. Fetch Leaderboard Data
        const { data: stats } = await supabase
          .from("contest_problem_stats")
          .select(`*, profiles(full_name, avatar_url)`)
          .eq("contest_id", id)

        // Group Data (User wise)
        const grouped = stats?.reduce((acc: any, curr: any) => {
          if (!acc[curr.user_id]) {
            acc[curr.user_id] = { 
              name: curr.profiles?.full_name || "Unknown Warrior",
              avatar_url: curr.profiles?.avatar_url,
              solved: 0, 
              total_penalty: 0,
              tasks: {} 
            }
          }
          acc[curr.user_id].tasks[curr.problem_id] = curr
          if (curr.is_solved) {
            acc[curr.user_id].solved++
            // ICPC style penalty calculation (time + 20*wrong_attempts)
            // Assuming time_to_solve is in minutes and penalty_per_wrong is 20
            acc[curr.user_id].total_penalty += (curr.time_to_solve || 0) + (curr.wrong_attempts || 0) * 20
          }
          return acc
        }, {})

        // Sort by solved (desc) then penalty (asc)
        const sortedStandings = Object.values(grouped || {}).sort((a: any, b: any) => {
          if (b.solved !== a.solved) return b.solved - a.solved
          return a.total_penalty - b.total_penalty
        })

        setStandings(sortedStandings)
      } catch (err) {
        console.error("Error fetching standings:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, supabase])

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Calculating Leaderboard...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ArenaNav id={id} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">Leaderboard</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">The elite matrix of performance and speed</p>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="bg-white border border-slate-100 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
                <Trophy className="text-orange-500" size={18} />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">
                  {standings.length} Warriors
                </span>
             </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[9px] font-black tracking-[0.2em]">
                  <th className="px-8 py-6 w-24">Rank</th>
                  <th className="px-6 py-6">Warrior</th>
                  <th className="px-6 py-6 text-center w-32">Score</th>
                  <th className="px-6 py-6 text-center w-32">Penalty</th>
                  {problems.map((p: any, i: number) => (
                    <th key={p} className="px-4 py-6 text-center border-l border-white/10 w-24">
                      {String.fromCharCode(65 + i)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {standings.map((user: any, index: number) => (
                  <tr key={index} className="hover:bg-slate-50 transition-all font-medium">
                    <td className="px-8 py-8 font-black text-slate-300 text-xl">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-8">
                       <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full border-2 border-slate-100" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                               <Trophy size={16} />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase leading-none">{user.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Certified Competitor</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-8 text-center">
                       <span className={`inline-block px-4 py-2 rounded-full text-[11px] font-black shadow-sm ${
                         user.solved > 0 ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-slate-100 text-slate-400'
                       }`}>
                         {user.solved} AC
                       </span>
                    </td>
                    <td className="px-6 py-8 text-center text-xs font-bold text-slate-500">
                      {user.total_penalty}
                    </td>
                    {problems.map((p: any) => {
                      const task = user.tasks[p];
                      return (
                        <td key={p} className="px-2 py-8 border-l border-slate-50">
                          {task ? (
                            <div className={`p-4 rounded-3xl flex flex-col items-center justify-center transition-all ${
                              task.is_solved 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                : 'bg-rose-50 text-rose-500 border border-rose-100'
                            }`}>
                              <span className="text-xs font-black">
                                {task.is_solved ? `+${task.wrong_attempts || ''}` : `-${task.wrong_attempts}`}
                              </span>
                              {task.is_solved && (
                                <span className="text-[8px] font-black uppercase opacity-60 flex items-center gap-1 mt-1">
                                  <Timer size={8} /> {task.time_to_solve}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex justify-center text-slate-200">
                               <Minus size={20} />
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}

                {standings.length === 0 && (
                  <tr>
                    <td colSpan={problems.length + 4} className="px-8 py-32 text-center">
                       <p className="text-slate-300 font-black uppercase text-[11px] tracking-[0.4em]">Leaderboard is empty. Be the first to strike.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
