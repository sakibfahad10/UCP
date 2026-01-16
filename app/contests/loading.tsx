import { Loader2 } from "lucide-react"

export default function ContestsLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Initializing Contest Lobby...</p>
    </div>
  )
}
