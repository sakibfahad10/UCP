"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Header from "@/components/header"
import { 
  Mail, Trophy, Target, Settings, LogOut, 
  User as UserIcon, Calendar, Zap, ChevronRight,
  ExternalLink, Github, Globe
} from "lucide-react"

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
  </div>
  if (!user) return null

  const fullName = user.display_name || "User"
  const username = user.username || "username"
  const rankPoints = user.rank_points || 0
  const avatar = user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      
      {/* Profile Hero Section */}
      <div className="bg-slate-700 pt-16 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className="relative">
              <img 
                src={avatar} 
                alt={fullName} 
                className="w-40 h-40 rounded-3xl border-4 border-slate-800 bg-slate-800 object-cover shadow-2xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-orange-500 p-2 rounded-xl shadow-lg">
                <Zap className="w-5 h-5 text-white fill-current" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-4xl font-black text-white">{fullName}</h1>
                <span className="bg-orange-500/10 text-orange-400 text-xs font-bold px-3 py-1 rounded-full border border-orange-500/20 uppercase tracking-widest">
                  Expert
                </span>
              </div>
              <p className="text-slate-400 flex items-center justify-center md:justify-start gap-2 mb-6">
                @{username} • UIU Student
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                  <Trophy className="w-4 h-4 text-orange-500" />
                  <span className="font-bold">{rankPoints} Points</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Joined Nov 2024</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all">
                <Settings className="w-5 h-5" />
              </button>
              <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-16 pb-20">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-slate-900 font-bold mb-6 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-orange-500" /> Bio
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Passionate competitive programmer from UIU. Specialized in Data Structures and Algorithms. Dreaming to be a Red Coder!
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-500 text-sm">
                  <Github className="w-4 h-4" /> <span>github.com/coder</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-sm">
                  <Globe className="w-4 h-4" /> <span>portfolio.dev</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-slate-900 font-bold mb-6">Languages</h3>
              <div className="space-y-4">
                <LanguageProgress label="C++" percent={85} color="bg-blue-500" />
                <LanguageProgress label="Python" percent={40} color="bg-yellow-500" />
                <LanguageProgress label="Java" percent={25} color="bg-red-500" />
              </div>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickStat label="Solved" value="142" sub="+12 this month" />
              <QuickStat label="Contests" value="28" sub="Ranked #42" />
              <QuickStat label="Streak" value="15" sub="Days long" />
              <QuickStat label="Rating" value="1450" sub="Max: 1520" />
            </div>

            {/* Main Tabs Container */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex border-b border-slate-100 p-2">
                {["overview", "submissions", "badges"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-bold capitalize rounded-2xl transition-all ${
                      activeTab === tab 
                      ? "bg-slate-900 text-white shadow-lg" 
                      : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-8">
                {activeTab === "overview" && (
                  <div className="space-y-8">
                    {/* Activity Heatmap Placeholder */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-4 flex items-center justify-between">
                        Activity Map
                        <span className="text-xs font-medium text-slate-400">Past 6 months</span>
                      </h4>
                      <div className="flex gap-1 overflow-hidden">
                        {[...Array(30)].map((_, i) => (
                          <div key={i} className="flex-1 space-y-1">
                            {[...Array(7)].map((_, j) => (
                              <div 
                                key={j} 
                                className={`aspect-square rounded-sm ${
                                  Math.random() > 0.7 ? "bg-orange-500" : "bg-slate-100"
                                }`}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Activities */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-4">Recent Solves</h4>
                      <div className="space-y-3">
                        <ActivityItem title="Two Sum" difficulty="Easy" time="2h ago" />
                        <ActivityItem title="Merge K Sorted Lists" difficulty="Hard" time="5h ago" />
                        <ActivityItem title="Binary Tree Zigzag" difficulty="Medium" time="Yesterday" />
                      </div>
                    </div>
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

// UI Components
function LanguageProgress({ label, percent, color }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-400">{percent}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  )
}

function QuickStat({ label, value, sub }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-[10px] text-green-500 font-bold mt-1 uppercase">{sub}</p>
    </div>
  )
}

function ActivityItem({ title, difficulty, time }: any) {
  const diffColor: any = {
    Easy: "text-green-500",
    Medium: "text-orange-500",
    Hard: "text-red-500"
  }
  return (
    <div className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-orange-50 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-orange-100">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500" />
        </div>
        <div>
          <p className="font-bold text-slate-900 text-sm">{title}</p>
          <p className={`text-[10px] font-black uppercase ${diffColor[difficulty]}`}>{difficulty}</p>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-400">{time}</span>
    </div>
  )
}