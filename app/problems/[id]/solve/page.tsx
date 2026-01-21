"use client"

import { useState, useEffect, use } from "react"
import { createClient } from "@/lib/supabase/client"
import Editor from "@monaco-editor/react"
import Header from "@/components/header"
import { Play, Send, RotateCcw, CheckCircle, XCircle, Loader2, FileText, Code2, Cpu } from "lucide-react"
import { toast } from "sonner"
import { executeCode } from "@/app/actions/execute-code"

export default function VSCodeStyleIDE({ params }: { params: Promise<{ id: string }> }) {
  const { id: problemId } = use(params)
  const supabase = createClient()
  
  const [problem, setProblem] = useState<any>(null)
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("cpp17")
  const [isJudging, setIsJudging] = useState(false)
  const [activeTab, setActiveTab] = useState<"input" | "output">("input")
  const [customInput, setCustomInput] = useState("")
  const [output, setOutput] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProblem() {
      const { data } = await supabase.from("problems").select("*").eq("id", problemId).single()
      if (data) {
        setProblem(data)
        setCustomInput(data.sample_input || "")
        setDefaultCode(language)
      }
      setLoading(false)
    }
    fetchProblem()
  }, [problemId])

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
        isSubmit ? problemId : undefined, 
        undefined, // no contestId in global solve usually, unless we add it
        isSubmit ? undefined : customInput 
      );

      if (!result.success) {
        toast.error(result.output);
        return;
      }
      
      // For Run mode (no verdict), just show output
      // For Submit mode, show verdict
      const displayStatus = result.verdict
        ? (result.verdict === "AC" ? "Accepted" : 
           result.verdict === "WA" ? "Wrong Answer" : 
           result.verdict === "TLE" ? "Time Limit Exceeded" : 
           result.verdict === "CE" ? "Compilation Error" : "Error")
        : null; // No status for Run mode

      setOutput({ 
        output: result.output, 
        cpuTime: result.cpuTime, 
        memory: result.memory, 
        displayStatus 
      });

      if (isSubmit) {
        result.verdict === "AC" 
          ? toast.success("Submission Accepted!") 
          : toast.error(`Submission Failed: ${displayStatus}`);
      } else {
        toast.success("Code executed successfully!");
      }
    } catch (e) { 
      toast.error("Execution engine unreachable."); 
    } finally { 
      setIsJudging(false); 
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#181818] text-white font-mono text-xs animate-pulse tracking-widest uppercase">Initializing Secure IDE...</div>

  return (
    <div className="h-screen flex flex-col bg-[#181818] text-[#cccccc] font-sans overflow-hidden">
      <Header />

      <div className="flex-1 flex overflow-hidden p-2 gap-2">
        {/* Left Sidebar: Problem Content */}
        <div className="w-[400px] flex flex-col bg-[#1e1e1e] border border-[#333333] rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#252526] border-b border-[#333333]">
            <FileText size={14} className="text-blue-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white">Problem.md</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <h1 className="text-xl font-bold text-white mb-2 tracking-tight">{problem?.title}</h1>
            <div className="flex gap-2 mb-6">
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-black uppercase tracking-widest">Score: 10 PTS</span>
            </div>
            <p className="text-[#cccccc] text-sm leading-relaxed mb-6 font-light whitespace-pre-wrap">{problem?.statement}</p>
            
            <div className="space-y-4 pt-4 border-t border-[#333333]">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#569cd6] uppercase tracking-widest">Sample Input</span>
                <pre className="bg-[#121212] p-3 rounded text-xs font-mono border border-[#333333] text-[#ce9178]">{problem?.sample_input}</pre>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#569cd6] uppercase tracking-widest">Sample Output</span>
                <pre className="bg-[#121212] p-3 rounded text-xs font-mono border border-[#333333] text-[#ce9178]">{problem?.sample_output}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Editor & Terminal */}
        <div className="flex-1 flex flex-col gap-2 overflow-hidden">
          {/* Editor Header */}
          <div className="h-10 bg-[#252526] border border-[#333333] rounded-t-lg flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#1e1e1e] px-4 py-2 h-full border-t-2 border-blue-500 rounded-t-sm">
                <Code2 size={14} className="text-orange-400" />
                <span className="text-xs text-white font-medium">solution.{language === 'python3' ? 'py' : 'cpp'}</span>
              </div>
              <select 
                value={language}
                onChange={(e) => {setLanguage(e.target.value); setDefaultCode(e.target.value)}}
                className="bg-[#2d2d2d] border-none text-[11px] text-[#cccccc] outline-none rounded px-2 py-1 cursor-pointer hover:bg-[#3e3e3e]"
              >
                <option value="cpp17">C++ 17</option>
                <option value="python3">Python 3</option>
                <option value="java">Java 11</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => handleAction(false)} disabled={isJudging} className="flex items-center gap-2 px-3 py-1 bg-[#2d2d2d] hover:bg-[#3e3e3e] rounded text-xs transition-colors disabled:opacity-50">
                <Play size={12} className="text-green-500" /> Run
              </button>
              <button onClick={() => handleAction(true)} disabled={isJudging} className="flex items-center gap-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-all shadow-lg disabled:opacity-50">
                {isJudging ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Submit
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 bg-[#1e1e1e] border border-[#333333] overflow-hidden">
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
                padding: { top: 10 },

                automaticLayout: true,
              }}
            />
          </div>

          {/* Bottom Terminal */}
          <div className="h-56 bg-[#1e1e1e] border border-[#333333] rounded-b-lg flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center bg-[#252526] border-b border-[#333333] px-2">
              <button onClick={() => setActiveTab("input")} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === "input" ? "border-blue-500 text-white" : "border-transparent text-[#666666] hover:text-[#999999]"}`}>Input</button>
              <button onClick={() => setActiveTab("output")} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === "output" ? "border-blue-500 text-white" : "border-transparent text-[#666666] hover:text-[#999999]"}`}>Output</button>
              <div className="ml-auto pr-4 flex items-center gap-4 text-[#666666]">
                {output && <span className="text-[10px] font-mono"><Cpu size={10} className="inline mr-1" /> {output.cpuTime || 0}s</span>}
                <RotateCcw size={12} className="cursor-pointer hover:text-white transition-colors" onClick={() => setDefaultCode(language)} />
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto font-mono custom-scrollbar bg-[#121212]">
              {activeTab === "input" ? (
                <textarea 
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full h-full bg-transparent border-none text-[#cccccc] text-xs outline-none resize-none placeholder:text-[#444444]"
                  placeholder="// Type test cases here..."
                />
              ) : (
                <div className="space-y-3">
                  {isJudging ? (
                    <div className="flex items-center gap-2 text-xs text-blue-400 animate-pulse">
                      <Loader2 size={14} className="animate-spin" /> Verifying against test cases...
                    </div>
                  ) : output ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                      {output.displayStatus && (
                        <div className={`text-xs font-black mb-3 flex items-center gap-2 ${output.displayStatus === "Accepted" ? "text-green-500" : "text-red-500"}`}>
                          {output.displayStatus === "Accepted" ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          {output.displayStatus}
                        </div>
                      )}
                      <div className="text-[9px] text-slate-500 mb-1 uppercase font-black tracking-widest">Stdout:</div>
                      <pre className="text-xs text-[#dcdcdc] bg-[#1e1e1e] p-3 rounded border border-[#333333] whitespace-pre-wrap">{output.output || "No output."}</pre>
                    </div>
                  ) : (
                    <span className="text-xs text-[#444444] italic">Run code to initialize terminal output.</span>
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