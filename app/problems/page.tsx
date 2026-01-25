"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
 // Update line 5 like this
import Header from "@/components/header"
import { 
  Search, Code2, CheckCircle2, 
  ChevronRight, Filter, Star, Hash, Loader2
} from "lucide-react"
import Link from "next/link"

export default function UserProblemListPage() {
  const [problems, setProblems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true)
      const { data } = await supabase
        .from("problems")
        .select("*")
        .eq("hidden", false) // Filter hidden problems
        .order("created_at", { ascending: false })
      
      setProblems(data || [])
      setLoading(false)
    }
    fetchProblems()
  }, [])

  // Search and Filter Logic
  const filtered = problems.filter(p => {
    const matchesFilter = filter === "All" || p.difficulty === filter;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  })

  return (
    <div className="min-h-screen bg-white">
      {/* --- Navbar Section --- */}
      <Header /> 

      {/* --- Main Content Section --- */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header Title Section */}
        <div className="mb-12 space-y-4">
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase ">
            Algorithm <span className="text-orange-500 underline decoration-black underline-offset-8">Bank</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em]">
            Master your logic by solving curated competitive tasks
          </p>
        </div>

        {/* Action Bar: Search & Filter */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text" 
              placeholder="Search problems by title..." 
              className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/5 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100">
            {["All", "Easy", "Medium", "Hard"].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  filter === level 
                  ? "bg-slate-900 text-white shadow-lg" 
                  : "bg-white text-slate-400 hover:text-slate-900 border border-slate-50"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Problem Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
             <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Task Repository...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">No Problems Found</h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Try changing your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((problem) => (
              <Link 
                href={`/problems/${problem.id}`} 
                key={problem.id}
                className="group relative bg-white border border-slate-100 p-8 rounded-[3rem] hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden"
              >
                {/* Difficulty Badge */}
                <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-[2rem] text-[8px] font-black uppercase text-white ${
                  problem.difficulty === 'Easy' ? 'bg-green-500' : 
                  problem.difficulty === 'Medium' ? 'bg-orange-500' : 'bg-red-500'
                }`}>
                  {problem.difficulty}
                </div>

                <div className="mb-8">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                    <Code2 size={20} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-3 group-hover:text-orange-600 transition-colors">
                    {problem.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                     {problem.tags?.map((tag: string) => (
                       <span key={tag} className="text-[8px] font-black text-slate-400 uppercase tracking-tighter bg-slate-50 px-2 py-1 rounded">
                         #{tag}
                       </span>
                     ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                  <div className="flex flex-col">
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Potential Points</span>
                     <span className="text-lg font-black text-slate-900">{problem.points || 100} XP</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase group-hover:bg-orange-600 transition-all">
                    Solve <ChevronRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}