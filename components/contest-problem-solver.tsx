"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Editor from "@monaco-editor/react"
import { Play, Send, RotateCcw, CheckCircle, XCircle, Loader2, FileText, Code2, Cpu, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { executeCode } from "@/app/actions/execute-code"
import { Verdict } from "@/types"

interface ContestProblemSolverProps {
  problem: any
  contestId: string
  onBack: () => void
}

export default function ContestProblemSolver({ problem, contestId, onBack }: ContestProblemSolverProps) {
  const supabase = createClient()
  
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("cpp17")
  const [isJudging, setIsJudging] = useState(false)
  const [activeTab, setActiveTab] = useState<"input" | "output">("input")
  const [customInput, setCustomInput] = useState(problem.sample_input || "")
  const [output, setOutput] = useState<any>(null)

  useEffect(() => {
    setDefaultCode(language)
  }, [language])

  const setDefaultCode = (lang: string) => {
    const boilerplates: any = {
      cpp17: "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    if(cin >> a >> b) {\n        cout << a + b;\n    }\n    return 0;\n}",
      python3: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if len(data) >= 2:\n        a, b = map(int, data[:2])\n        print(a + b)\n\nif __name__ == \"__main__\":\n    main()",
      java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(sc.hasNextInt()) {\n            int a = sc.nextInt();\n            int b = sc.nextInt();\n            System.out.println(a + b);\n        }\n    }\n}"
    }
    setCode(boilerplates[lang] || "")
  }

  const handleAction = async (isSubmit: boolean) => {
    if (!code.trim()) return toast.error("Code is empty!");
    
    setIsJudging(true);
    setActiveTab("output");
    
    try {
      const result = await executeCode(
        code, 
        language, 
        isSubmit ? problem.id : undefined, 
        isSubmit ? contestId : undefined,
        isSubmit ? undefined : customInput 
      );

      if (!result.success) {
        toast.error(result.output);
        return;
      }
      
      const displayStatus = 
        result.verdict === "AC" ? "Accepted" : 
        result.verdict === "WA" ? "Wrong Answer" : 
        result.verdict === "TLE" ? "Time Limit Exceeded" : 
        result.verdict === "CE" ? "Compilation Error" : "Error";

      setOutput({ 
        output: result.output, 
        cpuTime: result.cpuTime, 
        memory: result.memory, 
        displayStatus 
      });

      if (isSubmit) {
        result.verdict === "AC" 
          ? toast.success("Deployment Successful! Points synchronized.") 
          : toast.error(`Deployment Failed: ${displayStatus}`);
      }
    } catch (e) { 
      toast.error("Bridge connection failed."); 
    } finally { 
      setIsJudging(false); 
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] -mt-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest transition-colors"
        >
          <ArrowLeft size={16} /> Back to Problem Set
        </button>
        
        <div className="flex items-center gap-3">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest outline-none rounded-xl px-4 py-2 cursor-pointer hover:border-slate-400 transition-all"
          >
            <option value="cpp17">C++ 17</option>
            <option value="python3">Python 3</option>
            <option value="java">Java 11</option>
          </select>
          
          <button 
            onClick={() => handleAction(false)} 
            disabled={isJudging} 
            className="flex items-center gap-2 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
          >
            <Play size={14} className="text-emerald-500" /> Run
          </button>
          
          <button 
            onClick={() => handleAction(true)} 
            disabled={isJudging} 
            className="flex items-center gap-2 px-8 py-2 bg-slate-900 hover:bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
          >
            {isJudging ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Submit
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left: Problem Statement */}
        <div className="w-1/3 flex flex-col bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
          <div className="p-8 overflow-y-auto custom-scrollbar">
            <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">{problem.title}</h1>
            <div className="flex items-center gap-3 mb-8">
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' : 
                problem.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {problem.difficulty}
              </span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Points: {problem.points || 100}
              </span>
            </div>

            <div className="prose prose-slate prose-sm max-w-none mb-8">
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                {problem.statement}
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sample Input</span>
                <pre className="bg-slate-50 p-4 rounded-2xl text-[11px] font-mono border border-slate-100 text-slate-600 overflow-x-auto">
                  {problem.sample_input || "No input required"}
                </pre>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Output</span>
                <pre className="bg-slate-50 p-4 rounded-2xl text-[11px] font-mono border border-slate-100 text-slate-600 overflow-x-auto">
                  {problem.sample_output}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Editor & Terminal */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Editor Container */}
          <div className="flex-1 bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm relative">
             <div className="absolute top-4 right-6 z-10">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                  <Code2 size={12} className="text-orange-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">solution.{language === 'python3' ? 'py' : 'cpp'}</span>
                </div>
             </div>
            <Editor
              height="100%"
              theme="light"
              language={language === "python3" ? "python" : "cpp"}
              value={code}
              onChange={(v) => setCode(v || "")}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                padding: { top: 20 },
                automaticLayout: true,
                roundedSelection: true,
                cursorStyle: "line",
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          </div>

          {/* Terminal Container */}
          <div className="h-64 bg-slate-900 rounded-[2rem] overflow-hidden shadow-xl flex flex-col border border-slate-800">
            <div className="flex items-center bg-slate-800/50 border-b border-slate-800 px-6 py-1">
              <button 
                onClick={() => setActiveTab("input")} 
                className={`px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${
                  activeTab === "input" ? "border-orange-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                Custom Input
              </button>
              <button 
                onClick={() => setActiveTab("output")} 
                className={`px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${
                  activeTab === "output" ? "border-orange-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                Execution Log
              </button>
              <div className="ml-auto flex items-center gap-4 text-slate-500">
                {output && <span className="text-[10px] font-mono flex items-center gap-1"><Cpu size={12} /> {output.cpuTime || 0}s</span>}
                <RotateCcw 
                  size={14} 
                  className="cursor-pointer hover:text-white transition-colors" 
                  onClick={() => setDefaultCode(language)} 
                />
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto font-mono custom-scrollbar-dark bg-slate-950/50">
              {activeTab === "input" ? (
                <textarea 
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full h-full bg-transparent border-none text-slate-300 text-sm outline-none resize-none placeholder:text-slate-700"
                  placeholder="// Provide input for your code..."
                />
              ) : (
                <div className="space-y-4">
                  {isJudging ? (
                    <div className="flex items-center gap-3 text-xs text-orange-400 animate-pulse">
                      <Loader2 size={16} className="animate-spin" /> 
                      <span className="font-black uppercase tracking-widest">Initializing Judge Environment...</span>
                    </div>
                  ) : output ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                      <div className={`text-xs font-black mb-4 flex items-center gap-2 uppercase tracking-widest ${
                        output.displayStatus === "Accepted" ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        {output.displayStatus === "Accepted" ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        Verdict: {output.displayStatus}
                      </div>
                      <div className="text-[9px] text-slate-600 mb-2 uppercase font-black tracking-[0.3em]">Program Stdout:</div>
                      <pre className="text-sm text-slate-200 bg-black/30 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap">
                        {output.output || "No output generated."}
                      </pre>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em] italic">Awaiting Deployment...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
