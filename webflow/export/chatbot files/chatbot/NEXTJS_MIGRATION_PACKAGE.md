# 🚀 AI Chatbot - Next.js Migration Package

This package contains all the files you need to migrate your AI chatbot to Next.js + Vercel.

## 📦 Files Included

### 1. **Components** (Copy to `components/` or `src/components/`)
- `AIChatbot.tsx` - Main chatbot modal component
- `ChatbotTrigger.tsx` - Floating chat button

### 2. **API Route** (Copy to `pages/api/` or `app/api/`)
- `chat.ts` - OpenAI integration endpoint

### 3. **Styles** (Copy to `styles/` or `src/styles/`)
- `global.css` - Global styles and Tailwind config

### 4. **Environment Variables**
- `.env.local` - Your OpenAI API key

---

## 🔧 Next.js Setup Instructions

### Step 1: Install Dependencies

```bash
npm install openai lucide-react
# or
yarn add openai lucide-react
# or
pnpm add openai lucide-react
```

### Step 2: Copy Files

**For App Router (Next.js 13+):**
```
your-nextjs-project/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          ← Copy chat.ts here (rename to route.ts)
│   └── layout.tsx                ← Add ChatbotTrigger here
├── components/
│   ├── AIChatbot.tsx             ← Copy here
│   └── ChatbotTrigger.tsx        ← Copy here
├── styles/
│   └── globals.css               ← Merge with your existing global.css
└── .env.local                    ← Add your OpenAI API key
```

**For Pages Router (Next.js 12 or older):**
```
your-nextjs-project/
├── pages/
│   ├── api/
│   │   └── chat.ts               ← Copy here
│   └── _app.tsx                  ← Add ChatbotTrigger here
├── components/
│   ├── AIChatbot.tsx             ← Copy here
│   └── ChatbotTrigger.tsx        ← Copy here
├── styles/
│   └── globals.css               ← Merge with your existing global.css
└── .env.local                    ← Add your OpenAI API key
```

### Step 3: Update API Route for Next.js

**For App Router (`app/api/chat/route.ts`):**

Replace the Astro-specific code with Next.js API route format:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// ... (keep the CHATBOT_SYSTEM_PROMPT as is)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get OpenAI API key from environment
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { response: getFallbackResponse(message) },
        { status: 200 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // ... (rest of the OpenAI logic remains the same)

    return NextResponse.json({ response: aiResponse });

  } catch (error: any) {
    console.error('Chat API Error:', error?.message || error);
    
    const body = await request.json().catch(() => ({ message: '' }));
    const fallbackResponse = getFallbackResponse(body.message || '');
    
    return NextResponse.json(
      { response: fallbackResponse },
      { status: 200 }
    );
  }
}

// ... (keep getFallbackResponse function as is)
```

**For Pages Router (`pages/api/chat.ts`):**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// ... (keep the CHATBOT_SYSTEM_PROMPT as is)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get OpenAI API key from environment
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        response: getFallbackResponse(message)
      });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // ... (rest of the OpenAI logic remains the same)

    return res.status(200).json({ response: aiResponse });

  } catch (error: any) {
    console.error('Chat API Error:', error?.message || error);
    
    const fallbackResponse = getFallbackResponse(req.body?.message || '');
    
    return res.status(200).json({
      response: fallbackResponse
    });
  }
}

// ... (keep getFallbackResponse function as is)
```

### Step 4: Update Component Imports

In `AIChatbot.tsx`, remove the Astro-specific import:

```typescript
// Remove this line:
import { baseUrl } from '../lib/base-url';

// Replace fetch calls with:
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: userInput,
    conversationHistory: messages.slice(-5),
  }),
});
```

### Step 5: Add Chatbot to Your Layout

**For App Router (`app/layout.tsx`):**

```typescript
import ChatbotTrigger from '@/components/ChatbotTrigger'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ChatbotTrigger />
      </body>
    </html>
  )
}
```

**For Pages Router (`pages/_app.tsx`):**

```typescript
import type { AppProps } from 'next/app'
import ChatbotTrigger from '@/components/ChatbotTrigger'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <ChatbotTrigger />
    </>
  )
}
```

### Step 6: Environment Variables

Create `.env.local` in your project root:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

**Important:** Add `.env.local` to your `.gitignore`!

### Step 7: Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variable in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add `OPENAI_API_KEY` with your key
4. Deploy!

---

## 🎨 Tailwind CSS Configuration

Make sure your `tailwind.config.js` includes:

```javascript
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

---

## 🔍 Key Differences from Astro

1. **API Routes:** Changed from Astro's `APIRoute` to Next.js `NextRequest/NextResponse` or `NextApiRequest/NextApiResponse`
2. **Base URL:** Removed `baseUrl` import - Next.js handles routing automatically
3. **Environment Variables:** Use `process.env` instead of `import.meta.env`
4. **Client Components:** Add `'use client'` directive at the top of both component files

---

## ✅ Checklist

- [ ] Install dependencies (`openai`, `lucide-react`)
- [ ] Copy component files
- [ ] Copy and adapt API route
- [ ] Update imports in `AIChatbot.tsx`
- [ ] Add `'use client'` to component files
- [ ] Add ChatbotTrigger to layout
- [ ] Create `.env.local` with OpenAI key
- [ ] Test locally
- [ ] Deploy to Vercel
- [ ] Add environment variable in Vercel dashboard

---

## 🆘 Troubleshooting

**Issue:** "Module not found: Can't resolve 'openai'"
- **Solution:** Run `npm install openai`

**Issue:** "OPENAI_API_KEY is not defined"
- **Solution:** Make sure `.env.local` exists and contains your key

**Issue:** Chatbot not appearing
- **Solution:** Ensure ChatbotTrigger is added to your layout/app file

**Issue:** Styles not working
- **Solution:** Check that Tailwind CSS is properly configured

---

## 📞 Need Help?

If you run into any issues during migration, let me know! I'm here to help. 😊

---

**Built with ❤️ by AG**
