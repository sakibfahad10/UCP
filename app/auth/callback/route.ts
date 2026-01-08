import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Check profile and redirect based on role
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user?.id)
        .single()

      if (profile?.is_admin) {
        return NextResponse.redirect(`${origin}/admin/contests`) // For Admins
      }
      
      return NextResponse.redirect(`${origin}/contests`) // For Standard Users
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=Session error`)
}