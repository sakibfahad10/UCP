"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Header from "@/components/header"
import { 
  Trophy, Target, User as UserIcon, Calendar, 
  Zap, ChevronRight, Github, Globe, 
  Code2, Award, Activity, Loader2, ArrowLeft
} from "lucide-react"
import Link from "next/link"

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const usernameParam = params.username as string
  const [profile, setProfile] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchPublicProfile() {
      try {
        // ১. প্রোফাইল ডাটা ফেচ করা
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", usernameParam)
          .single()

        if (profileError) throw profileError
        setProfile(profileData)

        // ২. রিসেন্ট সাবমিশন ফেচ করা
        const { data: subData } = await supabase
          .from("submissions")
          .select("*, contests(title)")
          .eq("user_id", profileData.id)
          .order("created_at", { ascending: false })
          .limit(5)

        setSubmissions(subData || [])
      } catch (err) {
        console.error("Profile not found:", err)
      } finally {
        setLoading(false)
      }
    }

    if (usernameParam) fetchPublicProfile()
  }, [usernameParam, supabase])

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Profile...</p>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        <UserIcon className="text-slate-300" size={40} />
      </div>
      <h1 className="text-2xl font-black text-slate-900 uppercase italic">User Not Found</h1>
      <p className="text-slate-400 text-sm mt-2 mb-8 uppercase font-bold tracking-tighter">The terminal you are looking for does not exist.</p>
      <button onClick={() => router.back()} className="flex items-center gap-2 text-orange-500 font-black uppercase text-xs tracking-widest underline underline-offset-8">
        <ArrowLeft size={16}/> Return to Base
      </button>
    </div>
  )

  const avatar = profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900">
      <Header />
      
      {/* Dynamic Hero Section */}
      <div className="relative bg-slate-900 pt-24 pb-40 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 blur-[120px] rounded-full -mr-48 -mt-48" />
        
        <div className="max-w-6xl mx-auto px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-orange-500 to-yellow-500 rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 transition duration-500" />
              <img 
                src={avatar} 
                alt={profile.username} 
                className="relative w-44 h-44 rounded-[2.2rem] border-4 border-slate-800 bg-slate-800 object-cover"
              />
              <div className="absolute -bottom-3 -right-3 bg-white p-3 rounded-2xl shadow-2xl">
                <Trophy className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                  {profile.display_name || profile.username}
                </h1>
                <div className="px-4 py-1.5 bg-orange-500 text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em]">
                  Elite Rank
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-slate-400">
                <p className="font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                  <span className="text-orange-500">@</span>{profile.username}
                </p>
                <p className="font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                  <Calendar size={14} className="text-slate-600" /> 
                  Joined {new Date(profile.created_at).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 -mt-20 pb-24 relative z-20">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Left Panel: Stats & Bio */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="text-orange-500" size={20} />
                <h3 className="text-slate-900 font-black uppercase text-xs tracking-widest">Protocol Stats</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
                  <p className="text-2xl font-black text-slate-900 italic tracking-tighter">{profile.rank_points || 0}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Global</p>
                  <p className="text-2xl font-black text-slate-900 italic tracking-tighter">#42</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                 <div className="flex items-center gap-3 text-xs font-bold text-slate-500 hover:text-orange-500 transition-colors">
                    <Github size={16} /> <span>/dev/null</span>
                 </div>
                 <div className="flex items-center gap-3 text-xs font-bold text-slate-500 hover:text-orange-500 transition-colors">
                    <Globe size={16} /> <span>arena.network</span>
                 </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
              <h3 className="text-slate-900 font-black uppercase text-xs tracking-widest mb-6 flex items-center gap-3">
                <Code2 className="text-orange-500" size={20} /> Skill Nodes
              </h3>
              <div className="space-y-6">
                <SkillBar label="C++ Core" percent={90} />
                <SkillBar label="Algorithm Design" percent={75} />
                <SkillBar label="Data Structures" percent={85} />
              </div>
            </div>
          </div>

          {/* Right Panel: Recent Activity */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[500px]">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-slate-900 font-black uppercase text-xs tracking-[0.3em] flex items-center gap-3">
                  <Award className="text-orange-500" size={20} /> Verified Submissions
                </h3>
              </div>

              <div className="space-y-4">
                {submissions.length > 0 ? submissions.map((sub) => (
                  <div key={sub.id} className="group flex items-center justify-between p-6 bg-slate-50 hover:bg-white rounded-3xl border border-transparent hover:border-slate-200 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic text-xs ${sub.status === 'AC' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {sub.status}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase italic text-slate-900 tracking-tight">Challenge #{sub.id.slice(0, 4)}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub.contests?.title || "Global Arena"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-900 uppercase">+{sub.score} PTS</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{new Date(sub.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Zap className="text-slate-200" size={32} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No verified solves detected</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function SkillBar({ label, percent }: { label: string, percent: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-black text-orange-500">{percent}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
        <div 
          className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000" 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}