"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Calendar, Users, ArrowUpRight, Trophy, Plus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Contest } from "@/types"

export default function UpcomingContests() {
  const supabase = createClient()
  const { user } = useAuth()
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const isoNow = new Date().toISOString()
        const { data, error } = await supabase
          .from("contests")
          .select("*")
          .gt("start_time", isoNow)
          .order("start_time", { ascending: true })
          .limit(3)

        if (!mounted) return
        if (!error) setContests((data as any) || [])
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [supabase])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative py-24 px-6 overflow-hidden bg-white">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-100/20 rounded-full blur-[100px] -z-10" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-8">
          <div className="max-w-xl">
            <span className="inline-block px-4 py-1.5 rounded-xl bg-orange-50 text-[10px] font-black text-orange-600 tracking-[0.2em] uppercase mb-4 border border-orange-100">Battlegrounds</span>
            <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter text-slate-900 uppercase italic">
              Upcoming <span className="text-orange-500 underline decoration-slate-200">Arenas</span>
            </h1>
            <p className="mt-6 text-slate-500 font-medium leading-relaxed">
              Synchronize your clocks. The next phase of competition begins shortly. Short duration, high intensity, maximum reward.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/contests" className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
              Lobby <ArrowUpRight size={14} />
            </Link>
            {user?.is_admin && (
              <Link href="/admin/contests/create" className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-slate-200">
                <Plus size={14} /> Create Arena
              </Link>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {loading && contests.length === 0 ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-[2.5rem] bg-slate-50 border border-slate-100 animate-pulse" />
            ))
          ) : contests.length > 0 ? (
            contests.map((c) => (
              <article
                key={c.id}
                className="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-white p-8 shadow-sm group hover:shadow-2xl hover:border-orange-200 transition-all duration-500"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <Calendar size={14} className="text-orange-500" />
                    <span className="text-[10px] text-slate-900 font-black uppercase tracking-widest">
                      {new Date(c.start_time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-tighter italic rounded-lg">
                    {c.max_participants > 0 ? 'Limited' : 'Open'}
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-2 leading-none uppercase italic group-hover:text-orange-600 transition-colors">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-400 mb-8 font-medium leading-relaxed line-clamp-2">
                  {c.description || 'Prepare for deployment. This arena features advanced algorithmic challenges.'}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-9 h-9 rounded-2xl bg-slate-100 border-2 border-white flex items-center justify-center text-slate-300">
                        <Users size={14} />
                      </div>
                    ))}
                    <div className="w-9 h-9 rounded-2xl bg-orange-50 border-2 border-white flex items-center justify-center text-orange-500 text-[10px] font-black italic">
                      +
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <Countdown start={c.start_time} now={now} />
                    <Link href={`/contests/${c.id}`} className="px-5 py-3 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all">
                      Battle Log
                    </Link>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-3 rounded-[3.5rem] bg-slate-50 border border-dashed border-slate-200 p-24 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Trophy size={40} className="text-slate-100" />
              </div>
              <h4 className="text-sm font-black text-slate-300 uppercase tracking-[0.4em]">Arena Transmission Silent</h4>
              <p className="text-[10px] text-slate-300 mt-2 uppercase font-bold">New announcements pending verification</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function Countdown({ start, now }: { start: string; now: number }) {
  const startTs = new Date(start).getTime()
  const diff = Math.max(0, startTs - now)

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  if (diff === 0) {
    return <div className="text-[10px] font-black text-emerald-500 uppercase italic">Live Now</div>
  }

  return (
    <div className="text-right">
      <div className="text-sm font-black text-slate-900 italic tracking-tighter leading-none">
        {days > 0 ? `${days}d ` : ""}{pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </div>
      <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Starting In</div>
    </div>
  )
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}