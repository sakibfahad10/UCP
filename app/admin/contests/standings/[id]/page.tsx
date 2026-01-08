"use client"

import { useState, useEffect, use } from "react"
import { createClient } from "@/lib/supabase/client"
import { Trophy, Clock, CheckCircle2, XCircle, Minus, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function ContestStandings({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [standings, setStandings] = useState<any[]>([])
  const [problems, setProblems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch contest problems
      const { data: contest } = await supabase.from("contests").select("problems").eq("id", id).single()
      const problemList = contest?.problems || []
      setProblems(problemList)

      // 2. Fetch Leaderboard Data and Status
      const { data: stats } = await supabase
        .from("contest_problem_stats")
        .select(`*, profiles(full_name)`)
        .eq("contest_id", id)

      // Group Data (User wise)
      const grouped = stats?.reduce((acc: any, curr: any) => {
        if (!acc[curr.user_id]) {
          acc[curr.user_id] = { 
            name: curr.profiles?.full_name, 
            solved: 0, 
            tasks: {} 
          }
        }
        acc[curr.user_id].tasks[curr.problem_id] = curr
        if (curr.is_solved) acc[curr.user_id].solved++
        return acc
      }, {})

      setStandings(Object.values(grouped || {}).sort((a: any, b: any) => b.solved - a.solved))
      setLoading(false)
    }
    fetchData()
  }, [id])

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <Link href="/admin/contests" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
          <ChevronLeft size={16} /> Exit Arena
        </Link>
        <div className="text-center">
           <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Live Standings</h1>
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">Real-time Performance Matrix</p>
        </div>
        <div className="w-24" /> {/* Spacer */}
      </div>

      <div className="bg-white border border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest">
              <th className="px-8 py-6">Rank</th>
              <th className="px-6 py-6">Participant</th>
              <th className="px-6 py-6 text-center">Score</th>
              {problems.map((p: any, i: number) => (
                <th key={p.id} className="px-4 py-6 text-center border-l border-white/10">
                  {String.fromCharCode(65 + i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {standings.map((user: any, index: number) => (
              <tr key={index} className="hover:bg-slate-50 transition-all">
                <td className="px-8 py-6 font-black text-slate-300">#{index + 1}</td>
                <td className="px-6 py-6 font-black text-slate-900 uppercase text-xs">{user.name}</td>
                <td className="px-6 py-6 text-center">
                   <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black">{user.solved} AC</span>
                </td>
                {problems.map((p: any) => {
                  const task = user.tasks[p.id];
                  return (
                    <td key={p.id} className="px-2 py-4 border-l border-slate-50 min-w-[80px]">
                      {task ? (
                        <div className={`p-4 rounded-2xl flex flex-col items-center justify-center transition-all ${
                          task.is_solved ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-red-50 text-red-500'
                        }`}>
                          <span className="text-xs font-black">
                            {task.is_solved ? `+${task.wrong_attempts || ''}` : `-${task.wrong_attempts}`}
                          </span>
                          <span className="text-[7px] font-black uppercase opacity-60">
                            {task.is_solved ? 'Success' : 'Failed'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-center text-slate-100">
                           <Minus size={20} />
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}