import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { submissionId } = await req.json()
    const supabase = await createClient()

    // ১. সাবমিশন এবং সংশ্লিষ্ট প্রবলেমের টেস্টকেসগুলো নিয়ে আসা
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

    // ২. প্রতিটি টেস্টকেসের জন্য লুপ চালিয়ে চেক করা
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

      // এরর হ্যান্ডলিং (যেমন: কোটা শেষ বা নেটওয়ার্ক এরর)
      if (result.statusCode !== 200 && !result.output) {
        overallVerdict = "Internal Error"
        break
      }

      const actualOutput = result.output?.trim()
      const expectedOutput = tc.output?.trim()

      // মেট্রিক্স আপডেট
      maxTime = Math.max(maxTime, parseFloat(result.cpuTime || 0))
      maxMemory = Math.max(maxMemory, parseInt(result.memory || 0))
      lastOutput = result.output

      // ভার্ডিক্ট লজিক
      if (actualOutput !== expectedOutput) {
        overallVerdict = "Wrong Answer"
        break // একটি ফেল করলেই লুপ বন্ধ
      }
      
      // টাইম লিমিট চেক (যদি ১ সেকেন্ডের বেশি লাগে)
      if (parseFloat(result.cpuTime) > 1.0) {
        overallVerdict = "Time Limit Exceeded"
        break
      }
    }

    // ৩. ডাটাবেসে ফাইনাল রেজাল্ট আপডেট
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