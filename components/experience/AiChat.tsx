"use client";

import { useEffect, useRef, useState } from "react";
import { useSound } from "./SoundProvider";
import { CloseIcon } from "@/components/ui/CloseIcon";
import { useModalDialog } from "./useModalDialog";
import styles from "./AiChat.module.css";

type Message = { role: "user" | "assistant"; content: string; time: string };

const GREETING = "Hey human 👋 I'm your AI assistant. Ask me anything about Muhammad's work, projects, or skills!";
const QUICK_QUESTIONS = ["Tell me about your projects", "What are your skills?", "How can I contact you?"];
const TYPING_SPEED_MS = 30;
// The server only receives the last few messages (same as the original widget).
const MAX_HISTORY = 5;

const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/*
 * Portfolio AI assistant: floating button + chat modal. UI and behaviour match
 * the original custom-code widget; requests now go to this app's /api/chat
 * route (docs/migration.md §2) instead of the Webflow Cloud app.
 */
export function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [greetingTime, setGreetingTime] = useState("");
  const [input, setInput] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [typing, setTyping] = useState<{ full: string; shown: number } | null>(null);
  const dialogRef = useModalDialog(open);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { play, stop } = useSound();

  // Runs after useModalDialog's effect, so the dialog is already open.
  useEffect(() => {
    if (open) inputRef.current?.focus();
    else stop("chatTyping");
  }, [open, stop]);

  // Typewriter for the assistant's reply, with the typing sound while it runs.
  useEffect(() => {
    if (!typing) return;
    const t = setTimeout(() => {
      if (typing.shown < typing.full.length) {
        setTyping({ ...typing, shown: typing.shown + 1 });
        return;
      }
      stop("chatTyping");
      setMessages((m) => [...m, { role: "assistant", content: typing.full, time: formatTime(new Date()) }]);
      setTyping(null);
    }, TYPING_SPEED_MS);
    return () => clearTimeout(t);
  }, [typing, stop]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, typing, waiting]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || waiting || typing) return;
    const history = messages.slice(-MAX_HISTORY).map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, { role: "user", content: message, time: formatTime(new Date()) }]);
    setInput("");
    setWaiting(true);
    let reply = "Oops! Something went wrong. Please try again.";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversationHistory: history }),
      });
      // The server sends a friendly `response` even for rate limits and outages.
      const data = await res.json().catch(() => null);
      if (data?.response) reply = data.response;
    } catch {}
    setWaiting(false);
    play("chatTyping");
    setTyping({ full: reply, shown: 0 });
    inputRef.current?.focus();
  }

  return (
    <>
      <button type="button" className={styles.launcher} onClick={() => {
          // Set on first open (not during render) so server and client HTML match.
          if (!greetingTime) setGreetingTime(formatTime(new Date()));
          setOpen(true);
        }}
        aria-label="Open AI chat" data-sound-click="">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label="Portfolio AI assistant"
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      >
        <div className={styles.container}>
          <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close chat" data-sound-click="">
            <CloseIcon />
          </button>

          <div className={styles.header}>
            {open && (
              <img src="/images/orb-blinking-chat.gif" alt="" className={styles.orb} />
            )}
          </div>

          <div className={styles.messages} ref={listRef} aria-live="polite">
            <ChatMessage role="assistant" content={GREETING} time={greetingTime} />

            {messages.length === 0 && (
              <div className={styles.quick}>
                <p className={styles.quickLabel}>Quick questions:</p>
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className={styles.quickButton}
                    onClick={() => {
                      setInput(q);
                      inputRef.current?.focus();
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <ChatMessage key={i} {...m} />
            ))}

            {/* Hidden from the live region while typing; the finished reply is announced once. */}
            {typing && (
              <div aria-hidden="true">
                <ChatMessage role="assistant" content={typing.full.slice(0, typing.shown)} time="" cursor />
              </div>
            )}

            {waiting && (
              <div className={styles.typingIndicator} aria-label="Assistant is typing">
                <Avatar role="assistant" />
                <div className={styles.dots}>
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>

          <div className={styles.inputArea}>
            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
            >
              <label htmlFor="ai-chat-input" className="visually-hidden">
                Your message
              </label>
              <input
                ref={inputRef}
                id="ai-chat-input"
                className={styles.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                autoComplete="off"
                maxLength={1000}
                disabled={waiting}
              />
              <button type="submit" className={styles.send} disabled={waiting || !!typing || !input.trim()} aria-label="Send message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </form>
            <div className={styles.footer}>Muhammad&apos;s Portfolio AI assistant • Responses may vary</div>
          </div>

          <img src="/images/ellipse.avif" alt="" className={`${styles.ellipse} ${styles.topLeft}`} />
          <img src="/images/ellipse.avif" alt="" className={`${styles.ellipse} ${styles.bottomRight}`} />
        </div>
      </dialog>
    </>
  );
}

function ChatMessage({ role, content, time, cursor }: { role: Message["role"]; content: string; time: string; cursor?: boolean }) {
  return (
    <div className={`${styles.message} ${role === "user" ? styles.user : styles.bot}`}>
      <Avatar role={role} />
      <div>
        <div className={styles.bubble}>
          {content}
          {cursor && <span className={styles.cursor} aria-hidden="true" />}
        </div>
        {time && <div className={styles.time}>{time}</div>}
      </div>
    </div>
  );
}

function Avatar({ role }: { role: Message["role"] }) {
  return (
    <div className={`${styles.avatar} ${role === "user" ? styles.avatarUser : styles.avatarBot}`} aria-hidden="true">
      {role === "user" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </svg>
      )}
    </div>
  );
}
