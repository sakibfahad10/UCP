"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { 
  ArrowLeft, Clock, Code2, 
  User, Terminal, Cpu, Loader2, AlertCircle
} from "lucide-react"
import { toast } from "sonner"

export default function SubmissionDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [submission, setSubmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (id) fetchSubmissionDetails()
  }, [id])

  const fetchSubmissionDetails = async () => {
    setLoading(true)
    try {
      // Using column names directly to avoid relation confusion
      // If !problem_id doesn't work, try !submissions_problem_id_fkey
      const { data, error } = await supabase
        .from("submissions")
        .select(`
          *,
          profiles!user_id (full_name, email),
          problems!problem_id (title, difficulty)
        `)
        .eq("id", id)
        .maybeSingle()

      if (error) {
        // If previous query fails, try fetching data without relations
        console.warn("Retrying without embedded relations...")
        const { data: simpleData, error: simpleError } = await supabase
          .from("submissions")
          .select("*")
          .eq("id", id)
          .maybeSingle()
        
        if (simpleError) throw simpleError
        setSubmission(simpleData)
      } else {
        setSubmission(data)
      }
    } catch (err: any) {
      console.error("Submission Fetch Error:", err.message)
      toast.error("Could not find submission details")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-orange-500" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accessing Code Vault...</p>
    </div>
  )

  if (!submission) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
      <AlertCircle className="text-rose-500" size={60} />
      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Record Nullified</h2>
      <button onClick={() => router.back()} className="px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em]">
        Return to Safety
      </button>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      <button onClick={() => router.back()} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors">
        <ArrowLeft size={14} /> Back to dashboard
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                submission.status === 'Accepted' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-rose-500 text-white shadow-lg shadow-rose-100'
              }`}>
                {submission.status || 'Pending'}
              </span>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">ID: {submission.id.toString().slice(0, 8)}</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-tight">
            {submission.problems?.title || "Problem Details Restricted"}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-white border border-slate-100 rounded-[3rem] flex items-center gap-5">
           <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400"><User size={28}/></div>
           <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Author</p>
              <p className="text-slate-900 text-base font-bold">{submission.profiles?.full_name || 'System User'}</p>
           </div>
        </div>
        <div className="p-8 bg-white border border-slate-100 rounded-[3rem] flex items-center gap-5">
           <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400"><Clock size={28}/></div>
           <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Execution</p>
              <p className="text-slate-900 text-base font-bold uppercase">{submission.execution_time || '0'} ms</p>
           </div>
        </div>
        <div className="p-8 bg-white border border-slate-100 rounded-[3rem] flex items-center gap-5">
           <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400"><Code2 size={28}/></div>
           <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Environment</p>
              <p className="text-slate-900 text-base font-bold uppercase">{submission.language || 'Code'}</p>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
          <Terminal size={14} className="text-orange-500" /> Source Manifest
        </h3>
        <div className="bg-[#0f172a] rounded-[3rem] p-10 shadow-2xl border border-slate-800 relative group overflow-hidden">
          <pre className="text-emerald-400 font-mono text-sm leading-relaxed overflow-x-auto selection:bg-orange-500/30">
            <code>{submission.code_body || submission.code || "// [Warning] Binary data or empty source"}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}