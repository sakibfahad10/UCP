"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Editor from "@monaco-editor/react"
import { Play, Send, Terminal, Loader2 } from "lucide-react"

export default function ProblemArena() {
  const { id: contestId, probId } = useParams()
  const [problem, setProblem] = useState<any>(null)
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("cpp17")
  const [output, setOutput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProblem() {
      const { data } = await supabase.from("problems").select("*").eq("id", probId).single()
      if (data) {
        setProblem(data)
        setCode(data.sample_input ? `// Language: ${language}\n` : "")
      }
    }
    fetchProblem()
  }, [probId])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setOutput("Judging...")

    try {
      // ১. JDoodle এ কোড পাঠানো
      const res = await fetch('/api/execute', {
        method: 'POST',
        body: JSON.stringify({ script: code, language, stdin: problem.sample_input })
      })
      const result = await res.json()
      
      // ২. রেজাল্ট স্ট্যাটাস চেক (খুবই বেসিক লজিক)
      const status = result.output.trim() === problem.sample_output.trim() ? "Accepted" : "Wrong Answer"
      setOutput(result.output)

      // ৩. ডাটাবেসে সাবমিশন সেভ করা (আপনার স্কিমা অনুযায়ী)
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from("submissions").insert({
        user_id: user?.id,
        problem_id: probId,
        contest_id: contestId,
        code: code,
        language: language,
        status: status,
        runtime: parseFloat(result.cpuTime) || 0,
        memory_usage: result.memory || "0"
      })

    } catch (err) {
      setOutput("Execution Error!")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-white overflow-hidden">
      {/* বাম পাশ: প্রবলেম ডেসক্রিপশন */}
      <div className="w-1/2 p-8 overflow-y-auto border-r border-white/5 bg-[#0F172A]">
        <span className="text-orange-500 font-black uppercase text-xs tracking-widest">{problem?.order_label}</span>
        <h1 className="text-4xl font-black uppercase italic mb-6">{problem?.title}</h1>
        <div className="prose prose-invert max-w-none text-slate-300 font-medium">
          {problem?.statement}
          <div className="mt-8 p-4 bg-slate-900 rounded-xl border border-white/5">
            <p className="text-xs font-black uppercase text-slate-500 mb-2">Sample Input</p>
            <pre className="text-emerald-500">{problem?.sample_input}</pre>
          </div>
        </div>
      </div>

      {/* ডান পাশ: এডিটর এবং আউটপুট */}
      <div className="w-1/2 flex flex-col">
        <div className="flex justify-between items-center p-4 bg-[#1e1e1e] border-b border-white/5">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-800 text-xs font-black uppercase px-4 py-2 rounded-lg outline-none"
          >
            <option value="cpp17">C++ 17</option>
            <option value="python3">Python 3</option>
            <option value="java">Java</option>
          </select>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 text-white font-black uppercase italic rounded-xl transition-all"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <Send size={16}/>}
            Submit
          </button>
        </div>

        <div className="flex-1">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language === "python3" ? "python" : "cpp"}
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 20 } }}
          />
        </div>

        {/* কনসোল/আউটপুট প্যানেল */}
        <div className="h-48 bg-[#0a0a0a] border-t border-white/10 p-6 overflow-y-auto">
          <div className="flex items-center gap-2 text-slate-500 mb-2 uppercase font-black text-[10px]">
            <Terminal size={12}/> Terminal Output
          </div>
          <pre className="font-mono text-sm text-emerald-400">{output || "Run your code to see output..."}</pre>
        </div>
      </div>
    </div>
  )
}