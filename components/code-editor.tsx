"use client"

import { useState } from "react"
import { Play, Send, Copy, RotateCcw, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { executeCode } from "@/app/actions/execute-code"
import { toast } from "sonner"

interface CodeEditorProps {
  problemId: string;
  contestId: string;
}

export default function CodeEditor({ problemId, contestId }: CodeEditorProps) {
  const [language, setLanguage] = useState("cpp")
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState("")
  const [status, setStatus] = useState<"pending" | "accepted" | "wrong_answer" | "idle">("idle")
  
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
    // Write your code here
    return 0;
}`)

  const handleRunAndSubmit = async () => {
    if (!code.trim()) {
      toast.error("Code cannot be empty!")
      return
    }

    setIsRunning(true)
    setStatus("pending")
    setOutput("Executing and Judging...")

    try {
      const result = await executeCode(code, language, problemId, contestId)
      
      setOutput(result.output)
      
      if (result.success) {
        if (result.status === "accepted") {
          setStatus("accepted")
          toast.success("Accepted! Points added to leaderboard.")
        } else {
          setStatus("wrong_answer")
          toast.error("Wrong Answer. Try again!")
        }
      } else {
        setStatus("idle")
        toast.error(result.output || "Execution failed")
      }
    } catch (error) {
      setStatus("idle")
      setOutput("Runtime Error: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsRunning(false)
    }
  }

  const resetCode = () => {
    if (confirm("Reset code to default?")) {
      setCode("")
      setOutput("")
      setStatus("idle")
    }
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Editor Main Container */}
      <div className="flex-1 bg-slate-900 rounded-[2rem] border-4 border-slate-900 overflow-hidden flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Toolbar */}
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border border-slate-600 focus:border-orange-500 transition-all"
            >
              <option value="cpp">C++ 17</option>
              <option value="python">Python 3</option>
              <option value="java">Java 11</option>
              <option value="c">C Language</option>
            </select>
            
            <button 
              onClick={resetCode}
              className="p-2 text-slate-400 hover:text-white transition-colors" 
              title="Reset Code"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(code)
                toast.info("Code copied to clipboard")
              }}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <Copy size={18} />
            </button>
          </div>
        </div>

        {/* Textarea Editor */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 p-6 font-mono text-sm bg-slate-900 text-emerald-400 resize-none outline-none caret-white"
          placeholder="// Architects, start coding here..."
          spellCheck={false}
        />

        {/* Action Bar */}
        <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {status === "accepted" && <CheckCircle2 className="text-emerald-500" size={20} />}
            {status === "wrong_answer" && <XCircle className="text-red-500" size={20} />}
            <span className={`text-[10px] font-black uppercase tracking-widest ${
              status === "accepted" ? "text-emerald-500" : 
              status === "wrong_answer" ? "text-red-500" : "text-slate-400"
            }`}>
              {status === "idle" ? "Ready to Submit" : status.replace("_", " ")}
            </span>
          </div>

          <button
            onClick={handleRunAndSubmit}
            disabled={isRunning}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(154,52,18,1)] active:translate-y-1 active:shadow-none"
          >
            {isRunning ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Judging...</>
            ) : (
              <><Send className="w-4 h-4" /> Submit Arena</>
            )}
          </button>
        </div>
      </div>

      {/* Terminal/Output Section */}
      <div className="h-48 bg-black rounded-[1.5rem] border-2 border-slate-800 p-6 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Jury Terminal</h3>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
        </div>
        <pre className="flex-1 font-mono text-xs text-slate-300 overflow-auto whitespace-pre-wrap">
          {output || "> System idle. Waiting for submission..."}
        </pre>
      </div>
    </div>
  )
}
