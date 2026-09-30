import { getProjects } from "@/lib/content";

// Canned replies used when OpenAI is unavailable (no key, outage, rate limit).
// Ported from the original getFallbackResponse(), with two fixes:
// - whole-word matching, so "this" no longer matches "hi"
// - the project answer names the real projects

// Whole words (plural allowed); a trailing "*" marks an intentional prefix ("technolog*").
const has = (text: string, words: string[]) =>
  words.some((w) => new RegExp(w.endsWith("*") ? `\\b${w.slice(0, -1)}` : `\\b${w}s?\\b`, "i").test(text));

export function getFallbackResponse(input: string): string {
  if (has(input, ["project", "work", "portfolio", "case stud*"])) {
    const names = getProjects()
      .map((p) => p.card.title.trim())
      .join(", ");
    return `Muhammad has worked on some exciting projects, including ${names}. Each one blends design, code, and performance optimization. Scroll to "Selected Work" to explore the case studies!`;
  }
  if (has(input, ["skill", "technolog*", "design", "tool", "stack"])) {
    return "Muhammad specializes in web design and Webflow development, with expertise in UI/UX, performance optimization, and SEO. The toolkit includes Figma, Webflow, Adobe Creative Suite, and clean code practices. What specific skill are you curious about?";
  }
  if (has(input, ["service", "offer", "help"])) {
    return "Muhammad offers three core services: Web Design (intuitive UI/UX), Webflow Development (fast, scalable sites with clean code), and Performance & SEO (optimized for speed and search). Which one interests you most?";
  }
  if (has(input, ["experience", "background"])) {
    return "As a certified Webflow developer obsessed with blending design, code, and intelligence, Muhammad helps businesses craft digital experiences that work hard and look alive. From branding to complex web platforms, it's all about creating something special!";
  }
  if (has(input, ["contact", "reach", "email", "hire", "price", "pricing", "cost", "quote"])) {
    return "You can reach Muhammad at hello@billodesign.com or through the \"Let's connect\" button on the website. He usually responds within 24 hours and is always excited to chat about new projects!";
  }
  if (has(input, ["hello", "hi", "hey"])) {
    return "Hey there! 👋 Great to chat with you! I'm here to tell you all about Muhammad's work — web design, Webflow development, and creating digital experiences that actually feel alive. What would you like to know?";
  }
  return "That's a great question! I'm here to help you learn about Muhammad's work in web design and Webflow development. Feel free to ask about projects, services, skills, or how to get in touch. What are you most curious about?";
}
