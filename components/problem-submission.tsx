"use client"

import { useState } from "react"
import { 
  Play, CheckCircle2, AlertCircle, Code2, 
  Terminal, Copy, Zap, History, ChevronRight,
  Maximize2, RefreshCcw, Command
} from "lucide-react"

export default function ProblemSubmission({ problem }: { problem: any }) {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("cpp")
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle")
  const [activeTab, setActiveTab] = useState<"description" | "output">("description")

  const handleSubmit = async () => {
    setStatus("running")
    // API Simulation
    setTimeout(() => setStatus("success"), 2000)
  }

  return (
    <div className="flex flex-col lg:flex-row h-[750px] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100">
      
      {/* 1. LEFT PANEL: Description & Test Cases (40% Width) */}
      <div className="lg:w-[40%] border-r border-slate-100 flex flex-col bg-white">
        {/* Tab Switcher */}
        <div className="flex p-2 bg-slate-50/50 gap-1 border-b border-slate-100">
          <button 
            onClick={() => setActiveTab("description")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black transition-all ${activeTab === 'description' ? 'bg-white text-orange-500 shadow-sm border border-slate-100' : 'text-slate-400'}`}
          >
            <BookOpen size={14} /> PROBLEM
          </button>
          <button 
             onClick={() => setActiveTab("output")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black transition-all ${activeTab === 'output' ? 'bg-white text-orange-500 shadow-sm border border-slate-100' : 'text-slate-400'}`}
          >
            <History size={14} /> SUBMISSIONS
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Context Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-orange-100">
              <Zap size={10} fill="currentColor" /> Active Challenge
            </div>

            <section>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Case Analysis</h2>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Implement an optimized solution for <span className="text-slate-900 font-bold">"{problem.title}"</span>. 
                Pay close attention to memory usage limits.
              </p>
            </section>

            {/* Test Case Interface */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Terminal size={14} /> Input/Output Specs
                </h3>
              </div>

              <div className="bg-slate-50 rounded-[2rem] border border-slate-100 p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Standard Input</label>
                    <button className="text-slate-300 hover:text-orange-500 transition-colors"><Copy size={12}/></button>
                  </div>
                  <pre className="bg-white p-4 rounded-2xl border border-slate-200 font-mono text-xs text-slate-700 shadow-sm">
                    {problem.sample_input || "No stdin required"}
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[9px] font-black text-emerald-600/70 uppercase tracking-tighter">Expected Result</label>
                  </div>
                  <pre className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100 font-mono text-xs text-emerald-700 shadow-sm">
                    {problem.sample_output}
                  </pre>
                </div>
              </div>
            </section>

            {/* Note Card */}
            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-3">
               <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
               <p className="text-[11px] font-bold text-blue-600/80 leading-relaxed italic">
                 "Optimization tip: Use fast I/O for large datasets to stay within time constraints."
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RIGHT PANEL: IDE & Action (60% Width) */}
      <div className="lg:w-[60%] flex flex-col bg-slate-50/30">
        
        {/* Editor Toolbar */}
        <div className="h-16 px-6 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent border-none text-[10px] font-black px-4 py-1.5 focus:ring-0 cursor-pointer text-slate-600 uppercase"
              >
                <option value="cpp">C++ 17</option>
                <option value="python">Python 3</option>
                <option value="java">Java 11</option>
              </select>
            </div>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <button className="text-slate-400 hover:text-slate-600 transition-colors"><RefreshCcw size={14}/></button>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                <Command size={10} className="text-slate-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ctrl + Enter</span>
             </div>
             <button className="text-slate-400 hover:text-slate-600 transition-colors"><Maximize2 size={16}/></button>
          </div>
        </div>

        {/* Code Editor Content */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="relative flex-1 group">
            {/* Line Numbers Decorator */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-50/50 border-r border-slate-100 rounded-l-[1.5rem] flex flex-col items-center py-6 gap-2 text-[10px] font-mono text-slate-300 select-none">
              {Array.from({length: 15}).map((_, i) => <span key={i}>{i+1}</span>)}
            </div>
            
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-full bg-white border border-slate-200 rounded-[2rem] pl-16 pr-8 py-6 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all shadow-inner leading-relaxed resize-none"
              placeholder={`// Start architecting your solution...`}
            />
          </div>
        </div>

        {/* Results/Footer Area */}
        <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status === 'running' ? 'bg-orange-500 animate-pulse' : status === 'success' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
              <span className={`text-xs font-black uppercase tracking-tight ${status === 'success' ? 'text-emerald-600' : 'text-slate-500'}`}>
                {status === 'idle' ? 'Ready' : status === 'running' ? 'Executing Solution...' : 'Accepted'}
              </span>
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={status === "running"}
            className="relative group overflow-hidden bg-slate-900 hover:bg-orange-500 text-white pl-10 pr-8 py-4 rounded-2xl font-black text-[11px] flex items-center gap-3 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50 tracking-[0.2em]"
          >
            {status === "running" ? (
              "PROCESSING"
            ) : (
              <>
                SHIP SOLUTION 
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <ChevronRight size={16} />
                </div>
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #F1F5F9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #E2E8F0; }
        textarea { caret-color: #F97316; }
      `}</style>
    </div>
  )
}

function BookOpen({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
}