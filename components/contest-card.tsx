"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Timer, ArrowRight, Zap } from "lucide-react"
import ArenaLoading from "./arena-loading"

export default function ContestCard({ contest }: { contest: any }) {
  const [isEntering, setIsEntering] = useState(false)
  const router = useRouter()

  const handleEnterArena = () => {
    setIsEntering(true)
    // Generating a professional delay of 1.5 seconds
    setTimeout(() => {
      router.push(`/contests/${contest.id}/arena`)
    }, 1500)
  }

  return (
    <>
      {isEntering && <ArenaLoading />}
      
      <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <span className="bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-orange-100">
              Live Now
            </span>
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase">
               <Timer size={14} className="text-orange-500" /> Ends in: 01:20:45
            </div>
          </div>

          <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-orange-500 transition-colors">
            {contest.title}
          </h3>
          <p className="text-slate-500 text-sm mb-8 line-clamp-2">{contest.description}</p>

          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase">
               <Users size={14} /> {contest.participants || 0} Joined
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase">
               <Zap size={14} /> Ranked
            </div>
          </div>

          <button 
            onClick={handleEnterArena}
            className="w-full bg-slate-900 hover:bg-orange-500 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            ENTER ARENA <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </>
  )
}