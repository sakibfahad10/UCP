"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { User, Mail, Lock, Eye, EyeOff, Loader2, IdCard } from "lucide-react"

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: "",
    universityId: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const supabase = createClient()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)

    try {
      if (isLogin) {
        // --- Login Logic ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) throw error

        if (data.user) {
          toast.success("Welcome back, Architect!")
          // Hard refresh is most effective for syncing session and cookies
          window.location.assign("/") 
        }
      } else {
        // --- Registration Logic ---
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match!")
          setIsLoading(false)
          return
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              display_name: formData.fullName,
              university_id: formData.universityId,
            }
          }
        })

        if (error) throw error

        // If email confirmation is off, session will be available directly
        if (data.session) {
          toast.success("Account created successfully!")
          window.location.assign("/")
        } else {
          // If email confirmation is on
          toast.info("Registration successful! Please check your email or login.")
          setIsLogin(true)
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication Failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 border border-gray-100">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 animate-in zoom-in duration-500">
              <div className="w-8 h-8 border-2 border-white rounded-md flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-1 tracking-tight uppercase">UCP Portal</h1>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Code • Compete • Conquer</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl mb-8 border border-slate-200/50">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${
              isLogin ? "bg-white text-orange-600 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${
              !isLogin ? "bg-white text-orange-600 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1 group">
              <label className="text-[9px] font-black uppercase text-slate-500 ml-1 tracking-widest">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="ARCHITECT NAME"
                  required
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold placeholder:text-slate-300"
                />
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1 group">
              <label className="text-[9px] font-black uppercase text-slate-500 ml-1 tracking-widest">Student / Teacher ID</label>
              <div className="relative">
                <IdCard className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="text"
                  name="universityId"
                  value={formData.universityId}
                  onChange={handleChange}
                  placeholder="011233000"
                  required
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold placeholder:text-slate-300"
                />
              </div>
            </div>
          )}

          <div className="space-y-1 group">
            <label className="text-[9px] font-black uppercase text-slate-500 ml-1 tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="NAME@EXAMPLE.COM"
                required
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="space-y-1 group">
            <label className="text-[9px] font-black uppercase text-slate-500 ml-1 tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold placeholder:text-slate-300"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1 group animate-in slide-in-from-top-2 duration-300">
              <label className="text-[9px] font-black uppercase text-slate-500 ml-1 tracking-widest">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold placeholder:text-slate-300"
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-orange-600 disabled:bg-slate-400 text-white font-black uppercase tracking-[0.2em] text-xs py-4 rounded-xl shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 mt-6 active:scale-[0.98]"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? "Sign In to Arena" : "Create Account")}
          </button>
        </form>
      </div>
      
      <p className="text-center mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        Secure Access • UIU CP Community
      </p>
    </div>
  )
}