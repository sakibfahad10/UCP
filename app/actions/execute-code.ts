"use server"

import { createClient } from "@/lib/supabase/server"

export async function executeCode(code: string, language: string, problemId?: string, contestId?: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // 1. Send code to JDoodle API
    const response = await fetch("https://api.jdoodle.com/v1/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script: code,
        language: language === "cpp" ? "cpp17" : language === "python" ? "python3" : language,
        versionIndex: "0",
      }),
    })

    const result = await response.json()
    const output = result.output?.trim()

    // 2. Match with Sample Output
    let status = "pending"
    if (problemId) {
      const { data: problem } = await supabase.from("problems").select("sample_output").eq("id", problemId).single()
      status = output === problem?.sample_output?.trim() ? "accepted" : "wrong_answer"
    }

    // 3. Save to submissions table (competition_id -> contest_id)
    const { error: subError } = await supabase.from("submissions").insert({
      problem_id: problemId,
      user_id: user.id,
      contest_id: contestId, // UPDATED: competition_id changed to contest_id
      code,
      language,
      status,
      runtime: parseFloat(result.cpuTime || "0"),
      memory: parseFloat(result.memory || "0")
    })

    if (subError) console.error("Database save error:", subError.message)

    return {
      success: true,
      output: output || "No output",
      status: status
    }
  } catch (error: any) {
    return {
      success: false,
      output: error.message,
    }
  }
}