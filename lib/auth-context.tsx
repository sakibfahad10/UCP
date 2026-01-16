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
        // Fetching profile data
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (error) {
          console.error("Profile fetch error:", error.message)
          // Set session user even if profile not found to keep logged in
          setUser(session.user)
        } else {
          // Merging session user and profile data (including is_admin)
          const fullUser = { ...session.user, ...profile }
          console.log("Logged in user data with role:", fullUser) // Debugging: Check console
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
      refreshUser: fetchUser,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)