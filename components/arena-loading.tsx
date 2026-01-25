"use client"

import { Loader2, Zap } from "lucide-react"

export default function ArenaLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative bg-slate-900 p-6 rounded-[2rem] shadow-2xl shadow-orange-200">
            <Zap className="w-12 h-12 text-orange-500 animate-bounce" fill="currentColor" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-slate-100">
            <Loader2 className="w-6 h-6 text-slate-900 animate-spin" />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter mb-2">
          Entering <span className="text-orange-500">Arena</span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Syncing Neural Link</p>
        </div>
      </div>
    </div>
  )
}

