"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function registerForContest(contestId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Check if contest exists and registration is open
    const { data: contest, error: contestError } = await supabase
      .from("contests")
      .select("registration_start_time, registration_end_time, max_participants")
      .eq("id", contestId)
      .single()

    if (contestError) throw contestError

    const now = new Date()
    const regStart = contest.registration_start_time ? new Date(contest.registration_start_time) : null
    const regEnd = contest.registration_end_time ? new Date(contest.registration_end_time) : null

    if (regStart && now < regStart) {
      throw new Error("Registration has not started yet.")
    }
    if (regEnd && now > regEnd) {
      throw new Error("Registration has already ended.")
    }

    // Check participant limit if applicable
    if (contest.max_participants > 0) {
      const { count, error: countError } = await supabase
        .from("registrations")
        .select("*", { count: 'exact', head: true })
        .eq("contest_id", contestId)
      
      if (countError) throw countError
      if (count !== null && count >= contest.max_participants) {
        throw new Error("Contest has reached maximum participant capacity.")
      }
    }

    const { error: regError } = await supabase
      .from("registrations")
      .insert({
        contest_id: contestId,
        user_id: user.id,
        type: 'INDIVIDUAL',
        status: 'APPROVED'
      })

    if (regError) {
      if (regError.code === '23505') {
        throw new Error("You are already registered for this contest.")
      }
      throw regError
    }

    revalidatePath(`/contests/${contestId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function checkRegistrationStatus(contestId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { isRegistered: false }

    const { data, error } = await supabase
      .from("registrations")
      .select("id")
      .eq("contest_id", contestId)
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is code for "no rows returned"
      throw error
    }

    return { isRegistered: !!data }
  } catch (error) {
    console.error("Error checking registration status:", error)
    return { isRegistered: false }
  }
}
