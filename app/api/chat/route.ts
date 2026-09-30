import { getFallbackResponse } from "@/lib/chat/fallback";
import { SYSTEM_PROMPT } from "@/lib/chat/system-prompt";
import { clientIp, createRateLimiter } from "@/lib/server/rate-limit";

// Portfolio AI assistant endpoint, ported from the original Webflow Cloud app
// (webflow/export/chatbot files/chatbot/src/pages/api/chat.ts): same contract
// (POST { message, conversationHistory } → { response }), same model settings
// (ADR-003), same keyword fallbacks when OpenAI is unavailable.
//
// Fixed vs the original: it read `history` while the widget sent
// `conversationHistory`, so previous messages were silently dropped.
// The OpenAI key only exists server-side (OPENAI_API_KEY).

const MODEL = "gpt-4o-mini";
const MAX_TOKENS = 500;
const TEMPERATURE = 0.9;
const MAX_HISTORY = 10;
const MAX_MESSAGE_LENGTH = 1000;

// 10 requests per minute per IP (ADR-004).
const isRateLimited = createRateLimiter({ windowMs: 60_000, max: 10 });

type ChatMessage = { role: "user" | "assistant"; content: string };

function parseHistory(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (m): m is ChatMessage =>
        typeof m === "object" && m !== null && (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
    )
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
}

export async function POST(request: Request) {
  if (isRateLimited(clientIp(request))) {
    return Response.json({ response: "Whoa, you're fast! 😅 Give me a minute to catch my breath, then ask again." }, { status: 429 });
  }

  let body: { message?: unknown; conversationHistory?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return Response.json({ error: "Message is required" }, { status: 400 });
  if (message.length > MAX_MESSAGE_LENGTH) return Response.json({ error: "Message is too long" }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json({ response: getFallbackResponse(message) });

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...parseHistory(body.conversationHistory), { role: "user", content: message }],
      }),
    });

    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text().catch(() => "")}`);
    const data = await res.json();
    const response = data.choices?.[0]?.message?.content?.trim();
    return Response.json({ response: response || getFallbackResponse(message) });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ response: getFallbackResponse(message) });
  }
}
