import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch('https://api.jdoodle.com/v1/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: process.env.NEXT_PUBLIC_JDOODLE_CLIENT_ID,
        clientSecret: process.env.NEXT_PUBLIC_JDOODLE_CLIENT_SECRET || process.env.NEXT_JDOODLE_CLIENT_SECRET,
        script: body.code,
        language: body.language, // যেমন: 'cpp17', 'python3', 'java'
        versionIndex: "0",
        stdin: body.input
      })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "JDoodle Connection Failed" }, { status: 500 });
  }
}