"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Search, Plus, X, Check, Database } from "lucide-react"

export default function ProblemPicker({ selectedIds, onSelectionChange }: { 
  selectedIds: string[], 
  onSelectionChange: (ids: string[]) => void 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [problems, setProblems] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      const fetchProblems = async () => {
        const { data } = await supabase.from("problems").select("id, title, difficulty")
        if (data) setProblems(data)
      }
      fetchProblems()
    }
  }, [isOpen])

  const toggleProblem = (id: string) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id]
    onSelectionChange(newSelection)
  }

  const filteredProblems = problems.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Attached Problems</label>
        <button 
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-orange-600 transition-all"
        >
          <Plus size={14} /> Add Problem
        </button>
      </div>

      {/* Selected Problems List */}
      <div className="flex flex-wrap gap-2">
        {selectedIds.length === 0 ? (
          <p className="text-xs font-bold text-slate-300 uppercase">No problems linked to this arena sequence</p>
        ) : (
          selectedIds.map(id => (
            <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-lg text-orange-700 text-[10px] font-black uppercase">
              {problems.find(p => p.id === id)?.title || "Loading..."}
              <X size={12} className="cursor-pointer" onClick={() => toggleProblem(id)} />
            </div>
          ))
        )}
      </div>

      {/* Modern Modal Interface */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="text-orange-500" size={20} />
                <h3 className="text-lg font-black uppercase tracking-tight">Problem Bank</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  placeholder="Search globally for problems..." 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-orange-500/20 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {filteredProblems.map(problem => (
                  <div 
                    key={problem.id}
                    onClick={() => toggleProblem(problem.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedIds.includes(problem.id) 
                      ? "bg-orange-50 border-orange-200" 
                      : "bg-white border-slate-100 hover:border-orange-200"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{problem.title}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{problem.difficulty}</p>
                    </div>
                    {selectedIds.includes(problem.id) && (
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white">
                        <Check size={14} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-10 py-4 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-orange-600 transition-all"
              >
                Done Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}