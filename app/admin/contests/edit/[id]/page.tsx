"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { 
  ArrowLeft, Save, Globe,
  Calendar, Clock, BookOpen, Settings2,
  Database, Loader2
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import ProblemPicker from "@/components/admin/problem-picker"

export default function EditContestPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
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
    problems: [] as string[],
    rules: {
      penalty_per_wrong_submission: 20,
      show_leaderboard_immediately: true,
      contest_mode: "icpc"
    }
  })

  const fetchContest = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("contests")
        .select("title, description, start_time, end_time, registration_start_time, registration_end_time, max_participants, allow_teams, problems, rules")
        .eq("id", id)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setFormData({
          title: data.title || "",
          description: data.description || "",
          start_time: data.start_time ? new Date(data.start_time).toISOString().slice(0, 16) : "",
          end_time: data.end_time ? new Date(data.end_time).toISOString().slice(0, 16) : "",
          registration_start_time: data.registration_start_time ? new Date(data.registration_start_time).toISOString().slice(0, 16) : "",
          registration_end_time: data.registration_end_time ? new Date(data.registration_end_time).toISOString().slice(0, 16) : "",
          max_participants: data.max_participants || 0,
          allow_teams: data.allow_teams || false,
          // Ensure jsonb from database is treated as an array
          problems: Array.isArray(data.problems) ? data.problems : [],
          rules: {
            penalty_per_wrong_submission: data.rules?.penalty_per_wrong_submission ?? 20,
            show_leaderboard_immediately: data.rules?.show_leaderboard_immediately ?? true,
            contest_mode: data.rules?.contest_mode || "icpc"
          }
        })
      }
    } catch (err: any) {
      toast.error("Sync error: " + err.message)
    } finally {
      setLoading(false)
    }
  }, [id, supabase])

  useEffect(() => {
    fetchContest()
  }, [fetchContest])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Columns arranged according to your screenshot
      const updatePayload = {
        title: formData.title,
        description: formData.description,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        registration_start_time: formData.registration_start_time ? new Date(formData.registration_start_time).toISOString() : null,
        registration_end_time: formData.registration_end_time ? new Date(formData.registration_end_time).toISOString() : null,
        max_participants: formData.max_participants,
        allow_teams: formData.allow_teams,
        // Sending data for jsonb column
        problems: formData.problems, 
        rules: formData.rules
      }

      const { error } = await supabase
        .from("contests")
        .update(updatePayload)
        .eq("id", id)

      if (error) {
        // If error still persists, check console for detailed JSON error
        console.error("Supabase Detailed Error:", JSON.stringify(error, null, 2))
        throw error
      }
      
      toast.success("Arena configuration updated!")
      router.push("/admin/contests")
      router.refresh()
    } catch (err: any) {
      toast.error("Deployment failed: " + (err.message || "Unknown Error"))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-orange-500" size={40} />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto pb-20 pt-10 px-6">
      <div className="flex items-center justify-between mb-12">
        <Link 
          href="/admin/contests" 
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-bold text-[10px] uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Discard Changes
        </Link>
      </div>

      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Modify Arena</h1>
        <p className="text-slate-400 font-bold uppercase text-[9px] mt-2 tracking-widest">Database ID: {id}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Identity */}
        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <Globe size={16} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">General Identity</h3>
          </div>
          <div className="space-y-4">
            <input 
              required
              placeholder="Contest Title"
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            <textarea 
              rows={3}
              placeholder="Contest Description"
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        {/* Problem Set */}
        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
              <Database size={16} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Problem Set</h3>
          </div>
          <ProblemPicker 
            selectedIds={formData.problems}
            onSelectionChange={(ids) => setFormData({...formData, problems: ids})}
          />
        </div>

        {/* Schedule */}
        {/* Schedule */}
        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><Calendar size={14} className="text-orange-500"/> Start Time</h3>
                <input 
                  type="datetime-local" 
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase outline-none"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><Clock size={14} className="text-orange-500"/> End Time</h3>
                <input 
                  type="datetime-local" 
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase outline-none"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                />
              </div>
           </div>

           <div className="h-[1px] bg-slate-100 w-full" />

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2 text-blue-500"><Calendar size={14} /> Reg. Open</h3>
                <input 
                  type="datetime-local" 
                  className="w-full px-6 py-4 bg-blue-50/50 border-none rounded-2xl text-xs font-black uppercase outline-none text-blue-900"
                  value={formData.registration_start_time}
                  onChange={(e) => setFormData({...formData, registration_start_time: e.target.value})}
                />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2 text-blue-500"><Clock size={14} /> Reg. Close</h3>
                <input 
                  type="datetime-local" 
                  className="w-full px-6 py-4 bg-blue-50/50 border-none rounded-2xl text-xs font-black uppercase outline-none text-blue-900"
                  value={formData.registration_end_time}
                  onChange={(e) => setFormData({...formData, registration_end_time: e.target.value})}
                />
              </div>
           </div>
        </div>

        {/* Rules */}
        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Settings2 size={18} className="text-slate-900" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Arena Rules</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50 rounded-2xl">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-3">Penalty (Minutes)</p>
              <input 
                type="number" 
                className="bg-transparent text-xl font-black text-slate-900 outline-none w-full"
                value={formData.rules.penalty_per_wrong_submission}
                onChange={(e) => setFormData({
                  ...formData, 
                  rules: {...formData.rules, penalty_per_wrong_submission: parseInt(e.target.value)}
                })}
              />
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-3">Max Participants</p>
              <input 
                type="number" 
                className="bg-transparent text-xl font-black text-slate-900 outline-none w-full"
                value={formData.max_participants}
                onChange={(e) => setFormData({
                  ...formData, 
                  max_participants: parseInt(e.target.value)
                })}
              />
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl flex items-center justify-between cursor-pointer" onClick={() => setFormData({...formData, allow_teams: !formData.allow_teams})}>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Team Mode</p>
                <p className={`text-sm font-black uppercase italic ${formData.allow_teams ? "text-green-600" : "text-slate-900"}`}>{formData.allow_teams ? "Enabled" : "Individual Only"}</p>
              </div>
              <BookOpen size={20} className={formData.allow_teams ? "text-green-500" : "text-slate-300"} />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-3 px-12 py-5 bg-slate-900 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl shadow-2xl hover:bg-orange-600 transition-all disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Commit Changes
          </button>
        </div>
      </form>
    </div>
  )
}