import { SYSTEM_PROMPT } from "@/lib/chat/system-prompt";

// Portfolio AI assistant endpoint. Same contract as the original Webflow Cloud
// app (POST { message, conversationHistory } → { response }) and the same model
// settings (ADR-003). The OpenAI key only exists server-side (OPENAI_API_KEY).

const MODEL = "gpt-4o-mini";
const MAX_TOKENS = 500;
const TEMPERATURE = 0.9;
const MAX_HISTORY = 5;
const MAX_MESSAGE_LENGTH = 1000;

// Best-effort abuse protection. Serverless instances don't share memory, so
// this limits bursts per instance only; see docs/decisions.md ADR-004.
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json({ error: "Chat is not configured" }, { status: 503 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) return Response.json({ error: "Too many requests" }, { status: 429 });

  let body: { message?: unknown; conversationHistory?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return Response.json({ error: "Message is required" }, { status: 400 });
  if (message.length > MAX_MESSAGE_LENGTH) return Response.json({ error: "Message is too long" }, { status: 400 });

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

  if (!res.ok) {
    console.error("OpenAI error", res.status, await res.text().catch(() => ""));
    return Response.json({ error: "Failed to get response" }, { status: 502 });
  }

  const data = await res.json();
  const response = data.choices?.[0]?.message?.content?.trim();
  if (!response) return Response.json({ error: "Empty response" }, { status: 502 });
  return Response.json({ response });
}
