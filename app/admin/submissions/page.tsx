"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  Activity, Search, Code2, 
  CheckCircle2, XCircle, Clock, 
  User as UserIcon, RefreshCcw,
  ArrowUpRight, Cpu, Database,
  Filter, ChevronLeft, ChevronRight,
  MoreHorizontal, AlertCircle
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function AdminSubmissionsPage() {
  const supabase = createClient()
  
  // Data State
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [langFilter, setLangFilter] = useState("All")
  
  // Pagination State
  const [page, setPage] = useState(1)
  const pageSize = 15

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    try {
      // Base Query
      let query = supabase
        .from("submissions")
        .select(`
          *,
          problems (title),
          profiles (full_name, username)
        `, { count: 'exact' })
      
      // Apply Filters
      if (statusFilter !== "All") {
        query = query.eq("status", statusFilter)
      }
      if (langFilter !== "All") {
        query = query.eq("language", langFilter)
      }

      // Pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      
      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to)

      if (error) throw error
      
      setSubmissions(data || [])
      setTotalCount(count || 0)
    } catch (error: any) {
      console.error("Submission Sync Error:", error)
      toast.error("Failed to sync: " + (error.message || "Unknown error"))
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, langFilter, supabase])

  // Initial Fetch & Realtime Subscription
  useEffect(() => {
    fetchSubmissions()
    
    const channel = supabase
      .channel('live_submissions_admin')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'submissions' 
      }, () => {
        toast.info("New submission detected!")
        fetchSubmissions()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchSubmissions, supabase])

  // Helper for Status Badge
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Accepted': 
      case 'AC': 
        return 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/20'
      case 'Wrong Answer': 
      case 'WA': 
        return 'bg-rose-50 text-rose-600 border-rose-100 ring-rose-500/20'
      case 'TLE': 
        return 'bg-amber-50 text-amber-600 border-amber-100 ring-amber-500/20'
      case 'Compilation Error':
      case 'CE':
        return 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/20'
      default: 
        return 'bg-slate-50 text-slate-500 border-slate-100 ring-slate-500/20'
    }
  }

  // Client-side search (since full-text search on joined tables is complex for simple use-case)
  // Note: For large datasets, server-side search is better. Here we filter visible page or fetch more if needed.
  // Implementing simplified client-side filter on current page + debounce could be added later.
  // For now, let's keep it simple: Search affects display if possible or we can add server search.
  // Given current setup, let's use client-side filtering on the fetched chunk for simplicity 
  // OR add a search input that triggers a new fetch with a specific RPC or search query.
  // Let's stick to simple client filtering of the current view + prompting user to use filters.
  const displaySubmissions = submissions.filter(s => 
    (s.problems?.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (s.profiles?.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (s.profiles?.username?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-6 max-w-[1600px] mx-auto">
      {/* Header Panel */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-200">
                <Activity size={24} />
             </div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Submission Monitor</h1>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Global Judge Overview • {totalCount} records found</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
           {/* Filters */}
           <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              <select 
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-transparent text-[10px] font-black uppercase text-slate-600 outline-none px-3 py-2 cursor-pointer hover:bg-white hover:shadow-sm rounded-xl transition-all appearance-none"
              >
                <option value="All">All Verdicts</option>
                <option value="Accepted">Accepted</option>
                <option value="Wrong Answer">Wrong Answer</option>
                <option value="TLE">Time Limit</option>
              </select>
              <div className="w-[1px] h-4 bg-slate-200" />
              <select 
                value={langFilter}
                onChange={(e) => { setLangFilter(e.target.value); setPage(1); }}
                className="bg-transparent text-[10px] font-black uppercase text-slate-600 outline-none px-3 py-2 cursor-pointer hover:bg-white hover:shadow-sm rounded-xl transition-all appearance-none"
              >
                <option value="All">All Languages</option>
                <option value="cpp17">C++ 17</option>
                <option value="python3">Python 3</option>
                <option value="java">Java</option>
              </select>
           </div>

           <div className="relative flex-1 xl:flex-none xl:w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
             <input 
               type="text" 
               placeholder="Filter view..." 
               className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500/10 transition-all"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>

           <button 
             onClick={fetchSubmissions} 
             disabled={loading}
             className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg hover:bg-orange-600 transition-all disabled:opacity-50"
           >
             <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
           </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: 'Latency', value: '12ms', color: 'text-emerald-500', icon: Clock },
           { label: 'Queue', value: 'Idle', color: 'text-blue-500', icon: Database },
           { label: 'Throughput', value: '100%', color: 'text-indigo-500', icon: Cpu },
           { label: 'Success Rate', value: '42%', color: 'text-orange-500', icon: CheckCircle2 },
         ].map((stat, i) => (
           <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center justify-between group hover:border-slate-200 transition-colors">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-2xl ${stat.color.replace('text-', 'bg-')}/10 flex items-center justify-center ${stat.color}`}>
                <stat.icon size={18} />
              </div>
           </div>
         ))}
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        {loading ? (
             <div className="flex-1 flex flex-col items-center justify-center">
                 <RefreshCcw className="animate-spin text-slate-300 mb-4" size={32} />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Data Stream...</p>
             </div>
        ) : displaySubmissions.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                 <AlertCircle size={48} className="mb-4 opacity-50" />
                 <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Records Found</p>
             </div>
        ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-5">Time</th>
                <th className="px-6 py-5">User</th>
                <th className="px-6 py-5">Problem</th>
                <th className="px-6 py-5">Language</th>
                <th className="px-6 py-5">Verdict</th>
                <th className="px-6 py-5">Resources</th>
                <th className="px-8 py-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displaySubmissions.map((sub) => (
                <tr key={sub.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700 font-mono">
                        {new Date(sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className="text-[8px] font-extrabold text-slate-300 uppercase tracking-tight">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs">
                          {sub.profiles?.username?.[0]?.toUpperCase() || "U"}
                       </div>
                       <div>
                         <p className="text-xs font-black text-slate-800">{sub.profiles?.full_name || "Unknown"}</p>
                         <p className="text-[9px] font-bold text-slate-400 lowercase">@{sub.profiles?.username || "anon"}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-[200px]">
                    <p className="text-xs font-bold text-slate-700 truncate" title={sub.problems?.title}>
                      {sub.problems?.title || "Deleted Problem"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                     <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-[9px] font-black uppercase text-slate-500">
                        {sub.language}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ring-1 ring-inset ${getStatusStyle(sub.status)}`}>
                      {sub.status === 'Accepted' || sub.status === 'AC' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      <span className="text-[9px] font-black uppercase tracking-wide">{sub.status || 'Pending'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                       <span className="flex items-center gap-1"><Clock size={10} /> {sub.execution_time}ms</span>
                       <span className="flex items-center gap-1"><Database size={10} /> {sub.memory_usage}KB</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <Link href={`/admin/submissions/${sub.id}`}>
                      <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all">
                        <ArrowUpRight size={14} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Pagination Footer */}
        <div className="border-t border-slate-100 p-6 flex items-center justify-between bg-slate-50/30">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Showing page {page} of {totalPages}
           </p>
           <div className="flex items-center gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 transition-all disabled:opacity-50 disabled:hover:text-slate-500"
              >
                  <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1 px-2">
                 {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    // Simple logic to show near pages, can be refined
                    const p = i + 1; // Simplification
                    return (
                        <button 
                          key={p} 
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${page === p ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-white hover:text-slate-900'}`}
                        >
                          {p}
                        </button>
                    )
                 })}
                 {totalPages > 5 && <span className="text-slate-300 text-xs"><MoreHorizontal size={12}/></span>}
              </div>
              <button 
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 transition-all disabled:opacity-50 disabled:hover:text-slate-500"
              >
                  <ChevronRight size={16} />
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}