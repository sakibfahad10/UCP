"use client"

import { useState, useEffect, use } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Trophy,
  Medal,
  Crown,
  Timer,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Minus,
  User as UserIcon
} from "lucide-react"
import UserAvatar from "@/components/user-avatar"

export default function ContestLeaderboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const supabase = createClient()

  const [standings, setStandings] = useState<any[]>([])
  const [problems, setProblems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch contest problems
        const { data: contest, error: contestError } = await supabase
          .from("contests")
          .select("problems")
          .eq("id", resolvedParams.id)
          .single()

        if (contestError) throw contestError

        // Ensure problems is an array (handle jsonb)
        const problemList = Array.isArray(contest?.problems) ? contest.problems : []
        setProblems(problemList)

        // 2. Fetch submissions for this contest
        // We need to fetch submissions that belong to the problems of this contest
        // and occurred between start and end time (optional refinement)
        // For now, simpler approach: fetch submissions linked to these problems
        if (problemList.length > 0) {
            const { data: subs, error: subError } = await supabase
            .from("submissions")
            .select(`
                *,
                profiles (username, display_name, avatar_url)
            `)
            .in("problem_id", problemList)
            // .gte("created_at", contest_start_time) // If exact contest window needed
            
            if (subError) throw subError

            // 3. Process Standings
            const leaderboard: Record<string, any> = {}

            subs?.forEach((sub: any) => {
                if (!sub.user_id) return

                if (!leaderboard[sub.user_id]) {
                    leaderboard[sub.user_id] = {
                        userId: sub.user_id,
                        user: sub.profiles,
                        totalScore: 0,
                        solvedCount: 0,
                        problems: {}
                    }
                }

                const entry = leaderboard[sub.user_id]
                const probId = sub.problem_id

                if (!entry.problems[probId]) {
                    entry.problems[probId] = {
                        attempts: 0,
                        isSolved: false,
                        score: 0,
                        penalty: 0
                    }
                }

                const pStats = entry.problems[probId]

                // Simple logic: If already solved, ignore further
                if (pStats.isSolved) return

                pStats.attempts += 1

                if (sub.status === "AC" || sub.status === "Accepted") {
                    pStats.isSolved = true
                    pStats.score = 100 // Or fetch points from problem table
                    // Add to total
                    entry.totalScore += pStats.score
                    entry.solvedCount += 1
                } else {
                    // Wrong answer logic could add penalty
                    pStats.penalty += 20 
                }
            })

            // Convert to array and sort
            const sortedStandings = Object.values(leaderboard).sort((a: any, b: any) => {
                // Primary: Score (Desc)
                if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore
                // Secondary: Solved Count (Desc)
                return b.solvedCount - a.solvedCount
            })

            setStandings(sortedStandings)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams.id, supabase])

  const filteredStandings = standings.filter((s) =>
    s.user?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-[600px] grid place-items-center bg-white/50">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent p-4 selection:bg-orange-100 selection:text-orange-900">
      {/* Header / Stats */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-sm">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <Crown className="text-orange-500 fill-orange-500" size={24} />
             <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Live Standings</h1>
           </div>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-9">Real-time Ranking Protocol</p>
        </div>
        
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search participant..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-24">Rank</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Participant</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Score</th>
                {problems.map((p: any, idx: number) => (
                  <th key={idx} className="px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center min-w-[80px]">
                    P{idx + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStandings.length > 0 ? (
                filteredStandings.map((entry, index) => (
                  <tr key={entry.userId} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-6">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                        index === 0 ? "bg-amber-100 text-amber-600" :
                        index === 1 ? "bg-slate-100 text-slate-600" :
                        index === 2 ? "bg-orange-50 text-orange-700" :
                        "text-slate-400"
                      }`}>
                        {index === 0 ? "1" : index === 1 ? "2" : index === 2 ? "3" : `#${index + 1}`}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <UserAvatar 
                          avatarUrl={entry.user?.avatar_url}
                          name={entry.user?.display_name || entry.user?.username}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-black text-slate-800">{entry.user?.display_name || "Unknown Architect"}</p>
                          <p className="text-[10px] font-bold text-slate-400 lowercase">@{entry.user?.username || "user"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                       <div className="inline-flex flex-col">
                         <span className="text-sm font-black text-orange-600">{entry.totalScore}</span>
                         <span className="text-[9px] font-bold text-slate-400 uppercase">{entry.solvedCount} Solved</span>
                       </div>
                    </td>
                    {problems.map((pId: string, idx: number) => {
                        const status = entry.problems[pId]
                        return (
                          <td key={idx} className="px-4 py-6 text-center">
                            {status ? (
                                <div className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                                    status.isSolved 
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                    : "bg-red-50 text-red-400 border border-red-50"
                                }`}>
                                    <span className="text-xs font-black">{status.isSolved ? <CheckCircle2 size={14}/> : <XCircle size={14}/>}</span>
                                    {status.attempts > 1 && (
                                        <span className="text-[8px] font-bold mt-1">-{status.attempts - 1} try</span>
                                    )}
                                </div>
                            ) : (
                                <div className="flex justify-center">
                                    <Minus size={14} className="text-slate-200" />
                                </div>
                            )}
                          </td>
                        )
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={3 + problems.length} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center justify-center opacity-50">
                        <Trophy size={48} className="text-slate-300 mb-4" />
                        <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Scoreboard Empty</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2">Waiting for the first courageous attempt...</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}