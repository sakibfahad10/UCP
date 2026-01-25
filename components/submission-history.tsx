"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle2, XCircle, Clock, Code2, Cpu } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function SubmissionHistory({ userId }: { userId: string }) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchSubmissions = async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (!error) setSubmissions(data)
      setLoading(false)
    }

    fetchSubmissions()

    // Real-time update listener
    const channel = supabase
      .channel("realtime-submissions")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "submissions", filter: `user_id=eq.${userId}` },
        (payload) => {
          setSubmissions((prev) => [payload.new, ...prev])
        })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  if (loading) return <div className="animate-pulse text-slate-400 font-black text-xs uppercase tracking-widest">Fetching Logs...</div>

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black uppercase text-slate-900 tracking-tighter">Submission Logs</h3>
        <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase">
          Total: {submissions.length}
        </span>
      </div>

      <div className="overflow-hidden border-2 border-slate-900 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Problem</th>
              <th className="px-6 py-4">Lang</th>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4 text-right">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100">
            {submissions.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-2 font-black text-xs uppercase italic ${sub.status === 'Accepted' ? 'text-green-500' : 'text-red-500'
                    }`}>
                    {sub.status === 'Accepted' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    {sub.status}
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-slate-700 text-sm">{sub.problem_id}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black uppercase text-slate-500 border border-slate-200">
                    {sub.language}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 font-bold text-xs">
                  {sub.runtime ? `${sub.runtime}s` : "0s"}
                </td>
                <td className="px-6 py-4 text-right text-slate-400 font-bold text-[10px] uppercase">
                  {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {submissions.length === 0 && (
          <div className="py-20 text-center">
            <Code2 className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No transmissions found in history</p>
          </div>
        )}
      </div>
    </div>
  )
}