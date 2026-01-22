import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { script, language, problemId, contestId, userId } = await req.json()
    const supabase = await createClient()

    // ১. ডাটাবেস থেকে প্রবলেমের ডাটা আনা (Time limit, Memory limit, Sample Output)
    const { data: problem } = await supabase
      .from("problems")
      .select("*")
      .eq("id", problemId)
      .single()

    // ২. রিকোয়ারমেন্ট ৮: অ্যান্টি-চিটিং (Rate Limiting)
    const { count: recentSubmissions } = await supabase
      .from("submissions")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .gt("created_at", new Date(Date.now() - 30000).toISOString()) // ৩০ সেকেন্ডে ১টার বেশি না

    if (recentSubmissions && recentSubmissions > 0) {
      return NextResponse.json({ error: "Too many attempts. Wait 30s." }, { status: 429 })
    }

    // ৩. রিকোয়ারমেন্ট ৩ & ৪: JDoodle এ কোড পাঠানো
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

    // ৪. রিকোয়ারমেন্ট ৪: Verdict System Logic
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

    // ৫. রিকোয়ারমেন্ট ৫ & ৬: Scoring & Penalty (ICPC Style)
    // আমরা আগের সব ভুল সাবমিশন কাউন্ট করব পেনাল্টি যোগ করার জন্য
    const { count: wrongAttempts } = await supabase
      .from("submissions")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .eq("problem_id", problemId)
      .eq("verdict", "WA")

    // সাবমিশন সেভ করা
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