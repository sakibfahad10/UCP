"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  Users, ShieldCheck, Search, 
  RefreshCcw, Mail, Calendar, 
  Loader2, UserCheck, UserMinus,
  AlertCircle, Trash2, X, Ban, CheckCircle
} from "lucide-react"
import { toast } from "sonner"

export default function UserControlPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [errorStatus, setErrorStatus] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    setErrorStatus(null)
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")

      if (error) {
        setErrorStatus(error.message)
        throw error
      }
      setUsers(data || [])
    } catch (err: any) {
      toast.error("Access Denied: Check RLS Policies")
    } finally {
      setLoading(false)
    }
  }

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    const toastId = toast.loading("Updating access...")
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId)
      if (error) throw error
      toast.success(`Access: ${newRole.toUpperCase()}`, { id: toastId })
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err: any) {
      toast.error("Failed to update role", { id: toastId })
    }
  }

  const toggleSuspend = async (userId: string, currentStatus: boolean) => {
    const toastId = toast.loading(currentStatus ? "Restoring user..." : "Suspending user...")
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_suspended: !currentStatus })
        .eq("id", userId)
      if (error) throw error
      toast.success(currentStatus ? "User Restored" : "User Suspended", { id: toastId })
      setUsers(users.map(u => u.id === userId ? { ...u, is_suspended: !currentStatus } : u))
    } catch (err: any) {
      toast.error("Action failed: Column missing?", { id: toastId })
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm("Permanently delete this user profile?")) return
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", userId)
      if (error) throw error
      toast.success("Profile removed")
      setUsers(users.filter(u => u.id !== userId))
    } catch (err: any) {
      toast.error("Delete failed")
    }
  }

  const filteredUsers = users.filter(u => {
    const searchLower = searchQuery.toLowerCase()
    return (
      (u.full_name?.toLowerCase() || "").includes(searchLower) ||
      (u.email?.toLowerCase() || "").includes(searchLower) ||
      (u.role?.toLowerCase() || "").includes(searchLower)
    )
  })

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">User Registry</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Manage platform access and permissions</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> Refresh Feed
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="Search by Name, Email, or Role..." 
            className="w-full pl-16 pr-12 py-5 bg-white border border-slate-100 rounded-[2rem] text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/5 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900">
              <X size={18} />
            </button>
          )}
        </div>
        <div className="bg-slate-900 rounded-[2rem] p-5 flex items-center justify-between text-white shadow-xl shadow-slate-200">
           <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Total Users</span>
              <span className="text-2xl font-black">{filteredUsers.length}</span>
           </div>
           <Users size={28} className="text-orange-500" />
        </div>
      </div>

      {/* List */}
      {loading && users.length === 0 ? (
        <div className="py-32 text-center">
          <Loader2 className="animate-spin mx-auto text-orange-500 mb-4" size={40} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Registry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className={`bg-white border p-8 rounded-[3rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden ${user.is_suspended ? 'border-red-100 opacity-80' : 'border-slate-100'}`}>
              
              {user.is_suspended && (
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
              )}

              <div className="flex justify-between items-start mb-8">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all ${user.role === 'admin' ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white'}`}>
                  {user.role === 'admin' ? <ShieldCheck size={28} /> : <Users size={28} />}
                </div>
                
                <div className="flex gap-2">
                  {/* Suspend Toggle */}
                  <button 
                    onClick={() => toggleSuspend(user.id, !!user.is_suspended)}
                    className={`p-2.5 rounded-xl border transition-all ${user.is_suspended ? 'bg-red-500 text-white border-red-600' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 border-slate-100'}`}
                    title={user.is_suspended ? "Restore User" : "Suspend User"}
                  >
                    {user.is_suspended ? <CheckCircle size={14} /> : <Ban size={14} />}
                  </button>

                  <button 
                    onClick={() => toggleRole(user.id, user.role)}
                    className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                      user.role === 'admin' 
                      ? 'bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white' 
                      : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    {user.role === 'admin' ? 'Revoke' : 'Promote'}
                  </button>

                  <button onClick={() => deleteUser(user.id)} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-1 mb-8">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate">
                    {user.full_name || 'Anonymous Entity'}
                  </h3>
                  {user.is_suspended && <span className="text-[7px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full uppercase">Suspended</span>}
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail size={14} className="shrink-0" />
                  <span className="text-xs font-bold truncate">{user.email || 'No email attached'}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar size={12} />
                  <span className="text-[9px] font-black uppercase tracking-tighter">
                    {user.created_at ? `Since ${new Date(user.created_at).toLocaleDateString()}` : 'Date Not Tracked'}
                  </span>
                </div>
                <div className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${user.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                   {user.role || 'user'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}