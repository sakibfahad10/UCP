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

    if (!user) throw new Error("Unauthorized")

    // 1. Anti-cheating / Rate Limiting (Requirement 8)
    const { count: recentSubmissions } = await supabase
      .from("submissions")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", user.id)
      .gt("created_at", new Date(Date.now() - 10000).toISOString()) // 10s cooldown for professional feel

    if (recentSubmissions && recentSubmissions > 0) {
      throw new Error("Cooling down. Please wait 10 seconds between deployments.")
    }

    // 2. Fetch Problem Constraints (Requirement 3)
    let expectedOutput = ""
    let timeLimit = 1.0 // default 1s
    if (problemId) {
      const { data: problem } = await supabase
        .from("problems")
        .select("sample_output, time_limit")
        .eq("id", problemId)
        .single()
      
      expectedOutput = problem?.sample_output?.trim() || ""
      timeLimit = problem?.time_limit || 1.0
    }

    // 3. JDoodle API Execution (Requirement 4)
    const response = await fetch("https://api.jdoodle.com/v1/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: process.env.NEXT_PUBLIC_JDOODLE_CLIENT_ID || process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.NEXT_JDOODLE_CLIENT_SECRET || process.env.JDOODLE_CLIENT_SECRET || process.env.NEXT_PUBLIC_JDOODLE_CLIENT_SECRET,
        script: code,
        language: language === "cpp" ? "cpp17" : language === "python" ? "python3" : language,
        versionIndex: "0",
        stdin: stdin || ""
      }),
    })

    if (!response.ok) throw new Error("JDoodle connection interrupted.")

    const result = await response.json()
    const actualOutput = result.output?.trim() || ""
    const cpuTime = parseFloat(result.cpuTime || "0")
    const memory = parseFloat(result.memory || "0")

    // 4. Verdict System Logic (Requirement 4)
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
    const { error: subError } = await supabase.from("submissions").insert({
      problem_id: problemId,
      user_id: user.id,
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
  } catch (error: any) {
    return {
      success: false,
      output: error.message,
      verdict: "RE" as Verdict
    }
  }
}