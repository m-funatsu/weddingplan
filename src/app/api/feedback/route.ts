import { NextRequest, NextResponse } from "next/server";

const VOICEBOARD_URL = process.env.NEXT_PUBLIC_VOICEBOARD_URL || "";
const PROJECT_ID = process.env.NEXT_PUBLIC_VOICEBOARD_PROJECT_ID || "";

export async function POST(req: NextRequest) {
  if (!VOICEBOARD_URL || !PROJECT_ID) {
    return NextResponse.json({ error: "VoiceBoard not configured" }, { status: 503 });
  }

  try {
    const body = await req.json();

    const res = await fetch(`${VOICEBOARD_URL}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        projectId: PROJECT_ID,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to proxy request" }, { status: 502 });
  }
}
