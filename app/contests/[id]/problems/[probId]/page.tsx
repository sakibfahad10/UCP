"use client"

import { useState, useEffect, use } from "react"
import { createClient } from "@/lib/supabase/client"
import Editor from "@monaco-editor/react"
import Link from "next/link"
import { 
  Play, 
  Send, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  FileText, 
  Code2, 
  Cpu, 
  ArrowLeft,
  Trophy
} from "lucide-react"
import { toast } from "sonner"

export default function ContestProblemIDE({ 
  params 
}: { 
  params: Promise<{ id: string; probId: string }> 
}) {
  const { id: contestId, probId: problemId } = use(params)
  const supabase = createClient()
  
  const [problem, setProblem] = useState<any>(null)
  const [contest, setContest] = useState<any>(null)
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("cpp17")
  const [isJudging, setIsJudging] = useState(false)
  const [activeTab, setActiveTab] = useState<"input" | "output">("input")
  const [customInput, setCustomInput] = useState("")
  const [output, setOutput] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch Problem Data
        const { data: probData, error: probError } = await supabase
          .from("problems")
          .select("*")
          .eq("id", problemId)
          .single()
        
        if (probError) throw probError
        
        // 2. Fetch Contest Data (for context)
        const { data: contData, error: contError } = await supabase
          .from("contests")
          .select("title, end_time")
          .eq("id", contestId)
          .single()

        if (contError) throw contError

        setProblem(probData)
        setContest(contData)
        setCustomInput(probData.sample_input || "")
        setDefaultCode(language)
      } catch (err: any) {
        toast.error("Failed to load task: " + err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [problemId, contestId, supabase]) // Correct dependencies

  const setDefaultCode = (lang: string) => {
    const boilerplates: any = {
      cpp17: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Contest Solution\n    int a, b;\n    if(cin >> a >> b) {\n        cout << a + b;\n    }\n    return 0;\n}",
      python3: "import sys\n\n# Contest Solution\ndef main():\n    data = sys.stdin.read().split()\n    if len(data) >= 2:\n        a, b = map(int, data[:2])\n        print(a + b)\n\nif __name__ == \"__main__\":\n    main()",
      java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(sc.hasNextInt()) {\n            int a = sc.nextInt();\n            int b = sc.nextInt();\n            System.out.println(a + b);\n        }\n    }\n}"
    }
    setCode(boilerplates[lang] || "")
  }

  const handleAction = async (isSubmit: boolean) => {
    if (!code.trim()) return toast.error("Code is empty!");
    
    // 1. Check Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (isSubmit && !user) {
      return toast.error("Please login to submit inside Arena!");
    }

    setIsJudging(true);
    setActiveTab("output");
    
    try {
      // 2. Execute Code
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code, 
          language, 
          input: isSubmit ? problem.sample_input : customInput 
        })
      });

      const data = await res.json();
      
      // 3. Verdict Logic
      const isCorrect = data.output?.trim() === problem.sample_output?.trim();
      const finalStatus = isCorrect ? "AC" : "WA"; 

      setOutput({ ...data, displayStatus: isCorrect ? "Accepted" : "Wrong Answer" });

      if (isSubmit) {
        // 4. Submit to Database
        const { error: subError } = await supabase.from('submissions').insert({ 
          problem_id: problemId, 
          user_id: user?.id,
          code: code, 
          language: language, 
          status: finalStatus, 
          score: isCorrect ? (problem.points || 10) : 0 
        });

        if (subError) {
          toast.error(`Submission Error: ${subError.message}`);
        } else {
          isCorrect 
            ? toast.success("Verdict: Accepted! Points Awarded.") 
            : toast.error("Verdict: Wrong Answer on Sample.");
        }
      }
    } catch (e) { 
      toast.error("Judge Server Error."); 
    } finally { 
      setIsJudging(false); 
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#181818] text-white font-mono text-xs animate-pulse tracking-widest uppercase">
      Connecting to Arena...
    </div>
  )

  return (
    <div className="h-screen flex flex-col bg-[#181818] text-[#cccccc] font-sans overflow-hidden">
      {/* Contest Specific Header */}
      <div className="h-14 border-b border-[#333333] bg-[#1e1e1e] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-6">
            <Link href={`/contests/${contestId}`} className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Back to Arena</span>
            </Link>
            <div className="h-4 w-[1px] bg-[#333333]" />
            <div className="flex items-center gap-2">
                <Trophy size={14} className="text-orange-500" />
                <span className="text-sm font-bold text-white tracking-tight">{contest?.title || "Loading Contest..."}</span>
            </div>
        </div>
        <div className="flex items-center gap-4">
             {/* Timer or Status could go here */}
             <div className="px-3 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                Live Contest Mode
             </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden p-2 gap-2">
        {/* Left Panel: Problem Statement */}
        <div className="w-[450px] flex flex-col bg-[#1e1e1e] border border-[#333333] rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#252526] border-b border-[#333333]">
            <FileText size={14} className="text-blue-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white">Problem Statement</span>
          </div>
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <h1 className="text-2xl font-bold text-white mb-4 tracking-tight leading-tight">{problem?.title}</h1>
            
            <div className="flex flex-wrap gap-3 mb-8">
               <span className="px-3 py-1 rounded-md bg-[#252526] border border-[#333333] text-[10px] font-black uppercase tracking-widest text-[#cccccc]">
                  {problem?.difficulty || "Medium"}
               </span>
                <span className="px-3 py-1 rounded-md bg-[#252526] border border-[#333333] text-[10px] font-black uppercase tracking-widest text-emerald-500">
                  {problem?.points || 10} Points
               </span>
                <span className="px-3 py-1 rounded-md bg-[#252526] border border-[#333333] text-[10px] font-black uppercase tracking-widest text-blue-400">
                  {problem?.time_limit || 1000} ms
               </span>
            </div>

            <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-[#cccccc] leading-relaxed whitespace-pre-wrap font-light">{problem?.statement}</p>
            </div>
            
            <div className="space-y-6 pt-8 mt-8 border-t border-[#333333]">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-[#569cd6] uppercase tracking-widest">Sample Input</span>
                <pre className="bg-[#121212] p-4 rounded-lg text-xs font-mono border border-[#333333] text-[#ce9178] overflow-x-auto">
                    {problem?.sample_input || "No sample input"}
                </pre>
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-[#569cd6] uppercase tracking-widest">Sample Output</span>
                <pre className="bg-[#121212] p-4 rounded-lg text-xs font-mono border border-[#333333] text-[#ce9178] overflow-x-auto">
                    {problem?.sample_output || "No sample output"}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="flex-1 flex flex-col gap-2 overflow-hidden">
          {/* Editor Controls */}
          <div className="h-12 bg-[#252526] border border-[#333333] rounded-t-lg flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#1e1e1e] px-4 py-2.5 h-full border-t-2 border-orange-500 rounded-t-sm">
                <Code2 size={14} className="text-orange-400" />
                <span className="text-xs text-white font-medium">solution.{language === 'python3' ? 'py' : 'cpp'}</span>
              </div>
              <select 
                value={language}
                onChange={(e) => {setLanguage(e.target.value); setDefaultCode(e.target.value)}}
                className="bg-[#333333] border-none text-[11px] text-[#cccccc] outline-none rounded px-3 py-1.5 cursor-pointer hover:bg-[#3e3e3e]"
              >
                <option value="cpp17">C++ 17 (GCC 9.2)</option>
                <option value="python3">Python 3.8</option>
                <option value="java">Java 11</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleAction(false)} 
                disabled={isJudging} 
                className="flex items-center gap-2 px-4 py-2 bg-[#333333] hover:bg-[#3e3e3e] rounded text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
              >
                <Play size={12} className="text-green-500" /> Run Code
              </button>
              <button 
                onClick={() => handleAction(true)} 
                disabled={isJudging} 
                className="flex items-center gap-2 px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-900/20 disabled:opacity-50"
              >
                {isJudging ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} 
                Submit Solution
              </button>
            </div>
          </div>

          {/* Monaco Instance */}
          <div className="flex-1 bg-[#1e1e1e] border border-[#333333] overflow-hidden relative">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language === "python3" ? "python" : "cpp"}
              value={code}
              onChange={(v) => setCode(v || "")}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                padding: { top: 16 },
                automaticLayout: true,
                cursorBlinking: "smooth",
                smoothScrolling: true,
              }}
            />
          </div>

          {/* Terminal / Output */}
          <div className="h-60 bg-[#1e1e1e] border border-[#333333] rounded-b-lg flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center bg-[#252526] border-b border-[#333333] px-2 min-h-[40px]">
              <button onClick={() => setActiveTab("input")} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === "input" ? "border-orange-500 text-white" : "border-transparent text-[#666666] hover:text-[#999999]"}`}>Custom Input</button>
              <button onClick={() => setActiveTab("output")} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === "output" ? "border-orange-500 text-white" : "border-transparent text-[#666666] hover:text-[#999999]"}`}>Compilier Output</button>
              <div className="ml-auto pr-4 flex items-center gap-4 text-[#666666]">
                {output && <span className="text-[10px] font-mono flex items-center gap-1"><Cpu size={10} /> {output.cpuTime || 0}s</span>}
                <RotateCcw size={12} className="cursor-pointer hover:text-white transition-colors" onClick={() => setDefaultCode(language)} />
              </div>
            </div>

            <div className="flex-1 p-0 overflow-y-auto font-mono custom-scrollbar bg-[#121212] relative">
              {activeTab === "input" ? (
                <textarea 
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full h-full bg-transparent border-none text-[#cccccc] text-xs outline-none p-4 resize-none placeholder:text-[#333333]"
                  placeholder="// Paste your custom test cases here..."
                  spellCheck={false}
                />
              ) : (
                <div className="p-4 space-y-3">
                  {isJudging ? (
                    <div className="flex items-center gap-3 text-xs text-orange-400">
                       <Loader2 size={14} className="animate-spin" /> 
                       <span className="animate-pulse font-bold tracking-widest uppercase">Running Tests via Judge0...</span>
                    </div>
                  ) : output ? (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                      <div className={`text-xs font-black mb-4 flex items-center gap-2 p-3 rounded-lg border ${output.displayStatus === "Accepted" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                        {output.displayStatus === "Accepted" ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        VERDICT: {output.displayStatus.toUpperCase()}
                      </div>
                      <div className="space-y-2">
                          <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Standard Output</div>
                          <pre className="text-xs text-[#dcdcdc] bg-[#1e1e1e] p-3 rounded border border-[#333333] whitespace-pre-wrap font-mono">{output.output || <span className="text-slate-600 italic">No output produced.</span>}</pre>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-[#cccccc]">
                         <Code2 size={24} className="mb-2" />
                         <p className="text-[10px] font-bold uppercase tracking-widest">Ready to compile</p>
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