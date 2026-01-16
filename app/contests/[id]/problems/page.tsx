"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Header from "@/components/header"
import ArenaNav from "@/components/arena-nav"
import { Loader2, Code2, ChevronRight, Lock } from "lucide-react"
import Link from "next/link"

import ContestProblemSolver from "@/components/contest-problem-solver"
import { checkRegistrationStatus } from "@/app/actions/contest-registration"

export default function ContestProblemsPage() {
  const { id } = useParams() as { id: string }
  const [problems, setProblems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [contestStatus, setContestStatus] = useState<"Upcoming" | "Live" | "Finished" | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [selectedProblem, setSelectedProblem] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchContestAndProblems() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        // 1. Check Registration Status
        if (user) {
          const regRes = await checkRegistrationStatus(id)
          setIsRegistered(regRes.isRegistered)
          
          if (!regRes.isRegistered) {
            setLoading(false)
            return
          }
        }

        const { data: contest, error: contestError } = await supabase
          .from("contests")
          .select("start_time, end_time, problems")
          .eq("id", id)
          .single()

        if (contestError) throw contestError

        const now = new Date().getTime()
        const start = new Date(contest.start_time).getTime()
        const end = new Date(contest.end_time).getTime()

        let status: "Upcoming" | "Live" | "Finished" = "Upcoming"
        if (now < start) status = "Upcoming"
        else if (now < end) status = "Live"
        else status = "Finished"
        
        setContestStatus(status)

        // If contest is upcoming, we might want to hide problems, 
        // but for now let's just show them if they exist in the array
        if (contest.problems && contest.problems.length > 0) {
          const { data: problemsData, error: problemsError } = await supabase
            .from("problems")
            .select("*")
            .in("id", contest.problems)

          if (!problemsError) {
             // Reorder problems based on the order in contest.problems array
             const orderedProblems = contest.problems.map((pid: string) => 
               problemsData.find(p => p.id === pid)
             ).filter(Boolean)
             setProblems(orderedProblems)
          }
        }
      } catch (err) {
        console.error("Error fetching arena problems:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchContestAndProblems()
  }, [id, supabase])

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Syncing Problem Set...</p>
    </div>
  )

  if (!isRegistered) return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ArenaNav id={id} />
      <main className="max-w-7xl mx-auto px-6 py-32 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full border border-slate-100 mb-8 shadow-sm">
          <Lock className="text-orange-500" size={32} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">Registration Required</h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
          You must register for this contest to view the problem set and submit solutions.
        </p>
        <Link 
          href={`/contests/${id}`}
          className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-slate-200"
        >
          Go to Dashboard to Register
        </Link>
      </main>
    </div>
  )

  if (contestStatus === "Upcoming") return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ArenaNav id={id} />
      <main className="max-w-7xl mx-auto px-6 py-32 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full border border-slate-100 mb-8 shadow-sm">
          <Lock className="text-orange-500" size={32} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">Arena is Locked</h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto">
          The problem set for this contest will be revealed once the battle begins. Prepare your station.
        </p>
      </main>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ArenaNav id={id} />
      
      <main className={`${selectedProblem ? 'max-w-full' : 'max-w-4xl'} mx-auto px-6 py-12 transition-all duration-500`}>
        {selectedProblem ? (
          <ContestProblemSolver 
            problem={selectedProblem} 
            contestId={id} 
            onBack={() => setSelectedProblem(null)} 
          />
        ) : (
          <>
            <div className="mb-12">
              <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">Problem Set</h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Deploy your solutions to the core systems</p>
            </div>

            <div className="grid gap-4">
              {problems.map((problem, index) => (
                <button 
                  onClick={() => setSelectedProblem(problem)}
                  key={problem.id}
                  className="bg-white border border-slate-100 p-8 rounded-[2.5rem] hover:shadow-2xl transition-all group flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 font-black italic group-hover:bg-orange-500 group-hover:text-white transition-all">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase italic group-hover:text-orange-600 transition-colors">
                        {problem.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Difficulty: {problem.difficulty}
                        </span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Points: {problem.points || 100}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                     <div className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-orange-500 transition-all flex items-center gap-2">
                       Solve <ChevronRight size={14} />
                     </div>
                  </div>
                </button>
              ))}

              {problems.length === 0 && (
                <div className="bg-white border border-dashed border-slate-200 p-20 rounded-[3rem] text-center">
                  <p className="text-slate-400 font-black uppercase text-[11px] tracking-widest">No problems assigned to this arena</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
