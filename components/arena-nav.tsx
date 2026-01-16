"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, Trophy, History } from "lucide-react"

export default function ArenaNav({ id }: { id: string }) {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: `/contests/${id}`,
      icon: LayoutDashboard,
      active: pathname === `/contests/${id}`
    },
    {
      name: "Problems",
      href: `/contests/${id}/problems`,
      icon: FileText,
      active: pathname === `/contests/${id}/problems`
    },
    {
      name: "Standings",
      href: `/contests/${id}/standings`,
      icon: Trophy,
      active: pathname === `/contests/${id}/standings`
    },
    {
      name: "Submissions",
      href: `/contests/${id}/submissions`,
      icon: History,
      active: pathname === `/contests/${id}/submissions`
    },
  ]

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 py-6 border-b-2 transition-all whitespace-nowrap ${
                item.active
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-slate-400 hover:text-slate-900"
              }`}
            >
              <item.icon size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
