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
  Loader2,
  Lock,
  UserPlus
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

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
  const [user, setUser] = useState<any>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
     const timer = setInterval(() => {
       setNow(new Date())
     }, 1000)
     return () => clearInterval(timer)
   }, [])

  useEffect(() => {
    async function loadData() {
      try {
        // 0. Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        setUser(currentUser)

        // 1. Fetch contest from the new 'contests' table
        const { data: contestData, error: contestError } = await supabase
          .from("contests")
          .select("*")
          .eq("id", resolvedParams.id)
          .single()

        if (contestError) throw contestError
        setContest(contestData)

        // 2. Check registration status if user is logged in
        if (currentUser) {
          const { data: registration, error: regError } = await supabase
            .from("registrations")
            .select("*")
            .eq("contest_id", resolvedParams.id)
            .eq("user_id", currentUser.id)
            .single()

          if (!regError && registration) {
            setIsRegistered(true)
          }
        }

        // 3. Fetch problems using the new 'contest_id' foreign key
        const { data: probs, error: probError } = await supabase
          .from("problems")
          .select("id, title, difficulty, points")
          .eq("contest_id", resolvedParams.id)

        if (probError) throw probError
        setProblems(probs || [])

      } catch (err: any) {
        // Ignore "PGRST116" error which is "Results contain 0 rows" for single() calls
        if (err.code !== "PGRST116") {
          toast.error(err.message)
          console.error("Error loading data:", err)
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [resolvedParams.id, supabase])

  const handleRegister = async () => {
    if (!user) {
      toast.error("You must be logged in to register")
      return
    }

    setRegistering(true)
    try {
      const { error } = await supabase
        .from("registrations")
        .insert({
          contest_id: resolvedParams.id,
          user_id: user.id,
          type: "INDIVIDUAL", // Default to individual for now
          status: "APPROVED"
        })

      if (error) throw error

      setIsRegistered(true)
      toast.success("Successfully registered for the contest!")
      setActiveTab("problems")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-50 via-white to-orange-50">
        <Loader2 size={48} className="animate-spin text-orange-500" />
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-50 via-white to-orange-50 text-center">
        <div>
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Contest not found</h2>
          <Link href="/contests" className="text-orange-500 hover:underline mt-2 inline-block">Return to list</Link>
        </div>
      </div>
    )
  }

  const start = new Date(contest.start_time)
  const end = new Date(contest.end_time)
  const isLive = now >= start && now <= end
  const isUpcoming = now < start
  const isEnded = now > end
  
  // Registration window check
  const regStart = contest.registration_start_time ? new Date(contest.registration_start_time) : null
  const regEnd = contest.registration_end_time ? new Date(contest.registration_end_time) : null
  const isRegistrationOpen = (!regStart || now >= regStart) && (!regEnd || now <= regEnd)

  const getTimeLeft = (target: Date) => {
    const diff = target.getTime() - now.getTime()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    }
  }

  const difficultyStyle: any = {
    Easy: "bg-emerald-50 text-emerald-700 border-emerald-300",
    Medium: "bg-yellow-50 text-yellow-700 border-yellow-300",
    Hard: "bg-red-50 text-red-700 border-red-300",
  }

  const RestrictedAccess = () => (
    <div className="bg-white/90 backdrop-blur-md border rounded-3xl p-10 text-center py-20">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock size={32} className="text-slate-400" />
      </div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">Registration Required</h2>
      <p className="text-slate-500 max-w-md mx-auto mb-8">
        You must register for this contest to view problems, submit solutions, and see the scoreboard.
      </p>
      
      {isRegistered ? (
         <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                <CheckCircle size={18} />
                You are registered
            </div>
             <p className="text-sm text-slate-400 mt-2">The contest hasn't started yet.</p>
         </div>
      ) : isRegistrationOpen ? (
        <Button 
          onClick={handleRegister} 
          disabled={registering || !user}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 rounded-2xl text-lg font-bold shadow-xl shadow-orange-500/20"
        >
          {registering ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Registering...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-5 w-5" />
              Register Now
            </>
          )}
        </Button>
      ) : (
        <div className="inline-block bg-slate-100 text-slate-500 pixel-font px-6 py-3 rounded-xl border border-slate-200">
            Registration Closed
        </div>
      )}
      
      {!user && (
         <p className="mt-6 text-sm text-slate-500">
            <Link href="/auth" className="text-orange-500 hover:underline font-bold">Log in</Link> to register.
         </p>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 text-slate-800">
      <section className="relative overflow-hidden border-b">
        <div className="absolute -top-40 -right-40 w-[32rem] h-[32rem] bg-orange-300/40 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6 py-14">
          <Link href="/contests" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-500 mb-8">
            <ArrowLeft size={16} /> Back to Contests
          </Link>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-2xl">
              <Trophy size={38} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex gap-3 mb-4">
                {isLive && <span className="px-4 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 uppercase tracking-wider animate-pulse">LIVE</span>}
                {isUpcoming && <span className="px-4 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-700 uppercase tracking-wider">UPCOMING</span>}
              </div>
              <h1 className="text-5xl font-black tracking-tight leading-tight">{contest.title}</h1>
              <p className="mt-4 text-slate-600 max-w-3xl leading-relaxed">{contest.description}</p>
              
               {!isEnded && (
                 <div className="mt-8">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                        <Clock size={14} />
                        {isUpcoming ? "Contest Starts In" : "Time Remaining"}
                    </p>
                    <div className="flex items-center gap-3">
                        {(() => {
                            const t = getTimeLeft(isUpcoming ? start : end)
                            return [
                                { value: t.days, label: "Days" },
                                { value: t.hours, label: "Hours" },
                                { value: t.minutes, label: "Mins" },
                                { value: t.seconds, label: "Secs" },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center bg-white/80 backdrop-blur border border-slate-200 rounded-2xl p-4 min-w-[80px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition hover:-translate-y-1">
                                    <span className="text-3xl font-black text-slate-800 tabular-nums leading-none">
                                        {item.value.toString().padStart(2, "0")}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                        {item.label}
                                    </span>
                                </div>
                            ))
                        })()}
                    </div>
                 </div>
               )}
               {isEnded && (
                   <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-500 font-bold text-sm">
                       <CheckCircle size={16} /> Contest Concluded
                   </div>
               )}
            </div>
            {/* Action Card */}
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border shadow-sm min-w-[300px]">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    {isRegistered ? <CheckCircle className="text-emerald-500" size={20} /> : <UserPlus className="text-orange-500" size={20} />}
                    {isRegistered ? "Registered" : "Registration"}
                </h3>
                
                {isRegistered ? (
                    <div className="text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm font-medium">
                        You are registered for this contest.
                    </div>
                ) : (
                     <Button 
                        onClick={handleRegister} 
                        disabled={registering || !isRegistrationOpen || !user}
                        className="w-full bg-slate-900 text-white hover:bg-slate-800"
                    >
                        {registering ? "Registering..." : isRegistrationOpen ? "Register Now" : "Registration Closed"}
                    </Button>
                )}
                
                {isRegistrationOpen && !isRegistered && user && (
                    <p className="text-xs text-slate-500 mt-3 text-center">
                        Click to join the contest
                    </p>
                )}
                 {!user && !isRegistered && (
                    <p className="text-xs text-slate-500 mt-3 text-center">
                        Please <Link href="/auth" className="underline">login</Link> to register
                    </p>
                )}
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
            <div key={i} className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_18px_60px_rgba(0,0,0,0.1)] transition">
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
                activeTab === tab ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="bg-white/90 backdrop-blur-md border rounded-3xl p-10">
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
             {/* If live and registered, show Enter Arena button which switches to problems */}
            {isLive && isRegistered && (
              <button onClick={() => setActiveTab("problems")} className="block w-full mt-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-5 rounded-2xl text-center font-black text-lg shadow-xl transition active:scale-[0.97]">
                Enter Arena
              </button>
            )}
             {/* If live but NOT registered, show register button */}
             {isLive && !isRegistered && isRegistrationOpen && (
                 <button onClick={handleRegister} disabled={registering} className="block w-full mt-12 bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-2xl text-center font-black text-lg shadow-xl transition active:scale-[0.97]">
                    {registering ? "Registering..." : "Register to Participate"}
                 </button>
             )}

            {isUpcoming && <p className="mt-10 text-center text-blue-600 font-semibold italic">Contest starts at {start.toLocaleString()}</p>}
          </div>
        )}

        {/* Protection for restricted tabs */}
        {activeTab !== "overview" && !isRegistered ? (
             <RestrictedAccess />
        ) : (
            <>
                {activeTab === "problems" && (
                <div className="grid gap-4">
                    {problems.length > 0 ? problems.map((p, i) => (
                    <Link key={p.id} href={`/contests/${resolvedParams.id}/problems/${p.id}`} className="relative group block bg-white border rounded-2xl p-6 overflow-hidden hover:border-orange-300 hover:shadow-xl transition">
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
            </>
        )}
      </section>
    </div>
  )
}