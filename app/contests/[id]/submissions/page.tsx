"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Header from "@/components/header"
import ArenaNav from "@/components/arena-nav"
import { Loader2, Code2, CheckCircle2, XCircle, Clock, Database, ArrowUpRight } from "lucide-react"
import Link from "next/link"

import { checkRegistrationStatus } from "@/app/actions/contest-registration"

export default function ContestSubmissionsPage() {
  const { id } = useParams() as { id: string }
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // 1. Check Registration Status
        const regRes = await checkRegistrationStatus(id)
        setIsRegistered(regRes.isRegistered)
        
        if (!regRes.isRegistered) {
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from("submissions")
          .select(`
            *,
            problems (title)
          `)
          .eq("contest_id", id)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (!error) setSubmissions(data || [])
      } catch (err) {
        console.error("Error fetching arena submissions:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, supabase])

  if (!isRegistered) return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ArenaNav id={id} />
      <main className="max-w-7xl mx-auto px-6 py-32 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full border border-slate-100 mb-8 shadow-sm">
          <Database className="text-orange-500" size={32} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">Registration Required</h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
          You must register for this contest to view your submission history.
        </p>
        <Link 
          href={`/contests/${id}`}
          className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-slate-200"
        >
          Go to Dashboard to Register
        </Link>
      </main>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ArenaNav id={id} />
      
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">My Submissions</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">History of your tactical deployments in this arena</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-5">Time</th>
                <th className="px-6 py-5">Problem</th>
                <th className="px-6 py-5">Language</th>
                <th className="px-6 py-5">Verdict</th>
                <th className="px-6 py-5">Resources</th>
                <th className="px-8 py-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {submissions.map((sub) => (
                <tr key={sub.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700 font-mono">
                        {new Date(sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[8px] font-extrabold text-slate-300 uppercase tracking-tight">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-black text-slate-800 uppercase italic">
                      {sub.problems?.title || "Unknown Task"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                     <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-[9px] font-black uppercase text-slate-500">
                        {sub.language}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wide ${
                      sub.status === 'accepted' || sub.status === 'AC' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {sub.status === 'accepted' || sub.status === 'AC' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {sub.status || 'Pending'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                       <span className="flex items-center gap-1"><Clock size={10} /> {sub.runtime}s</span>
                       <span className="flex items-center gap-1"><Database size={10} /> {sub.memory}MB</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-all">
                      <ArrowUpRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}

              {submissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <p className="text-slate-300 font-black uppercase text-[10px] tracking-widest">No submissions recorded in this arena sector</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
