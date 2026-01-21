"use server"

import { createClient } from "@/lib/supabase/server"
import { Verdict } from "@/types"

export async function executeCode(
  code: string, 
  language: string, 
  problemId?: string, 
  contestId?: string,
  stdin?: string
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Only require authentication for submissions (need user ID to save to database)
    if (problemId && !user) {
      throw new Error("You must be logged in to submit solutions")
    }

    // 1. Anti-cheating / Rate Limiting (Requirement 8)
    // Only apply rate limiting for authenticated users
    if (user) {
      const { count: recentSubmissions } = await supabase
        .from("submissions")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id)
        .gt("created_at", new Date(Date.now() - 10000).toISOString()) // 10s cooldown for professional feel

      if (recentSubmissions && recentSubmissions > 0) {
        throw new Error("Cooling down. Please wait 10 seconds between deployments.")
      }
    }

    // 2. Fetch Problem Constraints (Requirement 3)
    let expectedOutput = ""
    let timeLimit = 1.0 // default 1s
    let sampleInput = ""
    if (problemId) {
      const { data: problem } = await supabase
        .from("problems")
        .select("sample_input, sample_output, time_limit")
        .eq("id", problemId)
        .single()
      
      sampleInput = problem?.sample_input?.trim() || ""
      expectedOutput = problem?.sample_output?.trim() || ""
      timeLimit = problem?.time_limit || 1.0
    }

    // 3. JDoodle API Execution (Requirement 4)
    // Use provided stdin, or fall back to sample_input when submitting
    const inputToUse = stdin !== undefined ? stdin : sampleInput
    
    const response = await fetch("https://api.jdoodle.com/v1/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: process.env.NEXT_PUBLIC_JDOODLE_CLIENT_ID || process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.NEXT_JDOODLE_CLIENT_SECRET || process.env.JDOODLE_CLIENT_SECRET || process.env.NEXT_PUBLIC_JDOODLE_CLIENT_SECRET,
        script: code,
        language: language === "cpp" ? "cpp17" : language === "python" ? "python3" : language,
        versionIndex: "0",
        stdin: inputToUse
      }),
    })

    if (!response.ok) throw new Error("JDoodle connection interrupted.")

    const result = await response.json()
    const actualOutput = result.output?.trim() || ""
    const cpuTime = parseFloat(result.cpuTime || "0")
    const memory = parseFloat(result.memory || "0")

    // 4. Verdict System Logic & Database Record
    // Only apply verdict logic and save to database when submitting (problemId provided)
    if (problemId) {
      // Verdict System Logic (Requirement 4)
      let verdict: Verdict = "WA"
      
      if (result.statusCode !== 200 || result.error) {
        verdict = "CE"
      } else if (cpuTime > timeLimit) {
        verdict = "TLE"
      } else if (actualOutput === expectedOutput) {
        verdict = "AC"
      }

      // 5. Database Record (Requirement 5)
      // We record competition_id as contest_id per previous refactor
      // user is guaranteed to exist here because problemId check requires authentication
      const { error: subError } = await supabase.from("submissions").insert({
        problem_id: problemId,
        user_id: user!.id, // user is guaranteed to exist when problemId is provided
        contest_id: contestId,
        code,
        language,
        status: verdict, // Main status column
        verdict: verdict, // Legacy/redundant column support
        runtime: cpuTime,
        memory: memory,
        score: verdict === "AC" ? 100 : 0
      })

      if (subError) console.error("Archive Error:", subError.message)

      return {
        success: true,
        output: result.output || "No output",
        verdict,
        cpuTime,
        memory
      }
    } else {
      // Run mode (custom input) - no verdict, just return output
      return {
        success: true,
        output: result.output || "No output",
        verdict: undefined, // No verdict for run mode
        cpuTime,
        memory
      }
    }
  } catch (error: any) {
    return {
      success: false,
      output: error.message,
      verdict: "RE" as Verdict
    }
  }
}