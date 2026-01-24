"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  Users, Trophy, Code2, Activity, 
  Plus, Terminal, Timer, 
  ChevronRight, Bell, ShieldCheck, 
  ArrowUpRight, Globe, Layers, Search, Loader2
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any[]>([])
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchRealtimeStats()

    // Real-time listener for recent submissions
    const channel = supabase
      .channel('admin_live_updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions' }, () => {
        fetchRealtimeStats()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchRealtimeStats() {
    try {
      // 1. Total User Count
      const { count: userCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true })
      
      // 2. Total Submission Count
      const { count: subCount } = await supabase.from("submissions").select("*", { count: 'exact', head: true })

      // 3. Fetch Recent Submissions Data (Join with Profiles)
      const { data: recent } = await supabase
        .from("submissions")
        .select(`*, profiles:user_id (username, display_name)`)
        .order("created_at", { ascending: false })
        .limit(6)

      setRecentSubmissions(recent || [])
      
      setStats([
        { label: "Total Architects", value: userCount?.toLocaleString() || "0", trend: "Users", icon: Users, color: "text-blue-600" },
        { label: "Active Sessions", value: "Live", trend: "Live", icon: Globe, color: "text-green-600" },
        { label: "Total Submissions", value: subCount?.toLocaleString() || "0", trend: "All Time", icon: Code2, color: "text-orange-600" },
        { label: "System Status", value: "99.9%", trend: "Stable", icon: Activity, color: "text-indigo-600" },
      ])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-900" size={32} />
    </div>
  )

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      <header className="border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xs">UCP</span>
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-widest text-slate-900">Admin Console</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Live Orchestrator</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/problems/new" className="h-10 px-5 bg-slate-900 hover:bg-orange-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center gap-2">
              <Plus size={16} strokeWidth={3} /> New Problem
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-12">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">
            System <span className="text-orange-500">Overview</span>.
          </h2>
          <p className="text-slate-500 font-medium text-sm">Real-time monitoring enabled. Syncing with Supabase Cloud.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.trend}</span>
              </div>
              <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-slate-900" />
                <h3 className="text-sm font-black uppercase tracking-widest">Live Activity Feed</h3>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-900">
                          @{sub.profiles?.username || "anonymous"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-[9px] font-black uppercase rounded-md border ${
                          sub.status === 'AC' 
                            ? "bg-green-50 text-green-700 border-green-100" 
                            : "bg-red-50 text-red-700 border-red-100"
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-black text-slate-700">+{sub.score}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[10px] font-bold text-slate-400">
                          {new Date(sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-slate-200">
              <div className="relative z-10">
                <Timer size={24} className="text-orange-400 mb-6" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Global Leaderboard</p>
                <h4 className="text-xl font-black uppercase tracking-tight mb-6">Top Architect</h4>
                <div className="pt-6 border-t border-white/10">
                   <p className="text-xs font-bold text-slate-400 uppercase mb-2">Syncing Ranking...</p>
                   <Link href="/leaderboard" className="inline-flex items-center gap-2 text-[10px] font-black text-orange-500 uppercase tracking-widest hover:text-white transition-colors">
                      View Global Rankings <ArrowUpRight size={14} />
                   </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}