import { Search, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-32 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-white rounded-[2rem] border border-slate-100 flex items-center justify-center mb-8 shadow-sm">
          <Search className="text-orange-500" size={40} />
        </div>

        <h1 className="text-7xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">
          404: Lost in Matrix
        </h1>
        
        <p className="text-slate-500 font-medium max-w-md mx-auto mb-12 text-lg">
          The requested path does not exist in our systems. It may have been deleted, moved, or never compiled.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-orange-500 hover:-translate-y-1 transition-all shadow-2xl shadow-slate-200"
        >
          <ArrowLeft size={16} /> Back to Hub
        </Link>
      </main>
    </div>
  )
}
