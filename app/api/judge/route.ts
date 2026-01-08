import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { submissionId } = await req.json()
    const supabase = await createClient()

    // 1. Fetching submission and related problem testcases
    const { data: sub, error: subError } = await supabase
      .from('submissions')
      .select('*, problems(testcases)')
      .eq('id', submissionId)
      .single()

    if (subError || !sub) {
      return NextResponse.json({ error: 'Submission data not found' }, { status: 404 })
    }

    const testcases = sub.problems.testcases || []
    if (testcases.length === 0) {
      return NextResponse.json({ error: 'No testcases found for this problem' }, { status: 400 })
    }

    let overallVerdict = "Accepted"
    let maxTime = 0
    let maxMemory = 0
    let lastOutput = ""

    // 2. Loop through each testcase to check
    for (let i = 0; i < testcases.length; i++) {
      const tc = testcases[i]

      const response = await fetch("https://api.jdoodle.com/v1/execute", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: process.env.NEXT_PUBLIC_JDOODLE_CLIENT_ID,
          clientSecret: process.env.NEXT_JDOODLE_CLIENT_SECRET,
          script: sub.code,
          language: sub.language,
          versionIndex: "0",
          stdin: tc.input
        })
      })

      const result = await response.json()

      // Error Handling (e.g.: Quota exceeded or Network error)
      if (result.statusCode !== 200 && !result.output) {
        overallVerdict = "Internal Error"
        break
      }

      const actualOutput = result.output?.trim()
      const expectedOutput = tc.output?.trim()

      // Metric Update
      maxTime = Math.max(maxTime, parseFloat(result.cpuTime || 0))
      maxMemory = Math.max(maxMemory, parseInt(result.memory || 0))
      lastOutput = result.output

      // Verdict Logic
      if (actualOutput !== expectedOutput) {
        overallVerdict = "Wrong Answer"
        break // Break loop if one fails
      }
      
      // Time Limit Check (if more than 1 second)
      if (parseFloat(result.cpuTime) > 1.0) {
        overallVerdict = "Time Limit Exceeded"
        break
      }
    }

    // 3. Update final result in database
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        status: overallVerdict,
        execution_time: maxTime * 1000, // Seconds to Milliseconds
        memory_usage: maxMemory,
        raw_output: lastOutput
      })
      .eq('id', submissionId)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, verdict: overallVerdict })

  } catch (err: any) {
    console.error("Judge Error:", err.message)
    return NextResponse.json({ error: "Judging process failed" }, { status: 500 })
  }
}