"use client"

import { useState, useEffect, use } from "react"
import { createClient } from "@/lib/supabase/client"
import Header from "@/components/header"
import { 
  ChevronRight, 
  Code2, 
  Clock, 
  Database, 
  Tag as TagIcon, 
  BarChart3, 
  ArrowLeft,
  CheckCircle2,
  Copy
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function ProblemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const [problem, setProblem] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProblem = async () => {
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .eq("id", id)
        .single()

      if (data) setProblem(data)
      setLoading(false)
    }
    fetchProblem()
  }, [id])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  if (loading) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Task...</p>
    </div>
  )

  if (!problem) return <div className="p-20 text-center font-bold text-slate-400 uppercase tracking-widest">Problem not found in engine.</div>

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 lg:p-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 mb-10">
          <Link href="/problems" className="text-slate-400 hover:text-slate-900 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="h-4 w-[1px] bg-slate-200 mx-1" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Problems</span>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 truncate max-w-[200px]">{problem.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">{problem.title}</h1>
                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' : 
                  problem.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {problem.difficulty}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-8">
                {problem.tags?.map((tag: string) => (
                  <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <TagIcon size={10} /> {tag}
                  </span>
                ))}
              </div>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                  {problem.statement}
                </p>
              </div>
            </section>

            {/* Constraints & Specs */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Clock size={14} className="text-orange-500" /> Time Limit
                 </h4>
                 <p className="text-xl font-bold text-slate-900">1000ms <span className="text-slate-300 font-medium">/ testcase</span></p>
              </div>
              <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Database size={14} className="text-blue-500" /> Memory Limit
                 </h4>
                 <p className="text-xl font-bold text-slate-900">256MB <span className="text-slate-300 font-medium">/ heap</span></p>
              </div>
            </section>

            {/* Sample Examples */}
            <section className="space-y-6">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <CheckCircle2 size={18} className="text-emerald-500" /> Sample Execution
               </h3>
               <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                    <div className="p-8">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Input Stream</span>
                        <button onClick={() => copyToClipboard(problem.sample_input)} className="text-slate-600 hover:text-white transition-colors"><Copy size={14}/></button>
                      </div>
                      <pre className="font-mono text-sm text-blue-400">{problem.sample_input || "No input required"}</pre>
                    </div>
                    <div className="p-8 bg-slate-800/20">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expected Output</span>
                        <button onClick={() => copyToClipboard(problem.sample_output)} className="text-slate-600 hover:text-white transition-colors"><Copy size={14}/></button>
                      </div>
                      <pre className="font-mono text-sm text-emerald-400">{problem.sample_output}</pre>
                    </div>
                  </div>
               </div>
            </section>
          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Code2 size={32} className="text-slate-900" />
              </div>
              <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter mb-2">Ready to Code?</h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8">Submit your solution to the judge</p>
              
              <Link 
                href={`/problems/${id}/solve`}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-orange-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Attempt Challenge <ChevronRight size={14} strokeWidth={3} />
              </Link>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem]">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 size={18} className="text-slate-400" />
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance Stats</h5>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Success Rate</span>
                  <span className="text-xs font-black text-slate-900">68%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Submissions</span>
                  <span className="text-xs font-black text-slate-900">1,204</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}