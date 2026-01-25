"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft, Save, Globe, Lock,
  Calendar, Clock, BookOpen, Settings2,
  AlertCircle, Database
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
// Assuming you created components/admin/problem-picker.tsx
import ProblemPicker from "@/components/admin/problem-picker"
import { localDatetimeStringToUTC } from "@/lib/date-utils"

export default function NewContestPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    registration_start_time: "",
    registration_end_time: "",
    max_participants: 0,
    allow_teams: false,
    problems: [] as string[], // Selected problem IDs will be here
    rules: {
      penalty_per_wrong_submission: 20,
      show_leaderboard_immediately: true,
      contest_mode: "icpc"
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.problems.length === 0) {
      toast.error("Please select at least one problem for the contest.")
      return
    }

    setIsSubmitting(true)

    const payload = {
      ...formData,
      start_time: localDatetimeStringToUTC(formData.start_time),
      end_time: localDatetimeStringToUTC(formData.end_time),
      registration_start_time: localDatetimeStringToUTC(formData.registration_start_time),
      registration_end_time: localDatetimeStringToUTC(formData.registration_end_time),
    }

    const { error } = await supabase
      .from("contests")
      .insert([payload])

    if (error) {
      toast.error("Error creating contest: " + error.message)
    } else {
      toast.success("Contest launched successfully!")
      router.push("/admin/contests")
    }
    setIsSubmitting(false)
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* --- Top Bar --- */}
      <div className="flex items-center justify-between mb-12">
        <Link 
          href="/admin/contests" 
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back to Arena
        </Link>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase rounded-full border border-orange-100">
            Draft Mode
          </span>
        </div>
      </div>

      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Configure New Event</h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Initialize time-window and problem sets</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* --- Section 1: Basic Information --- */}
        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <Globe size={16} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">General Identity</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Contest Title</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Winter Sprint Championship 2026"
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500/20 outline-none transition-all placeholder:text-slate-300"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Event Description</label>
              <textarea 
                rows={3}
                placeholder="Describe the contest rules and prizes..."
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500/20 outline-none transition-all placeholder:text-slate-300"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* --- NEW SECTION: Problem Selection --- */}
        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-100">
              <Database size={16} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Problem Set</h3>
          </div>
          
          <ProblemPicker 
            selectedIds={formData.problems}
            onSelectionChange={(ids) => setFormData({...formData, problems: ids})}
          />
        </div>

        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Calendar size={18} className="text-orange-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Start Sequence</h3>
                </div>
                <input 
                  required
                  type="datetime-local" 
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-orange-500/20 outline-none uppercase"
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Clock size={18} className="text-orange-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">End Sequence</h3>
                </div>
                <input 
                  required
                  type="datetime-local" 
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-orange-500/20 outline-none uppercase"
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                />
              </div>
           </div>

           <div className="h-[1px] bg-slate-100 w-full" />

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Calendar size={18} className="text-blue-500" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Registration Open</h3>
                </div>
                <input 
                  type="datetime-local" 
                  className="w-full px-6 py-4 bg-blue-50/50 border-none rounded-2xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 outline-none uppercase text-blue-900"
                  onChange={(e) => setFormData({...formData, registration_start_time: e.target.value})}
                />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Clock size={18} className="text-blue-500" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Registration Close</h3>
                </div>
                <input 
                  type="datetime-local" 
                  className="w-full px-6 py-4 bg-blue-50/50 border-none rounded-2xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 outline-none uppercase text-blue-900"
                  onChange={(e) => setFormData({...formData, registration_end_time: e.target.value})}
                />
              </div>
           </div>
        </div>

        {/* --- Section 3: Advanced Rules --- */}
        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Settings2 size={18} className="text-slate-900" />
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Arena Rules</h3>
            </div>
            <Lock size={16} className="text-slate-300" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Penalty (Minutes)</p>
              <input 
                type="number" 
                defaultValue={20}
                className="bg-transparent text-xl font-black text-slate-900 outline-none w-full"
                onChange={(e) => setFormData({...formData, rules: {...formData.rules, penalty_per_wrong_submission: parseInt(e.target.value)}})}
              />
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Contest Mode</p>
                <p className="text-sm font-black text-slate-900 uppercase italic">ICPC Standard</p>
              </div>
              <BookOpen size={20} className="text-slate-300" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 flex items-start gap-3">
            <AlertCircle size={18} className="text-orange-500 mt-0.5" />
            <p className="text-[10px] font-bold text-orange-700 leading-relaxed uppercase tracking-tight">
              Once the contest starts, problem editing and solution viewing will be automatically locked for all participants.
            </p>
          </div>
        </div>

        {/* --- Submit Actions --- */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-8 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-3 px-10 py-4 bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-2xl shadow-slate-200 hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Launching..." : (
              <>
                <Save size={16} strokeWidth={3} />
                Deploy Contest
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}