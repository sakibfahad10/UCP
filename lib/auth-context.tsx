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
          .maybeSingle()

        if (error) {
          console.error("DEBUG: AuthContext: Profile fetch error:", error.message)
          setUser(session.user)
        } else if (!profile) {
          console.log("DEBUG: AuthContext: No profile found for data:", session.user.id)
          setUser(session.user)
        } else {
          // Merging session user, user_metadata, and profile data
          // Profile data (source of truth) overrides metadata and session fields
          const fullUser = { 
            ...session.user, 
            ...(session.user.user_metadata || {}), 
            ...profile 
          }
          console.log("DEBUG: AuthContext: Profile merged for user", fullUser.id)
          console.log("DEBUG: AuthContext: Merged data summary:", {
            id: fullUser.id,
            email: fullUser.email,
            display_name: fullUser.display_name,
            username: fullUser.username,
            avatar_url: fullUser.avatar_url
          })
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