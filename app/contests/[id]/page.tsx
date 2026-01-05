"use client"

import { useState, useEffect, use } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import {
  ArrowLeft,
  Trophy,
  Calendar,
  Clock,
  Users,
  Code2,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

export default function ContestDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const supabase = createClient()

  const [contest, setContest] = useState<any>(null)
  const [problems, setProblems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "problems" | "leaderboard" | "clarifications">(
    "overview"
  )

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch contest from the new 'contests' table
        const { data: contestData, error: contestError } = await supabase
          .from("contests") // Updated table name
          .select("*")
          .eq("id", resolvedParams.id)
          .single()

        if (contestError) throw contestError
        setContest(contestData)

        // 2. Fetch problems using the new 'contest_id' foreign key
        // Puronote data.problems array thakle seta thakbe, kinte relational query kora better
        const { data: probs, error: probError } = await supabase
          .from("problems")
          .select("id, title, difficulty, points")
          .eq("contest_id", resolvedParams.id) // Updated column name

        if (probError) throw probError
        setProblems(probs || [])

      } catch (err: any) {
        toast.error(err.message)
        console.error("Error loading data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [resolvedParams.id, supabase])

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-linear-to-br from-slate-50 via-white to-orange-50">
        <Loader2 size={48} className="animate-spin text-orange-500" />
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="min-h-screen grid place-items-center bg-linear-to-br from-slate-50 via-white to-orange-50 text-center">
        <div>
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Contest not found</h2>
          <Link href="/contests" className="text-orange-500 hover:underline mt-2 inline-block">Return to list</Link>
        </div>
      </div>
    )
  }

  // Rest of your rendering logic remains the same...
  const start = new Date(contest.start_time)
  const end = new Date(contest.end_time)
  const now = new Date()
  const isLive = now >= start && now <= end
  const isUpcoming = now < start

  const difficultyStyle: any = {
    Easy: "bg-emerald-50 text-emerald-700 border-emerald-300",
    Medium: "bg-yellow-50 text-yellow-700 border-yellow-300",
    Hard: "bg-red-50 text-red-700 border-red-300",
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-orange-50 text-slate-800">
      {/* ... (Hero Header and Meta Cards same as before) */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute -top-40 -right-40 w-130 h-130 bg-orange-300/40 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6 py-14">
          <Link href="/contests" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-500 mb-8">
            <ArrowLeft size={16} /> Back to Contests
          </Link>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="p-6 rounded-3xl bg-linear-to-br from-orange-500 to-orange-600 shadow-2xl">
              <Trophy size={38} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex gap-3 mb-4">
                {isLive && <span className="px-4 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 uppercase tracking-wider animate-pulse">LIVE</span>}
                {isUpcoming && <span className="px-4 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-700 uppercase tracking-wider">UPCOMING</span>}
              </div>
              <h1 className="text-5xl font-black tracking-tight leading-tight">{contest.title}</h1>
              <p className="mt-4 text-slate-600 max-w-3xl leading-relaxed">{contest.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Meta Cards Section */}
      <section className="max-w-7xl mx-auto px-6 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { icon: Calendar, label: "Start Time", value: start.toLocaleString() },
            { icon: Clock, label: "End Time", value: end.toLocaleString() },
            { icon: Code2, label: "Problems", value: problems.length },
            { icon: Users, label: "Mode", value: contest.contest_mode || "ICPC" },
          ].map((item, i) => (
            <div key={i} className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_18px_60px_rgba(0,0,0,0.1)] transition">
              <div className="flex items-center gap-3 text-slate-500 text-sm mb-1">
                <item.icon size={18} />
                {item.label}
              </div>
              <p className="font-black text-lg">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-6 mt-14 pb-20">
        <div className="inline-flex bg-white border rounded-2xl p-1 shadow-inner mb-10">
          {["overview", "problems", "leaderboard", "clarifications"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-xl text-sm font-black uppercase transition ${
                activeTab === tab ? "bg-linear-to-r from-orange-500 to-orange-600 text-white shadow-lg" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="bg-white/90 backdrop-blur border rounded-3xl p-10">
            <h2 className="text-2xl font-black flex items-center gap-2 mb-6">
              <Zap className="text-orange-500" /> Contest Rules
            </h2>
            <ul className="space-y-4 text-slate-600">
              {["Automatic judging and verdict system", "Live ranking with penalty-based scoring", "Multiple programming languages supported"].map((rule, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-500" size={18} />
                  {rule}
                </li>
              ))}
            </ul>
            {isLive && (
              <Link href={`/contests/${resolvedParams.id}/arena`} className="block mt-12 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-5 rounded-2xl text-center font-black text-lg shadow-xl transition active:scale-[0.97]">
                Enter Arena
              </Link>
            )}
            {isUpcoming && <p className="mt-10 text-center text-blue-600 font-semibold italic">Contest starts at {start.toLocaleString()}</p>}
          </div>
        )}

        {activeTab === "problems" && (
          <div className="grid gap-4">
            {problems.length > 0 ? problems.map((p, i) => (
              <Link key={p.id} href={`/problems/${p.id}`} className="relative group block bg-white border rounded-2xl p-6 overflow-hidden hover:border-orange-300 hover:shadow-xl transition">
                <div className="absolute left-0 top-0 h-full w-1 bg-orange-500 opacity-0 group-hover:opacity-100 transition" />
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-lg group-hover:text-orange-500 transition">{p.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 uppercase tracking-tighter">Problem {i + 1}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black border ${difficultyStyle[p.difficulty] || difficultyStyle.Easy}`}>
                      {p.difficulty}
                    </span>
                    <span className="text-2xl font-black text-orange-500">{p.points ?? 100}</span>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="text-center py-20 bg-white border rounded-3xl text-slate-400 font-medium italic">No problems have been added to this contest yet.</div>
            )}
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="rounded-3xl border overflow-hidden bg-white shadow-sm">
             <iframe src={`/contests/${resolvedParams.id}/leaderboard`} title="Leaderboard" className="w-full min-h-[600px] border-none" />
          </div>
        )}

        {activeTab === "clarifications" && (
          <div className="rounded-3xl border overflow-hidden bg-white shadow-sm">
            <iframe src={`/contests/${resolvedParams.id}/clarifications`} title="Clarifications" className="w-full min-h-[600px] border-none" />
          </div>
        )}
      </section>
    </div>
  )
}