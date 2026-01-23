"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, Timer, ArrowRight, Zap, Trophy, Calendar } from "lucide-react"
import ArenaLoading from "./arena-loading"

interface Contest {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
  participants?: number
  difficulty?: string
}

export default function ContestCard({ contest }: { contest: Contest }) {
  const [isEntering, setIsEntering] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [status, setStatus] = useState<"Upcoming" | "Live" | "Finished">("Upcoming")
  const router = useRouter()

  useEffect(() => {
    const calculateStatusAndTimer = () => {
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

    calculateStatusAndTimer()
    const interval = setInterval(calculateStatusAndTimer, 1000)
    return () => clearInterval(interval)
  }, [contest.start_time, contest.end_time])

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleEnterArena = () => {
    setIsEntering(true)
    setTimeout(() => {
      router.push(`/contests/${contest.id}`)
    }, 1200)
  }

  return (
    <>
      {isEntering && <ArenaLoading />}
      
      <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] relative overflow-hidden group hover:shadow-2xl hover:shadow-orange-100 transition-all duration-500">
        {/* Animated background accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-100 transition-colors" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col gap-1">
              {status === "Live" ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Live Now
                </div>
              ) : status === "Upcoming" ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full border border-orange-100 text-[10px] font-black uppercase tracking-widest">
                  <Calendar size={12} />
                  Upcoming
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-500 rounded-full border border-slate-100 text-[10px] font-black uppercase tracking-widest">
                  <Trophy size={12} />
                  Finished
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
               <Timer size={14} className={status === "Live" ? "text-orange-500" : "text-slate-400"} /> 
               {status === "Finished" ? "Ended" : `${status === "Upcoming" ? "Starts" : "Ends"} in: ${timeLeft}`}
            </div>
          </div>

          <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-orange-500 transition-colors leading-tight">
            {contest.title}
          </h3>
          <p className="text-slate-500 text-sm mb-8 line-clamp-2 font-medium">
            {contest.description || "No description provided for this arena battle."}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
               <Users size={14} className="text-orange-400" /> 
               <span>{contest.participants || 0} Joined</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
               <Zap size={14} className="text-orange-400" /> 
               <span>{contest.difficulty || "Ranked"}</span>
            </div>
          </div>

          <button 
            onClick={handleEnterArena}
            disabled={status === "Finished"}
            className={`w-full py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${
              status === "Finished" 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                : "bg-slate-900 hover:bg-orange-500 text-white shadow-slate-200"
            }`}
          >
            {status === "Finished" ? "ARENA CLOSED" : "ENTER ARENA"} 
            {status !== "Finished" && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </>
  )
}