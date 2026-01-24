"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Header from "@/components/header"
import { 
  Trophy, Target, User as UserIcon, Calendar, 
  Zap, ChevronRight, Github, Globe, 
  Code2, Award, Activity, Loader2, ArrowLeft,
  MapPin, Edit, Save, X
} from "lucide-react"
import Link from "next/link"
import UserAvatar from "@/components/user-avatar"

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const usernameParam = params.username as string
  const [profile, setProfile] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    bio: "",
    location: "",
    website: "",
    display_name: ""
  })
  const supabase = createClient()

  useEffect(() => {
    async function fetchPublicProfile() {
      try {
        // 0. Get Current User (for edit permission)
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user)

        // 1. Fetch Profile Data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", usernameParam)
          .single()

        if (profileError) throw profileError
        setProfile(profileData)
        setEditForm({
          bio: profileData.bio || "",
          location: profileData.location || "",
          website: profileData.website || "",
          display_name: profileData.display_name || ""
        })

        // 2. Fetch Recent Submissions
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

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(editForm)
        .eq("id", currentUser?.id)

      if (error) throw error
      
      setProfile({ ...profile, ...editForm })
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update profile", error)
    }
  }

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
      <h1 className="text-2xl font-black text-slate-900 uppercase">User Not Found</h1>
      <p className="text-slate-400 text-sm mt-2 mb-8 uppercase font-bold tracking-tighter">The terminal you are looking for does not exist.</p>
      <button onClick={() => router.back()} className="flex items-center gap-2 text-orange-500 font-black uppercase text-xs tracking-widest underline underline-offset-8">
        <ArrowLeft size={16}/> Return to Base
      </button>
    </div>
  )



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
              <UserAvatar 
                avatarUrl={profile.avatar_url}
                name={profile.display_name || profile.username}
                size="xl"
                className="relative w-44 h-44 rounded-[2.2rem] border-4 border-slate-800"
              />
              <div className="absolute -bottom-3 -right-3 bg-white p-3 rounded-2xl shadow-2xl">
                <Trophy className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">
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
                {profile.location && (
                  <p className="font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                    <MapPin size={14} className="text-slate-600" /> 
                    {profile.location}
                  </p>
                )}
                <p className="font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                  <Calendar size={14} className="text-slate-600" /> 
                  Joined {new Date(profile.created_at).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}
                </p>
                
                {currentUser?.id === profile.id && (
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="ml-4 px-4 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-orange-500 transition-colors"
                  >
                    {isEditing ? <X size={14} /> : <Edit size={14} />}
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="mt-10 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl animate-in fade-in slide-in-from-top-4">
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2">
                 <Edit size={16} className="text-orange-500" /> Update Identity
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Display Name</label>
                    <input 
                      value={editForm.display_name} 
                      onChange={(e) => setEditForm({...editForm, display_name: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none" 
                      placeholder="Your Name"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Location</label>
                    <input 
                      value={editForm.location} 
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none" 
                      placeholder="City, Country"
                    />
                 </div>
                 <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Bio / Status</label>
                    <textarea 
                      value={editForm.bio} 
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none resize-none" 
                      rows={3}
                      placeholder="Tell us about your stack..."
                    />
                 </div>
                 <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Website / Portfolio</label>
                    <input 
                      value={editForm.website} 
                      onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none" 
                      placeholder="https://"
                    />
                 </div>
               </div>
               <div className="mt-6 flex justify-end">
                 <button 
                  onClick={handleSaveProfile}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-500 transition-colors shadow-lg"
                 >
                   <Save size={14} /> Save Changes
                 </button>
               </div>
            </div>
          )}
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
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">{profile.rank_points || 0}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Global</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">#42</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                 {profile.bio && (
                   <p className="text-sm font-medium text-slate-600 border-l-4 border-orange-500 pl-4 py-1">
                     "{profile.bio}"
                   </p>
                 )}
                 
                 <div className="flex items-center gap-3 text-xs font-bold text-slate-500 hover:text-orange-500 transition-colors">
                    <Github size={16} /> <span>/dev/null</span>
                 </div>
                 
                 {profile.website && (
                   <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-xs font-bold text-slate-500 hover:text-orange-500 transition-colors">
                      <Globe size={16} /> <span>{new URL(profile.website).hostname}</span>
                   </a>
                 )}
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
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${sub.status === 'AC' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {sub.status}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase text-slate-900 tracking-tight">Challenge #{sub.id.slice(0, 4)}</p>
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