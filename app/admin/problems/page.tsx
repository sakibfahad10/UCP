"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  Plus, Search, Database, Edit2, Trash2, 
  Tag, Loader2, AlertCircle, LayoutGrid, List,
  ArrowUpRight, BarChart3, ChevronRight, Eye, EyeOff
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function ProblemBankPage() {
  const [problems, setProblems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()

  useEffect(() => {
    fetchProblems()
  }, [])

  const fetchProblems = async () => {
    try {
      setLoading(true)
      // FIX: Used .select("*") directly without extra filters
      // If error occurs, it might be due to Supabase cache or column name issues.
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }
      setProblems(data || [])
    } catch (error: any) {
      console.error("Database Error:", error.message)
      toast.error("Failed to load problems. Check console for details.")
    } finally {
      setLoading(false)
    }
  }

  const deleteProblem = async (id: string) => {
    if (!confirm("Are you sure? This action will also wipe all linked testcases.")) return
    
    const { error } = await supabase.from("problems").delete().eq("id", id)
    if (error) {
      toast.error("Purge failed: " + error.message)
    } else {
      toast.success("Problem successfully removed")
      setProblems(prev => prev.filter(p => p.id !== id))
    }
  }

  const toggleVisibility = async (id: string, currentHidden: boolean) => {
    const newHidden = !currentHidden
    
    // Optimistic update
    setProblems(prev => prev.map(p => 
      p.id === id ? { ...p, hidden: newHidden } : p
    ))

    const { error } = await supabase
      .from("problems")
      .update({ hidden: newHidden })
      .eq("id", id)

    if (error) {
      // Revert if failed
      setProblems(prev => prev.map(p => 
        p.id === id ? { ...p, hidden: currentHidden } : p
      ))
      toast.error("Failed to update visibility")
    } else {
      toast.success(newHidden ? "Problem hidden from public" : "Problem visible to public")
    }
  }

  // search logic handle (checking if values exist to avoid crashes)
  const filteredProblems = problems.filter(p => {
    const title = p.title?.toLowerCase() || ""
    const difficulty = p.difficulty?.toLowerCase() || ""
    const query = searchQuery.toLowerCase()
    return title.includes(query) || difficulty.includes(query)
  })

  const stats = {
    total: problems.length,
    easy: problems.filter(p => p.difficulty === 'Easy').length,
    medium: problems.filter(p => p.difficulty === 'Medium').length,
    hard: problems.filter(p => p.difficulty === 'Hard').length
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* --- Section 1: Header & Stats --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Problem Bank</h1>
          <div className="flex items-center gap-4 mt-4">
             <div className="flex items-center gap-2 bg-slate-900 text-[10px] font-black text-white px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-slate-200">
                <BarChart3 size={12} className="text-orange-500" />
                {stats.total} Total Tasks
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l pl-4 border-slate-200">Repository Live</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="px-4 py-2 bg-green-50 border border-green-100 rounded-2xl">
             <p className="text-[8px] font-black text-green-600 uppercase">Easy</p>
             <p className="text-sm font-black text-slate-900">{stats.easy}</p>
          </div>
          <div className="px-4 py-2 bg-orange-50 border border-orange-100 rounded-2xl">
             <p className="text-[8px] font-black text-orange-600 uppercase">Medium</p>
             <p className="text-sm font-black text-slate-900">{stats.medium}</p>
          </div>
          <div className="px-4 py-2 bg-red-50 border border-red-100 rounded-2xl">
             <p className="text-[8px] font-black text-red-600 uppercase">Hard</p>
             <p className="text-sm font-black text-slate-900">{stats.hard}</p>
          </div>
          <Link 
            href="/admin/problems/new" 
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-2xl shadow-slate-200 hover:bg-orange-600 transition-all hover:-translate-y-1 active:scale-95 ml-2"
          >
            <Plus size={18} strokeWidth={4} />
            Initialize New Task
          </Link>
        </div>
      </div>

      {/* --- Section 2: Command Center --- */}
      <div className="bg-white border border-slate-100 p-5 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="Search by title or difficulty..." 
            className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-[1.8rem] text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500/10 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* --- Section 3: Grid Display --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Archive...</p>
        </div>
      ) : filteredProblems.length === 0 ? (
        <div className="text-center py-32 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
           <Database className="text-slate-200 mx-auto mb-4" size={48} />
           <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">No Records Found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProblems.map((problem) => (
            <div key={problem.id} className="group bg-white border border-slate-100 p-8 rounded-[3rem] hover:shadow-2xl transition-all duration-500 relative flex flex-col min-h-[320px]">
              
              <div className="flex justify-between items-start mb-8">
                <div className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase border ${
                  problem.difficulty === 'Easy' ? 'bg-green-50 text-green-600 border-green-100' : 
                  problem.difficulty === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                  'bg-red-50 text-red-600 border-red-100'
                }`}>
                  {problem.difficulty}
                </div>
                {problem.hidden && (
                   <div className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase rounded-lg tracking-widest flex items-center gap-1">
                      <EyeOff size={10} /> Hidden
                   </div>
                )}
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleVisibility(problem.id, problem.hidden)}
                    className={`p-3 border text-slate-400 rounded-xl transition-all ${
                      problem.hidden 
                        ? "bg-slate-100 border-slate-200 hover:bg-slate-200" 
                        : "bg-white border-slate-100 hover:text-blue-600"
                    }`}
                    title={problem.hidden ? "Unhide Problem" : "Hide Problem"}
                  >
                    {problem.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <Link href={`/admin/problems/edit/${problem.id}`} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-orange-500 transition-all">
                    <Edit2 size={14} />
                  </Link>
                  <button onClick={() => deleteProblem(problem.id)} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-red-600 rounded-xl transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <div className="mb-6 flex-1">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-3 group-hover:text-orange-600 transition-colors">
                  {problem.title}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   Points: {problem.points || 0}
                </p>
              </div>

              <Link href={`/problems/${problem.id}`} className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                 <span className="text-[9px] font-black uppercase text-slate-400">View Details</span>
                 <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-orange-500 group-hover:text-white transition-all">
                   <ArrowUpRight size={18} />
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}