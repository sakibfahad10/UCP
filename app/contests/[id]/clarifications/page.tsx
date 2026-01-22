"use client"

import { useState, useEffect, use } from "react"
import { createClient } from "@/lib/supabase/client"
import Header from "@/components/header"
import { MessageSquare, Send, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function ClarificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [questions, setQuestions] = useState<any[]>([])
  const [newQ, setNewQ] = useState("")
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    const { data } = await supabase.from("clarifications").select("*").eq("contest_id", id).order("created_at", { ascending: false })
    setQuestions(data || [])
  }

  const ask = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from("clarifications").insert({ contest_id: id, user_id: user?.id, question: newQ })
    setNewQ("")
    fetchData()
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <Link href={`/contests/${id}`} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-8">
          <ChevronLeft size={16}/> <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </Link>
        
        <form onSubmit={ask} className="bg-white border-2 border-slate-900 p-8 rounded-4xl mb-12 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-sm font-black uppercase tracking-widest mb-4">Ask the Jury</h2>
          <textarea value={newQ} onChange={e => setNewQ(e.target.value)} className="w-full bg-slate-50 p-4 rounded-xl outline-none border border-slate-100 mb-4" placeholder="Your question..." />
          <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2"><Send size={14}/> Send</button>
        </form>

        <div className="space-y-4">
          {questions.map(q => (
            <div key={q.id} className="bg-white border border-slate-200 p-6 rounded-2xl">
              <p className="font-bold text-slate-700">Q: {q.question}</p>
              {q.answer && <p className="mt-3 text-orange-600 font-medium bg-orange-50 p-3 rounded-lg italic">A: {q.answer}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}