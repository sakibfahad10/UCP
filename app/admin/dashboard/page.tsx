"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Header from "@/components/header"
import { 
  Plus, Settings, MessageSquare, ShieldCheck, 
  RefreshCw, Trash2, Edit3, ExternalLink 
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [contests, setContests] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchAdminData()
  }, [])

  async function fetchAdminData() {
    setLoading(true)
    const { data: c } = await supabase.from("competitions").select("*").order("created_at", { ascending: false })
    const { data: q } = await supabase.from("clarifications").select("*, competitions(title)").order("created_at", { ascending: false })
    setContests(c || [])
    setQuestions(q || [])
    setLoading(false)
  }

  const handleReply = async (id: string, answer: string) => {
    if (!answer) return
    const { error } = await supabase.from("clarifications").update({ answer, is_public: true }).eq("id", id)
    if (!error) {
      alert("Reply sent successfully!")
      fetchAdminData()
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
    
      
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900">
              Admin <span className="text-orange-600">Console</span>
            </h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Management Hub</p>
          </div>
          <div className="flex gap-4">
            <button onClick={fetchAdminData} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-orange-500">
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <Link href="/admin/problems/new" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg">
              <Plus size={18} className="inline mr-2" /> Add Problem
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Contest Management Section */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Settings size={16} /> Active & Upcoming Contests
            </h2>
            {contests.map(c => (
              <div key={c.id} className="bg-white border border-slate-200 p-8 rounded-[2.5rem] hover:border-orange-500 transition-all flex justify-between items-center">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[8px] font-black uppercase">{c.type}</span>
                    <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">{c.visibility}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 uppercase italic">{c.title}</h3>
                  <p className="text-slate-400 text-[10px] font-bold mt-1 tracking-widest">START: {new Date(c.start_time).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                   <Link href={`/contests/${c.id}`} className="p-3 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl"><ExternalLink size={18} /></Link>
                   <button className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 rounded-xl"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Clarification Section */}
          <div className="space-y-6">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={16} /> Contestant Inquiries
            </h2>
            <div className="space-y-4">
              {questions.map(q => (
                <div key={q.id} className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm">
                  <p className="text-[8px] font-black text-orange-500 uppercase mb-2">Ref: {q.competitions?.title}</p>
                  <p className="text-xs font-bold text-slate-700 italic mb-4">"{q.question}"</p>
                  
                  {q.answer ? (
                    <div className="bg-emerald-50 p-3 rounded-xl text-[11px] text-emerald-700 font-medium italic border border-emerald-100">
                      Ans: {q.answer}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea id={`ans-${q.id}`} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs outline-none focus:border-orange-500" placeholder="Type answer..." />
                      <button 
                        onClick={() => handleReply(q.id, (document.getElementById(`ans-${q.id}`) as HTMLTextAreaElement).value)}
                        className="w-full py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-600"
                      >
                        Reply & Publish
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}