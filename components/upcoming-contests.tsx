"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Calendar, Users, ArrowUpRight, Trophy } from "lucide-react"

export default function UpcomingContestsPremiumBg() {
  const supabase = createClient()
  const [contests, setContests] = useState<any[]>([])
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
        if (!error) setContests(data || [])
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
    <section className="relative py-16 px-6 overflow-hidden bg-white">

      {/* Background Premium Hero Style */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-orange-100/30 rounded-full blur-[120px] -z-10"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-orange-400 to-rose-400 text-xs font-semibold text-white tracking-wide">PROGRAMMING ARENA</span>
            <h1 className="mt-4 text-5xl md:text-6xl font-extrabold leading-tight tracking-tighter">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-orange-500">Upcoming</span>
              <span className="ml-2 text-slate-400 italic">Contests</span>
            </h1>
            <p className="mt-3 text-sm text-slate-500 max-w-xl">Hand-picked, short & intense contests to test your skills. Smooth UI, subtle motion and useful metadata at a glance.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/contests" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow-sm border border-slate-100 text-sm font-semibold hover:shadow-md transition">
              Explore lobby <ArrowUpRight size={14} />
            </Link>
            <Link href="/contests/create" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:brightness-95 transition">
              Create Contest
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {loading && contests.length === 0 ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-100 animate-pulse" />
            ))
          ) : contests.length > 0 ? contests.map((c: any) => (
            <article
              key={c.id}
              className="relative rounded-3xl overflow-hidden border border-slate-100 bg-white/70 backdrop-blur-[8px] p-6 shadow-[0_10px_30px_-12px_rgba(2,6,23,0.08)] group hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-rose-500" />

              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-2 bg-white/40 px-3 py-1.5 rounded-xl border border-slate-50 shadow-sm">
                  <Calendar size={14} className="text-orange-500" />
                  <div className="text-[11px] text-slate-700 font-bold uppercase">
                    {new Date(c.start_time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
                <div className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900 text-white font-black uppercase tracking-tighter italic">
                  {c.difficulty || 'Open'}
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight uppercase italic group-hover:text-orange-500 transition-colors">
                {c.title}
              </h3>
              <p className="text-xs text-slate-400 mb-6 font-medium leading-relaxed line-clamp-2">
                {c.description || 'Join this curated contest to level up your skills. Short duration, high signal.'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center">
                        <Users size={12} className="text-slate-300" />
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-green-700 font-bold uppercase tracking-widest">Active</div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Countdown start={c.start_time} now={now} />
                  <Link href={`/contests/${c.id}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition shadow-lg shadow-slate-200">
                    Enter Arena
                  </Link>
                </div>
              </div>
            </article>
          )) : (
            <div className="col-span-3 rounded-[3rem] bg-white/60 backdrop-blur-sm border border-slate-100 p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Trophy size={40} className="text-slate-200" />
              </div>
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">No upcoming battles</h4>
              <p className="text-[10px] text-slate-300 mt-2 uppercase font-bold">Check back soon for new announcements</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        /* Optional: subtle blur radial animation */
        @keyframes bg-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </section>
  )
}

function Countdown({ start, now }: { start: string, now: number }) {
  const startTs = new Date(start).getTime()
  const diff = Math.max(0, startTs - now)

  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  if (diff === 0) {
    return <div className="text-[10px] font-black text-emerald-500 uppercase italic">Live Now</div>
  }

  return (
    <div className="text-right">
      <div className="text-sm font-black text-slate-900 italic tracking-tighter leading-none">
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </div>
      <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Remaining</div>
    </div>
  )
}

function pad(n: number) { return String(n).padStart(2, '0') }