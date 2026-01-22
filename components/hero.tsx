"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Play, Trophy, Terminal, Sparkles, ChevronRight, Star } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white">
      {/* Background Decor: Animated Grid & Blobs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-orange-100/30 rounded-full blur-[120px] -z-10"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-600 text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
              <Sparkles size={14} />
              <span>Next Gen Coding Platform</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[0.9]">
                Code. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Compete.</span> <br />
                Conquer.
              </h1>
              <p className="text-slate-500 text-xl leading-relaxed max-w-md font-medium">
                The ultimate arena for <span className="text-slate-900 font-bold">151+ university coders</span>. 
                Solve, rank, and elevate your career.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/problems" className="group relative bg-slate-900 text-white px-10 py-5 rounded-2xl font-black flex items-center gap-3 overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-slate-200">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <Play size={18} fill="currentColor" className="relative z-10" />
                <span className="relative z-10 tracking-widest">START CODING</span>
              </Link>
              
              <Link href="/leaderboard" className="bg-white border-2 border-slate-100 text-slate-900 px-10 py-5 rounded-2xl font-black flex items-center gap-3 hover:border-orange-500 transition-all hover:shadow-lg active:scale-95">
                <Trophy size={18} className="text-orange-500" />
                <span>LEADERBOARD</span>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-10 pt-4 border-t border-slate-100">
              <div>
                <p className="text-2xl font-black text-slate-900">1.2k+</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Submissions</p>
              </div>
              <div className="w-px h-10 bg-slate-100"></div>
              <div>
                <p className="text-2xl font-black text-slate-900">50+</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Contests</p>
              </div>
            </div>
          </div>

          {/* Right - Premium Terminal View */}
          <div className="relative">
            {/* Floating Decorative Cards */}
            <div className="absolute -top-6 -right-6 bg-white border border-slate-100 p-4 rounded-2xl shadow-xl z-20 hidden md:block animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Star size={20} fill="currentColor" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Top Performer</p>
                  <p className="text-sm font-bold text-slate-900">Anik Rahman</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-10 -left-10 bg-white border border-slate-100 p-5 rounded-3xl shadow-2xl z-20 hidden md:flex items-center gap-4">
               <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                  <Terminal size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Streak</p>
                  <p className="text-lg font-black text-slate-900">12 Days 🔥</p>
               </div>
            </div>

            {/* Main Editor */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-[#0F172A] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 transition-transform duration-500 hover:-rotate-1">
                {/* Editor Top Bar */}
                <div className="bg-slate-800/50 px-8 py-5 flex justify-between items-center border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                    C++ Compiler Ready
                  </div>
                </div>

                {/* Code Body */}
                <div className="p-10 font-mono text-sm leading-[1.8]">
                  <p><span className="text-pink-400">#include</span> <span className="text-teal-400">&lt;iostream&gt;</span></p>
                  <p><span className="text-pink-400">using namespace</span> <span className="text-white">std;</span></p>
                  <p>&nbsp;</p>
                  <p><span className="text-blue-400">int</span> <span className="text-amber-300">main</span>() {"{"}</p>
                  <p className="ml-6 flex items-center">
                    <span className="text-white">cout</span> <span className="text-pink-400 mx-2">{"<<"}</span> 
                    <span className="text-teal-400">"Build your future."</span><span className="text-white">;</span>
                    <span className="w-2 h-5 bg-orange-500 ml-2 animate-pulse"></span>
                  </p>
                  <p className="ml-6"><span className="text-pink-400">return</span> <span className="text-orange-400">0</span>;</p>
                  <p>{"}"}</p>

                  <div className="mt-10 p-6 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Console Output</span>
                      <ChevronRight size={14} className="text-slate-500" />
                    </div>
                    <p className="text-teal-400 font-bold tracking-tight">Build your future.</p>
                    <p className="text-slate-500 text-[11px] mt-1 italic">Execution time: 0.002s</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite ease-in-out;
        }
      `}</style>
    </section>
  )
}