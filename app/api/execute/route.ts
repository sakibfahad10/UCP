import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { script, language, problemId, contestId, userId } = await req.json()
    const supabase = await createClient()

    // 1. Fetch problem data from database (Time limit, Memory limit, Sample Output)
    const { data: problem } = await supabase
      .from("problems")
      .select("*")
      .eq("id", problemId)
      .single()

    // 2. Requirement 8: Anti-cheating (Rate Limiting)
    const { count: recentSubmissions } = await supabase
      .from("submissions")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .gt("created_at", new Date(Date.now() - 30000).toISOString()) // Not more than 1 in 30 seconds

    if (recentSubmissions && recentSubmissions > 0) {
      return NextResponse.json({ error: "Too many attempts. Wait 30s." }, { status: 429 })
    }

    // 3. Requirement 3 & 4: Sending code to JDoodle
    const response = await fetch("https://api.jdoodle.com/v1/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script,
        language,
        versionIndex: "0",
        stdin: problem.sample_input
      }),
    })

    const result = await response.json()

    // 4. Requirement 4: Verdict System Logic
    let verdict = "WA" // Wrong Answer default
    const actualOutput = result.output?.trim()
    const expectedOutput = problem.sample_output?.trim()

    if (result.statusCode !== 200 || result.error) {
      verdict = "CE" // Compilation Error
    } else if (result.cpuTime > (problem.time_limit || 1.0)) {
      verdict = "TLE" // Time Limit Exceeded
    } else if (actualOutput === expectedOutput) {
      verdict = "AC" // Accepted
    }

    // 5. Requirement 5 & 6: Scoring & Penalty (ICPC Style)
    // We will count all previous wrong submissions to add penalty
    const { count: wrongAttempts } = await supabase
      .from("submissions")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .eq("problem_id", problemId)
      .eq("verdict", "WA")

    // Save Submission
    const { data: submission, error: subError } = await supabase
      .from("submissions")
      .insert({
        user_id: userId,
        problem_id: problemId,
        contest_id: contestId,
        code: script,
        language,
        verdict,
        execution_time: result.cpuTime || 0,
        memory_used: result.memory || 0
      })
      .select()
      .single()

    return NextResponse.json({
      verdict,
      output: result.output,
      cpuTime: result.cpuTime,
      memory: result.memory,
      submissionId: submission?.id
    })

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}