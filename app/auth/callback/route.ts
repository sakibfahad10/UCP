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
      
      // প্রোফাইল চেক করে রোল অনুযায়ী রিডাইরেক্ট করা
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user?.id)
        .single()

      if (profile?.is_admin) {
        return NextResponse.redirect(`${origin}/admin/contests`) // এডমিনদের জন্য
      }
      
      return NextResponse.redirect(`${origin}/contests`) // সাধারণ ইউজারদের জন্য
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=Session error`)
}