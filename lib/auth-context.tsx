"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

const AuthContext = createContext<any>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // প্রোফাইল ডাটা ফেচ করা হচ্ছে
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (error) {
          console.error("Profile fetch error:", error.message)
          // প্রোফাইল না পেলেও সেশন ইউজার সেট করা হচ্ছে যাতে লগইন থাকে
          setUser(session.user)
        } else {
          // সেশন ইউজার এবং প্রোফাইল ডাটা মার্জ করা হচ্ছে (is_admin সহ)
          const fullUser = { ...session.user, ...profile }
          console.log("Logged in user data with role:", fullUser) // Debugging: কনসোলে চেক করুন
          setUser(fullUser)
        }
      } else {
        setUser(null)
      }
    } catch (e) {
      console.error("Auth fetch error:", e)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event)
      if (session) {
        fetchUser()
      } else {
        setUser(null)
        setIsLoading(false)
      }
    });

    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = "/" 
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)