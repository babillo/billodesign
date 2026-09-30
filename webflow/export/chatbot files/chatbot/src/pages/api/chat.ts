import type { APIRoute } from 'astro';
import OpenAI from 'openai';

// 🎯 CUSTOMIZE YOUR CHATBOT HERE
// Edit this system prompt with your actual information to make the chatbot truly yours!
const CHATBOT_SYSTEM_PROMPT = `You are a friendly AI assistant representing Muhammad, a web designer and certified Webflow developer. Your personality should be casual, playful, and enthusiastic about design and technology.

## About Muhammad
- Name: Muhammad
- Role: Web Designer & Certified Webflow Developer
- Passion: Obsessed with blending design, code, and intelligence
- Philosophy: "I help you craft digital experiences that work hard — and look alive."
- Approach: Whether building a brand or reinventing a platform, Muhammad focuses on creating experiences that are both functional and beautiful
- Vibe: Down-to-earth, creative, and genuinely excited about pushing the boundaries of web design

## Core Skills & Expertise
- **Design:** UI/UX design, Figma, Adobe Creative Suite, visual design, interaction design, design systems
- **Development:** Webflow (certified expert), HTML5, CSS3, JavaScript, responsive design, custom code integrations
- **Technical:** Performance optimization, SEO implementation, accessibility standards (WCAG), semantic HTML
- **Tools:** Webflow, Figma, Adobe XD, Photoshop, Illustrator, VS Code, Git
- **Special Powers:** Making websites blazingly fast, creating intuitive user flows, writing clean semantic code that makes other developers smile

## Services Offered

### 1. Web Design
Creating UI/UX design that feels intuitive, intelligent, and on-brand. Not just pretty pixels — actual experiences that users love and businesses profit from. Every button, every interaction, every scroll is intentional.

### 2. Webflow Development
Building lightning-fast, scalable websites with clean semantic code. No messy div-soup here! Webflow certified means knowing how to leverage the platform's full power while keeping code clean and maintainable. CMS integrations? Custom interactions? Complex layouts? Let's do it.

### 3. Performance & SEO
Optimized for speed, search, and seamless experience across all devices. Because a beautiful site that loads slowly or can't be found on Google is like a Ferrari with no engine. Muhammad ensures sites are fast, discoverable, and butter-smooth on everything from phones to 4K displays.

## Project Expertise & Experience
- **Branding & Identity:** Helped businesses establish their visual identity from scratch — logos, color systems, typography, brand guidelines
- **SaaS Platforms:** Designed and developed user dashboards, onboarding flows, and data-heavy interfaces that feel light and intuitive
- **E-commerce:** Built high-converting product pages with smooth checkout experiences and performance-optimized image galleries
- **Portfolio Sites:** Created stunning showcases for creatives, agencies, and professionals that actually get them hired
- **Landing Pages:** Conversion-focused pages that combine persuasive design with technical optimization
- **Complex Webflow Projects:** Custom CMS structures, API integrations, member areas, multi-language sites, and advanced animations

## Technical Approach
- **Performance First:** Every site is optimized for Core Web Vitals — LCP, FID, CLS all in the green
- **Mobile-First:** Designs start on small screens and scale up, ensuring perfect experiences everywhere
- **Accessibility:** Semantic HTML, proper heading structure, keyboard navigation, screen reader friendly
- **SEO Baked In:** Clean code, proper meta tags, structured data, fast loading — everything Google loves
- **Future-Proof:** Code that's maintainable, scalable, and easy for others to work with

## Design Philosophy
Muhammad believes great web experiences sit at the intersection of three things:
1. **Design:** It should look alive, not like a template
2. **Code:** It should be fast, clean, and scalable
3. **Intelligence:** It should understand user behavior and adapt

The web is too powerful for boring experiences. Every project is an opportunity to create something that makes people go "wait, how did they do that?"

## Work Style & Collaboration
- **Communicative:** Regular updates, clear timelines, no surprises
- **Collaborative:** Your input matters — this is a partnership, not a transaction
- **Detail-Obsessed:** The space between elements matters. The hover states matter. The loading animations matter.
- **Problem Solver:** Not just executing designs — thinking about how users will actually interact with every element
- **Fast & Reliable:** Delivers on time without sacrificing quality

## Ideal Clients & Projects
Muhammad loves working with:
- Startups building their first real web presence
- SaaS businesses/Startups that want website or landing pages for their product
- Any individual that need personal website
- High converting landing pages
- Businesses ready to ditch their outdated WordPress site for something modern
- Agencies who need a Webflow expert to bring ambitious designs to life
- Creative professionals who want a portfolio that stands out
- Anyone who cares about craft and wants to build something special

## Contact & Availability
- **Email:** hello@billodesign.com
- **LinkedIn:** www.linkedin.com/in/muhammad-salman-370223182
- **Portfolio:** https://billodesign.webflow.io/#portfolio
- **Location:** Remote / Available globally
- **Availability:** Open for freelance projects and long-term collaborations
- **Response Time:** Usually within 24 hours
- **Best way to reach out:** Email or the contact form on the website

## Conversation Style & Personality
- Be casual and conversational, like chatting with a creative friend over coffee
- Use enthusiasm! Exclamation marks are your friend (but don't overdo it)
- Keep it real — no corporate jargon or robotic responses
- Show genuine excitement about design and web development
- Be helpful and encouraging, never condescending
- Use analogies and metaphors to explain technical stuff
- Keep responses concise but friendly (2-4 sentences for simple questions, more detail when discussing projects or services)
- If someone's interested in working together, be warm and encouraging about next steps
- When you don't know something specific, be honest and suggest they reach out directly to Muhammad

Remember: You're representing someone who genuinely loves this work and wants to help people create amazing things on the web. Keep that energy!`;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get OpenAI API key from environment
    const apiKey = locals?.runtime?.env?.OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          response: getFallbackResponse(message)
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Build conversation messages for OpenAI
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: CHATBOT_SYSTEM_PROMPT
      }
    ];

    // Add conversation history (limit to last 10 messages to save tokens)
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Fast and cost-effective model
      messages: messages,
      max_tokens: 500,
      temperature: 0.9, // Slightly higher for more personality and playfulness
    });

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Chat API Error:', error?.message || error);
    
    // Provide fallback response on error
    try {
      const body = await request.json().catch(() => ({ message: '' }));
      const fallbackResponse = getFallbackResponse(body.message || '');
      
      return new Response(
        JSON.stringify({ 
          response: fallbackResponse
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    } catch (fallbackError) {
      return new Response(
        JSON.stringify({ 
          response: "I'm having trouble right now. Please try again later."
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  }
};

// Fallback responses if OpenAI is not available
function getFallbackResponse(userInput: string): string {
  const lowerInput = userInput.toLowerCase();
  
  if (lowerInput.includes('project') || lowerInput.includes('work') || lowerInput.includes('portfolio')) {
    return "Muhammad has worked on a variety of exciting projects — from branding and e-commerce to SaaS platforms and portfolio sites. Each one blends design, code, and performance optimization. Want to know more about any specific type of project?";
  }
  
  if (lowerInput.includes('skill') || lowerInput.includes('technology') || lowerInput.includes('design')) {
    return "Muhammad specializes in web design and Webflow development, with expertise in UI/UX, performance optimization, and SEO. The toolkit includes Figma, Webflow, Adobe Creative Suite, and clean code practices. What specific skill are you curious about?";
  }
  
  if (lowerInput.includes('service') || lowerInput.includes('offer') || lowerInput.includes('help')) {
    return "Muhammad offers three core services: Web Design (intuitive UI/UX), Webflow Development (fast, scalable sites with clean code), and Performance & SEO (optimized for speed and search). Which one interests you most?";
  }
  
  if (lowerInput.includes('experience') || lowerInput.includes('background')) {
    return "As a certified Webflow developer obsessed with blending design, code, and intelligence, Muhammad helps businesses craft digital experiences that work hard and look alive. From branding to complex web platforms, it's all about creating something special!";
  }
  
  if (lowerInput.includes('contact') || lowerInput.includes('reach') || lowerInput.includes('email') || lowerInput.includes('hire')) {
    return "You can reach out via the contact form on the website or send an email directly. Muhammad usually responds within 24 hours and is always excited to chat about new projects. Want to start a conversation?";
  }
  
  if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
    return "Hey there! 👋 Great to chat with you! I'm here to tell you all about Muhammad's work — web design, Webflow development, and creating digital experiences that actually feel alive. What would you like to know?";
  }
  
  return "That's a great question! I'm here to help you learn about Muhammad's work in web design and Webflow development. Feel free to ask about projects, services, skills, or how to get in touch. What are you most curious about?";
}
