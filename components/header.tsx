"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, LogOut, ShieldCheck, X, LayoutGrid } from "lucide-react"
import { useAuth } from "@/lib/auth-context" // Ensuring correct path to avoid errors
import { useState, useEffect, useRef } from "react" 

export default function Header() {
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const pathname = usePathname()
  
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Problems", path: "/problems" },
    { name: "Contests", path: "/contests" },
    { name: "Leaderboard", path: "/leaderboard" },
  ]

  const displayName = user?.display_name || user?.full_name || user?.email?.split('@')[0] || "Architect"
  const avatar = user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'default'}`

  const notifications = [
    { id: 1, text: "Your submission for 'Two Sum' was accepted!", time: "2m ago" },
    { id: 2, text: "Weekly Contest #105 is now live!", time: "1h ago" },
  ]

  return (
    <header className="sticky top-0 z-[100] w-full bg-[#020617]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-14 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-all duration-300">
              <span className="text-white text-base font-black tracking-tighter">UCP</span>
            </div>
            <div className="hidden lg:block">
              <p className="text-white text-sm font-bold leading-none tracking-tight">UIU Comepetitive Programming</p>
              
            </div>
          </Link>

          {/* Navigation */}
          {!isLoading && isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.path || pathname.startsWith(link.path + "/")
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive 
                        ? "text-orange-500 bg-orange-500/5" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              })}
              
              {/* Admin Button - Visible only to admins */}
              {user?.is_admin && (
                <Link 
                  href="/admin/contests" 
                  className={`ml-2 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${
                    pathname.startsWith('/admin') 
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                      : "text-red-400 border border-red-500/20 hover:bg-red-500/5"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  ADMIN PANEL
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="w-24 h-9 bg-white/5 animate-pulse rounded-xl"></div>
          ) : !isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link href="/auth" className="px-5 py-2 text-slate-400 hover:text-white text-sm font-bold transition-colors">
                Log in
              </Link>
              <Link 
                href="/auth" 
                className="px-6 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-black hover:bg-orange-500 hover:text-white transition-all shadow-xl shadow-white/5"
              >
                Join Now
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2.5 rounded-xl transition-all ${
                    showNotifications ? "bg-orange-500/10 text-orange-500" : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Bell className="w-5 h-5" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-[#0a0f1d] border border-white/10 rounded-2xl shadow-2xl py-4 animate-in fade-in zoom-in duration-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-white/5">
                      <h3 className="text-white text-sm font-bold">Notifications</h3>
                      <button onClick={() => setShowNotifications(false)}>
                         <X className="w-4 h-4 text-slate-500 hover:text-white" />
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-none transition-colors">
                          <p className="text-slate-300 text-xs leading-relaxed">{notif.text}</p>
                          <p className="text-slate-500 text-[10px] mt-1 font-bold">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                <Link href="/profile" className="flex items-center gap-3 hover:bg-white/5 p-1.5 rounded-2xl transition-all">
                  <div className="text-right hidden sm:block">
                    <p className="text-white text-[11px] font-black leading-none">{displayName}</p>
                    <p className="text-orange-500 text-[9px] font-black mt-1 tracking-widest uppercase">
                      {user?.is_admin ? "STAFF" : `RANK ${user?.rank_points || 0}`}
                    </p>
                  </div>
                  <img 
                    src={avatar} 
                    className="w-9 h-9 rounded-xl border border-white/10 bg-slate-800 object-cover" 
                    alt="profile" 
                  />
                </Link>

                <button 
                  onClick={logout}
                  className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  ) 
}