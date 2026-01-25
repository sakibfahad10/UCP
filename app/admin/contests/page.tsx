"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  Plus, Search, Edit3, Trash2, 
  ExternalLink, Trophy, Calendar, 
  Filter, Loader2, AlertCircle,
  Database 
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function AdminContestLobby() {
  const [contests, setContests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()

  useEffect(() => {
    async function fetchContests() {
      try {
        setLoading(true)
        // FIX: Used relationship (problems(id)) instead of direct 'problems' column
        const { data, error } = await supabase
          .from("contests")
          .select(`
            id, 
            title, 
            start_time, 
            end_time, 
            created_at,
            problems(id)
          `)
          .order("created_at", { ascending: false })

        if (error) throw error
        setContests(data || [])
      } catch (err: any) {
        console.error("Fetch Error:", err.message)
        toast.error("Failed to load arenas: " + err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchContests()
  }, [supabase])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to decommission this arena?")) return
    
    try {
      const { error } = await supabase.from("contests").delete().eq("id", id)
      if (error) throw error
      setContests(contests.filter(c => c.id !== id))
      toast.success("Arena deleted from system")
    } catch (err: any) {
      toast.error("Deletion failed: " + err.message)
    }
  }

  const filteredContests = contests.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Initializing Admin Panel...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 md:p-12">
      {/* Header section starts */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-slate-900 text-white px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest">
                Admin Terminal
              </span>
              <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                <Database size={12}/> v2.0.4
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-slate-900 leading-none">
              Manage <span className="text-orange-500 underline decoration-slate-200">Arenas</span>
            </h1>
          </div>

          <Link 
            href="/admin/contests/create" 
            className="bg-slate-900 text-white px-8 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-orange-500 transition-all shadow-2xl shadow-slate-200 flex items-center gap-3 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            Deploy New Arena
          </Link>
        </div>
      </div>
      {/* Header section ends */}

      {/* Table section */}
      <div className="max-w-7xl mx-auto bg-white border border-slate-200 rounded-[3rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Arena Identity</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule (UTC)</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payload</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredContests.length > 0 ? filteredContests.map((contest) => (
                <tr key={contest.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900 font-black text-sm group-hover:bg-orange-500 group-hover:text-white transition-all">
                        {contest.title.substring(0, 1)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{contest.title}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {contest.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-600 uppercase flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> 
                        {new Date(contest.start_time).toLocaleDateString()}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        {new Date(contest.start_time).toLocaleTimeString()} - {new Date(contest.end_time).toLocaleTimeString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg">
                      <Database size={10} className="text-slate-400" />
                      <span className="text-[9px] font-black text-slate-600 uppercase">
                        {/* contest.problems is now an array because used problems(id) query */}
                        {contest.problems ? contest.problems.length : 0} Tasks
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/contests/edit/${contest.id}`}
                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition-all"
                      >
                        <Edit3 size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(contest.id)}
                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-rose-600 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400">No arenas found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}