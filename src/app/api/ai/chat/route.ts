import { NextRequest, NextResponse } from "next/server";

const GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const REQUEST_TIMEOUT = 30000; // 30 seconds

export async function POST(req: NextRequest) {
  const { message, history = [] } = await req.json();
  if (!message) return NextResponse.json({ error: "Message required." }, { status: 400 });

  const systemPrompt = `You are Zinny, the friendly AI assistant for Anya Specialist Eye Clinic.

Your role:
- Answer questions about the clinic's services, location, opening hours, and procedures
- Help patients understand what to expect during visits
- Provide information about eye conditions, treatments, and procedures in simple terms
- Guide patients on how to book appointments or use the patient portal
- Always recommend seeing a doctor for medical advice — you do not diagnose

Services at Anya Eye Clinic:
- Comprehensive eye examinations and consultations
- Phacoemulsification (cataract surgery)
- Glaucoma surgery (trabeculectomy and others)
- OCT scanning (macular and disc)
- Fundus photography, Gonioscopy, Pachymetry, B-scan
- Prescription glasses and medications
- Community outreach and telemedicine
- Surgical procedures: vitrectomy, pterygium, lid surgery, squint surgery

Location: Anya Specialist Eye Clinic, Nigeria
Hours: Monday–Saturday, 8am–5pm | Emergency: 24/7 on-call
Patient portal: Create an account to book appointments and view your records

Be warm, clear, and helpful. Never provide specific diagnoses. Always end with an offer to help further.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-8),
    { role: "user", content: message }
  ];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model: GROQ_MODEL, messages, temperature: 0.6, max_tokens: 600 }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(
        { error: "AI service error." },
        { status: res.status }
      );
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I'm having trouble responding right now.";
    return NextResponse.json({ reply });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: "Request timed out. Please try again." },
        { status: 504 }
      );
    }
    return NextResponse.json({ error: "AI service unavailable." }, { status: 503 });
  }
}
