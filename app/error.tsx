"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCcw, Home } from "lucide-react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("System Failure:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-8 border border-rose-100">
        <AlertTriangle className="text-rose-500" size={32} />
      </div>
      
      <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">
        Logic Error Detected
      </h1>
      
      <p className="text-slate-500 font-medium max-w-md mx-auto mb-10 leading-relaxed">
        Something went wrong in the core systems. The signal was lost or the execution stack overflowed.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-slate-200"
        >
          <RefreshCcw size={14} /> Retry Execution
        </button>
        
        <Link
          href="/"
          className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-all shadow-sm"
        >
          <Home size={14} /> Return to Home
        </Link>
      </div>
      
      <div className="mt-12 pt-8 border-t border-slate-100 w-full max-w-xs">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
          Digest ID: {error.digest || "unknown_sector"}
        </p>
      </div>
    </div>
  )
}
