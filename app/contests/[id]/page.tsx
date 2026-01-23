"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Header from "@/components/header"
import ArenaNav from "@/components/arena-nav"
import { Loader2, Timer, Users, Trophy, Zap, Calendar, ArrowRight, UserCheck, ShieldQuestion } from "lucide-react"
import Link from "next/link"
import { registerForContest, checkRegistrationStatus } from "@/app/actions/contest-registration"
import { toast } from "sonner"

export default function ContestArenaPage() {
  const { id } = useParams() as { id: string }
  const [contest, setContest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState("")
  const [status, setStatus] = useState<"Upcoming" | "Live" | "Finished">("Upcoming")
  const [isRegistered, setIsRegistered] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        const { data: contestData, error: contestError } = await supabase
          .from("contests")
          .select("*, problems(id)")
          .eq("id", id)
          .single()

        if (!contestError) {
          setContest(contestData)
          if (user) {
            const statusRes = await checkRegistrationStatus(id)
            setIsRegistered(statusRes.isRegistered)
          }
        }
      } catch (err) {
        console.error("Error fetching contest data:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, supabase])

  useEffect(() => {
    if (!contest) return

    const calculateTime = () => {
      const now = new Date().getTime()
      const start = new Date(contest.start_time).getTime()
      const end = new Date(contest.end_time).getTime()

      if (now < start) {
        setStatus("Upcoming")
        setTimeLeft(formatTime(start - now))
      } else if (now < end) {
        setStatus("Live")
        setTimeLeft(formatTime(end - now))
      } else {
        setStatus("Finished")
        setTimeLeft("Ended")
      }
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [contest])

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleRegister = async () => {
    setIsRegistering(true)
    const res = await registerForContest(id)
    if (res.success) {
      toast.success("Successfully registered for the contest!")
      setIsRegistered(true)
    } else {
      toast.error(res.error || "Registration failed")
    }
    setIsRegistering(false)
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Loading Arena Data...</p>
    </div>
  )

  if (!contest) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <h2 className="text-2xl font-black text-slate-900 uppercase italic">Arena Not Found</h2>
      <Link href="/contests" className="mt-4 text-orange-500 font-bold uppercase text-[10px] tracking-widest hover:underline">
        Back to Lobby
      </Link>
    </div>
  )

  const isRegistrationOpen = () => {
    const now = new Date()
    const regStart = contest.registration_start_time ? new Date(contest.registration_start_time) : null
    const regEnd = contest.registration_end_time ? new Date(contest.registration_end_time) : null
    
    if (regStart && now < regStart) return false
    if (regEnd && now > regEnd) return false
    return true
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ArenaNav id={id} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm relative overflow-hidden">
               {/* Background Accent */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32" />
               
               <div className="relative z-10">
                 <div className="flex flex-wrap items-center gap-4 mb-8">
                   <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                     {contest.difficulty || "Ranked"} Arena
                   </span>
                   {status === "Live" && (
                     <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                       Live Now
                     </div>
                   )}
                   {isRegistered && (
                     <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 text-[10px] font-black uppercase tracking-widest">
                       <UserCheck size={12} />
                       Registered
                     </div>
                   )}
                 </div>

                 <h1 className="text-5xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter mb-6 leading-tight">
                   {contest.title}
                 </h1>
                 
                 <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 inline-flex flex-col mb-8">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <Timer size={14} className="text-orange-500" />
                     {status === "Upcoming" ? "Time Until Start" : status === "Live" ? "Time Remaining" : "Status"}
                   </span>
                   <span className="text-4xl font-black text-slate-900 italic tracking-tighter">
                     {timeLeft}
                   </span>
                 </div>

                 <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-2xl mb-12">
                   {contest.description || "Take part in this epic coding battle. Solve problems, climb the leaderboard, and claim victory."}
                 </p>

                 <div className="flex flex-wrap gap-4">
                   {isRegistered ? (
                     <Link 
                       href={`/contests/${id}/problems`}
                       className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-orange-500 transition-all shadow-2xl shadow-slate-200 flex items-center gap-3 group"
                     >
                       Enter Arena
                       <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                     </Link>
                   ) : isRegistrationOpen() ? (
                     <button
                       onClick={handleRegister}
                       disabled={isRegistering}
                       className="bg-orange-500 text-white px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-900 transition-all shadow-2xl shadow-orange-200 flex items-center gap-3 group disabled:opacity-50"
                     >
                       {isRegistering ? (
                         <Loader2 className="animate-spin" size={18} />
                       ) : (
                         <UserCheck size={18} />
                       )}
                       Register For Contest
                     </button>
                   ) : (
                     <div className="bg-slate-100 text-slate-400 px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest cursor-not-allowed flex items-center gap-3">
                       <ShieldQuestion size={18} />
                       Registration Closed
                     </div>
                   )}
                 </div>
               </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
               
               <h3 className="text-xl font-black italic uppercase mb-8 flex items-center gap-2 relative z-10">
                 <Zap className="text-orange-500" size={20}/> Quick Stats
               </h3>
               
               <div className="grid gap-4 relative z-10">
                 <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Participants</p>
                   <div className="flex items-center gap-3">
                     <Users size={20} className="text-orange-400" />
                     <p className="text-2xl font-black italic">{contest.participants || 0}</p>
                   </div>
                 </div>
                 
                 <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Number of Tasks</p>
                   <div className="flex items-center gap-3">
                     <Trophy size={20} className="text-orange-400" />
                     <p className="text-2xl font-black italic">{contest.problems?.length || 0}</p>
                   </div>
                 </div>

                 <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Official Schedule</p>
                   <div className="space-y-2">
                     <div className="flex items-center gap-2 text-[10px] font-bold">
                       <Calendar size={12} className="text-slate-400" />
                       {new Date(contest.start_time).toLocaleString()}
                     </div>
                     <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-5">TO</p>
                     <div className="flex items-center gap-2 text-[10px] font-bold">
                       <Calendar size={12} className="text-slate-400" />
                       {new Date(contest.end_time).toLocaleString()}
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
