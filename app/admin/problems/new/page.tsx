"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { 
  ArrowLeft, Save, FileText, Database, 
  AlertCircle, Zap, Box, Layout, Loader2
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import TestcaseManager from "@/components/admin/testcase-manager"

export default function NewProblemPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contests, setContests] = useState<any[]>([]) // Arena selection এর জন্য

  // মেইন প্রবলেম ডাটা স্টেট
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "Easy",
    statement: "",
    input_format: "",
    output_format: "",
    sample_input: "",    
    sample_output: "",   
    constraints: "",
    tags: [] as string[],
    time_limit: 1000,
    memory_limit: 256,
    contest_id: null as string | null // ডাটাবেস লিঙ্ক ফিক্স
  })

  const [testcases, setTestcases] = useState<any[]>([])
  const [tagInput, setTagInput] = useState("")

  // বিদ্যমান কন্টেস্টগুলো লোড করা
  useEffect(() => {
    async function fetchContests() {
      const { data } = await supabase
        .from("contests")
        .select("id, title")
        .order("created_at", { ascending: false })
      setContests(data || [])
    }
    fetchContests()
  }, [])

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim().toUpperCase()] })
      }
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.statement) {
      toast.error("Basic identity and statement are required")
      return
    }

    if (testcases.length === 0) {
      toast.error("Please add at least one Validation Set (Testcase)")
      return
    }

    setIsSubmitting(true)

    try {
      // ১. 'problems' টেবিলে ডাটা পুশ করা
      const { data: problem, error: pError } = await supabase
        .from("problems")
        .insert([formData])
        .select()
        .single()

      if (pError) throw pError

      // ২. টেস্টকেস ম্যাপিং (Database কলামের সাথে সিঙ্ক করা)
      const tcData = testcases.map(tc => ({
        problem_id: problem.id,
        input: tc.input || "", 
        expected_output: tc.expected_output || "",
        is_sample: tc.is_sample || false
      }))

      // ৩. 'testcases' টেবিলে পুশ করা
      const { error: tcError } = await supabase.from("testcases").insert(tcData)
      if (tcError) throw tcError

      toast.success("Task & Validation Sets successfully deployed!")
      router.push("/admin/problems")
      
    } catch (error: any) {
      console.error("Submission Error:", error)
      toast.error(error.message || "Deployment failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Control Bar */}
      <div className="flex items-center justify-between mb-12 p-1">
        <Link href="/admin/problems" className="group flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-[0.2em]">
          <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-slate-100 transition-colors"><ArrowLeft size={16} /></div>
          Return to Archive
        </Link>
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="flex items-center gap-4 px-10 py-4 bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-[1.5rem] shadow-2xl hover:bg-orange-600 transition-all disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} strokeWidth={3} />}
          {isSubmitting ? "Processing..." : "Deploy to Bank"}
        </button>
      </div>

      <div className="mb-12">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Initialize Task</h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 italic">Building New Algorithmic Logic</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm space-y-8">
            <div className="flex items-center gap-3 text-orange-500"><Layout size={18} /><h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Task Identity</h3></div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Problem Title</label>
                <input className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 font-bold text-lg outline-none" placeholder="Task Name..." onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Arena / Contest</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 font-black text-[10px] outline-none uppercase text-orange-600"
                    onChange={(e) => setFormData({...formData, contest_id: e.target.value || null})}
                  >
                    <option value="">Standard Practice</option>
                    {contests.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Difficulty</label>
                  <select className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 font-black text-[10px] outline-none uppercase" onChange={(e) => setFormData({...formData, difficulty: e.target.value})}>
                    <option value="Easy">Easy Level</option>
                    <option value="Medium">Medium Level</option>
                    <option value="Hard">Hard Level</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Algorithm Tags</label>
                <input className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 font-bold text-[10px] outline-none uppercase" placeholder="Type & Press Enter" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} />
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-slate-900 text-white text-[9px] font-black rounded-lg flex items-center gap-2">
                      {tag} <button onClick={() => removeTag(tag)} className="text-orange-500">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm space-y-6">
            <div className="flex items-center gap-3"><FileText size={18} /><h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Statement</h3></div>
            <textarea rows={12} className="w-full bg-slate-50 border-none rounded-[2.5rem] p-8 text-sm outline-none" placeholder="Describe the problem..." onChange={(e) => setFormData({...formData, statement: e.target.value})} />
          </div>

          <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm">
            <TestcaseManager testcases={testcases} onChange={setTestcases} />
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-orange-500"><Zap size={20} /><h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Technical Meta</h4></div>
            <div className="space-y-6">
               <div><p className="text-[9px] font-black text-slate-500 uppercase mb-3">Time Limit (ms)</p>
               <input type="number" defaultValue={1000} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none" onChange={(e) => setFormData({...formData, time_limit: parseInt(e.target.value)})} /></div>
               <div><p className="text-[9px] font-black text-slate-500 uppercase mb-3">Memory Limit (MB)</p>
               <input type="number" defaultValue={256} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none" onChange={(e) => setFormData({...formData, memory_limit: parseInt(e.target.value)})} /></div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm space-y-6">
             <div className="flex items-center gap-3 text-orange-500"><Box size={18} /><h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Standard Formats</h4></div>
             <textarea className="w-full bg-slate-50 border-none rounded-xl p-4 text-[10px] font-bold outline-none h-24" placeholder="Input Specification" onChange={(e) => setFormData({...formData, input_format: e.target.value})} />
             <textarea className="w-full bg-slate-50 border-none rounded-xl p-4 text-[10px] font-bold outline-none h-24" placeholder="Output Specification" onChange={(e) => setFormData({...formData, output_format: e.target.value})} />
          </div>

          <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm space-y-6 border-l-4 border-l-blue-500">
             <div className="flex items-center gap-3 text-blue-500"><Database size={18} /><h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Sample Data</h4></div>
             <textarea className="w-full bg-slate-50 border-none rounded-xl p-4 text-[11px] font-mono outline-none h-24" placeholder="Sample Input" onChange={(e) => setFormData({...formData, sample_input: e.target.value})} />
             <textarea className="w-full bg-slate-50 border-none rounded-xl p-4 text-[11px] font-mono outline-none h-24" placeholder="Sample Output" onChange={(e) => setFormData({...formData, sample_output: e.target.value})} />
          </div>
        </div>
      </div>
    </div>
  )
}