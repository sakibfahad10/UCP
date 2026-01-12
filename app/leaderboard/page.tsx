"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Header from "@/components/header"
import { 
  Trophy, Search, Loader2, 
  Globe, Zap, BellRing, 
  ArrowUpRight
} from "lucide-react"
import { toast } from "sonner"
import UserAvatar from "@/components/user-avatar"

export default function LeaderboardSystem() {
  const [activeTab, setActiveTab] = useState<"global" | "running">("global")
  const [standings, setStandings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()

  // ১. লিডারবোর্ড ডাটা ফেচ করার আপডেট করা ফাংশন
  const fetchStandings = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id, 
          username, 
          avatar_url,
          submissions(status, score)
        `)

      if (error) throw error

      if (data) {
        const processed = data
          .map((user: any) => {
            // সাবমিশন না থাকলে খালি অ্যারে সেট করা (প্রিভেন্ট ক্রাশ)
            const subs = user.submissions || []
            const solved = subs.filter((s: any) => s.status === 'AC').length
            const totalScore = subs.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0)
            
            return { 
              ...user, 
              solved, 
              totalScore 
            }
          })
          // শুধু ইউজারনেম আছে এমন প্রোফাইল দেখানো এবং স্কোর অনুযায়ী সর্ট করা
          .filter(user => user.username)
          .sort((a, b) => b.totalScore - a.totalScore || b.solved - a.solved)

        setStandings(processed)
      }
    } catch (err: any) {
      console.error("Leaderboard Fetch Error:", err.message)
    }
  }

  // ২. রিয়েল-টাইম লিসেনার এবং ইনিশিয়াল ফেচ
  useEffect(() => {
    const init = async () => {
      await fetchStandings()
      setLoading(false)
    }
    init()

    const channel = supabase
      .channel('realtime_leaderboard')
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'submissions' }, 
        async (payload) => {
          await fetchStandings()
          
          if (payload.new.status === 'AC') {
            toast.custom((t) => (
              <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center gap-4 shadow-2xl border border-orange-500/30 animate-in slide-in-from-right">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                  <Trophy size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">New Achievement</p>
                  <p className="text-xs font-bold italic">A contender just solved a challenge!</p>
                </div>
                <ArrowUpRight size={16} className="text-slate-500" />
              </div>
            ))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // সার্চ ফিল্টারিং লজিক
  const filteredStandings = standings.filter(user => 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-orange-100">
      <Header />
      
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24">
        <div className="flex items-center gap-2 mb-8 bg-orange-50 w-fit px-4 py-2 rounded-full border border-orange-100">
          <BellRing size={12} className="text-orange-500 animate-bounce" />
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-orange-600">Live Sync Active</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">
              The <span className="text-orange-500 underline decoration-slate-200 decoration-4">Grid</span>
            </h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">Real-time Performance Metrics</p>
          </div>

          <div className="flex p-1.5 bg-slate-100 rounded-2xl">
            <button 
              onClick={() => setActiveTab("global")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "global" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400"}`}
            >
              <Globe size={14} /> Global
            </button>
            <button 
              onClick={() => setActiveTab("running")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "running" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400"}`}
            >
              <Zap size={14} /> Running
            </button>
          </div>
        </div>

        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            type="text" 
            placeholder="Search by username..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-orange-500/10 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-orange-500" size={32} />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Nodes...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Pos</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contender</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Score</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStandings.map((user, index) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-10 py-8 text-center">
                      <span className={`text-lg font-black italic ${index < 3 ? 'text-orange-500' : 'text-slate-200'}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <UserAvatar 
                          avatarUrl={user.avatar_url}
                          name={user.username}
                          size="md"
                          className="w-12 h-12 rounded-2xl border border-slate-100 group-hover:border-orange-200 transition-colors"
                        />
                        <div>
                          <p className="text-sm font-black uppercase italic text-slate-800 tracking-tight">{user.username}</p>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ranked Member</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <div className="inline-flex flex-col">
                          <span className="text-lg font-black text-slate-900">{user.totalScore}</span>
                          <span className="text-[8px] font-black text-green-500 uppercase">{user.solved} Solved</span>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStandings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                      No contenders found on the grid
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}