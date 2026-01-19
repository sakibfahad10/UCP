"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, Clock, Users, Trophy, ChevronLeft, ChevronRight, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function ContestsContent() {
  const [activeFilter, setActiveFilter] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [contests, setContests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // 1. Fetch contests from database
  useEffect(() => {
    async function fetchContests() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("contests")
          .select("*")
          .order("start_time", { ascending: false })

        if (!error) setContests(data || [])
      } catch (err) {
        console.error("Error fetching contests:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchContests()
  }, [supabase])

  // 2. Filtering Logic (Search & Tabs)
  const filteredContests = contests.filter(contest => {
    const matchesSearch = contest.title.toLowerCase().includes(searchTerm.toLowerCase())
    const now = new Date()
    const startTime = new Date(contest.start_time)
    const endTime = new Date(contest.end_time)

    if (activeFilter === "Active") return matchesSearch && now >= startTime && now <= endTime
    if (activeFilter === "Upcoming") return matchesSearch && now < startTime
    if (activeFilter === "Past") return matchesSearch && now > endTime
    return matchesSearch
  })

  if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Loading Contests...</p>
    </div>
  )

  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-8 h-8 text-orange-500" />
                <h1 className="text-4xl font-black text-gray-900 uppercase  tracking-tighter">Contests</h1>
              </div>
              <p className="text-gray-600 text-sm font-medium">Join the battle and prove your coding skills.</p>
            </div>

            {/* Search & Tabs */}
            <div className="mb-6 relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none shadow-sm transition-all"
              />
            </div>

            <div className="flex gap-8 mb-8 border-b border-gray-200">
              {["All", "Active", "Upcoming", "Past"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`pb-4 text-[11px] font-black uppercase tracking-widest relative transition-all ${
                    activeFilter === tab ? "text-orange-500" : "text-gray-400 hover:text-gray-900"
                  }`}
                >
                  {tab}
                  {activeFilter === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Contest List */}
            <div className="space-y-4">
              {filteredContests.length > 0 ? filteredContests.map((contest) => (
                <Link href={`/contests/${contest.id}`} key={contest.id}>
                  <div className="bg-white rounded-[2rem] border border-gray-100 p-8 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-orange-500"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                            {contest.difficulty || "Standard"}
                          </span>
                          <span className="text-gray-400 text-[10px] font-bold flex items-center gap-1">
                            <Calendar size={12}/> {new Date(contest.start_time).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-orange-500 transition-colors uppercase italic">{contest.title}</h3>
                        <p className="text-gray-500 text-sm line-clamp-1">{contest.description}</p>
                      </div>

                      <div className="flex flex-col items-end gap-4 min-w-[150px]">
                        <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 transition-colors">
                          Enter Arena
                        </button>
                        <span className="text-[9px] font-black text-slate-300 uppercase italic">
                          ID: {contest.id.slice(0,8)}...
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-[2rem]">
                  <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.3em]">No contests found in this sector</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl">
              <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2">
                <Trophy className="text-orange-500" size={20}/> Your Status
              </h3>
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Rating</p>
                  <p className="text-2xl font-black italic text-orange-500">1452 <span className="text-xs text-green-400">↑+24</span></p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Solved Problems</p>
                  <p className="text-2xl font-black italic">128</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}