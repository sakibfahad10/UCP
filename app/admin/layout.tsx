"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  Database, 
  Settings, 
  History, 
  ShieldAlert,
  LogOut,
  ChevronRight
} from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/admin" },
    { name: "Contests", icon: Trophy, path: "/admin/contests" },
    { name: "Problem Bank", icon: Database, path: "/admin/problems" },
    { name: "User Control", icon: Users, path: "/admin/users" },
    { name: "Submissions", icon: History, path: "/admin/submissions" },
    { name: "Security Reports", icon: ShieldAlert, path: "/admin/security" },
  ]

  return (
    <div className="flex min-h-screen bg-[#FDFDFD]">
      {/* --- Sidebar --- */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
              <span className="text-white font-black text-xs italic">UCP</span>
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-slate-900">Mainframe</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">v4.0 Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Navigation</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group ${
                  isActive 
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isActive ? "text-white" : "text-slate-600"}`}>
                    {item.name}
                  </span>
                </div>
                {isActive && <ChevronRight size={14} className="text-orange-500" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-6 border-t border-slate-50 space-y-2">
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 transition-all">
            <Settings size={18} />
            <span className="text-[11px] font-bold uppercase tracking-widest">Global Settings</span>
          </Link>
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <LogOut size={18} />
            <span className="text-[11px] font-bold uppercase tracking-widest">Exit Console</span>
          </Link>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 min-w-0 overflow-hidden">
        {/* Top Floating Bar */}
        <div className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-40">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Health: Optimal</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-900 leading-none uppercase tracking-tighter">Administrator</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">ID: 001</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200"></div>
           </div>
        </div>

        {/* Content Wrapper */}
        <div className="p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}