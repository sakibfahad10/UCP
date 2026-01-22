"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  Activity, Search, Code2, 
  CheckCircle2, XCircle, Clock, 
  User as UserIcon, RefreshCcw,
  ArrowUpRight, Cpu, Database
} from "lucide-react" // এখানে lucide-react হবে
import Link from "next/link"
import { toast } from "sonner"

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()

  useEffect(() => {
    fetchSubmissions()
    
    const channel = supabase
      .channel('live_submissions')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'submissions' 
      }, () => {
        fetchSubmissions()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select(`
          *,
          problems (title),
          profiles (full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) {
        // Fallback: If join fails, fetch basic data
        const { data: basicData, error: basicError } = await supabase
          .from("submissions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100)
        
        if (basicError) throw basicError
        setSubmissions(basicData || [])
      } else {
        setSubmissions(data || [])
      }
    } catch (error: any) {
      console.error("Submission Sync Error:", error)
      toast.error("Failed to sync: " + (error.message || "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Accepted': return 'bg-green-50 text-green-600 border-green-100'
      case 'Wrong Answer': return 'bg-red-50 text-red-600 border-red-100'
      case 'TLE': return 'bg-orange-50 text-orange-600 border-orange-100'
      default: return 'bg-slate-50 text-slate-500 border-slate-100'
    }
  }

  const filteredSubmissions = submissions.filter(s => 
    (s.problems?.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (s.profiles?.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (s.status?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500 rounded-xl text-white shadow-lg shadow-orange-100">
               <Activity size={20} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Live Submissions</h1>
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Monitoring Judge Network Activity</p>
        </div>
        
        <button 
          onClick={fetchSubmissions}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> Refresh Feed
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: submissions.length, icon: <Database size={14}/> },
          { label: 'Accepted', value: submissions.filter(s => s.status === 'Accepted').length, icon: <CheckCircle2 size={14} className="text-green-500"/> },
          { label: 'Latency', value: 'Active', icon: <Clock size={14}/> },
          { label: 'System', value: 'Stable', icon: <Cpu size={14}/> },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              {stat.icon}
              <span className="text-[8px] font-black uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className="text-xl font-black text-slate-900 leading-none">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-100 p-4 rounded-[2rem] shadow-sm">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Search activity..." 
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-[1.5rem] text-xs font-bold outline-none focus:ring-4 focus:ring-orange-500/5"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-6">Timestamp</th>
                <th className="px-6 py-6 text-white">Participant</th>
                <th className="px-6 py-6 text-white">Task</th>
                <th className="px-6 py-6">Result</th>
                <th className="px-6 py-6">Performance</th>
                <th className="px-8 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                    Scanning Judge Network...
                  </td>
                </tr>
              ) : filteredSubmissions.map((sub) => (
                <tr key={sub.id} className="group hover:bg-slate-50/80 transition-all border-l-4 border-l-transparent hover:border-l-orange-500">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-900">
                        {new Date(sub.created_at).toLocaleTimeString()}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                        <UserIcon size={12} />
                      </div>
                      <span className="text-xs font-black text-slate-700 uppercase">
                        {sub.profiles?.full_name || 'Anonymous'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-600">{sub.problems?.title || 'Unknown Task'}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase">{sub.language}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${getStatusStyle(sub.status)}`}>
                      {sub.status === 'Accepted' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {sub.status || 'Pending'}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-slate-400 text-[10px] font-bold italic">
                    {sub.execution_time || 0}ms / {sub.memory_usage || 0}kb
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link href={`/admin/submissions/${sub.id}`}>
                      <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-orange-600 transition-all">
                        <ArrowUpRight size={18} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}