"use client";

import { useState } from "react";
import { Ellipses } from "@/components/ui/Ellipses";
import { PulseDot } from "@/components/ui/Button";
import { orbLines } from "@/lib/site";
import { useContactModal } from "./ContactModalProvider";
import { OrbSpeech } from "./OrbSpeech";
import { Turnstile, turnstileEnabled } from "./Turnstile";
import { CloseIcon } from "@/components/ui/CloseIcon";
import { useModalDialog } from "./useModalDialog";
import styles from "./ContactModal.module.css";

type Status = "idle" | "sending" | "success" | "error";

/*
 * "Send Transmission" contact form in a modal (replaces the Webflow form +
 * IX2 modal open/close). Rendered as a native <dialog> for focus trapping,
 * Escape handling and background inertness.
 */
export function ContactModal() {
  const { isOpen, close } = useContactModal();
  const dialogRef = useModalDialog(isOpen);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [turnstileError, setTurnstileError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Without a token the server rejects the message, so don't send it yet.
    if (turnstileEnabled() && !turnstileToken) {
      setErrorMessage(turnstileError ? `Spam check failed to load (${turnstileError}). Please refresh and try again.` : "Verifying you’re human, please try again in a moment.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setErrorMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(e.currentTarget)), turnstileToken }),
      });
      if (res.ok) {
        setStatus("success");
        return;
      }
      const data = await res.json().catch(() => null);
      setErrorMessage(data?.error ?? "");
      setStatus("error");
    } catch {
      setStatus("error");
    }
    // Turnstile tokens are single-use: get a fresh one for the next attempt.
    setTurnstileToken("");
    setTurnstileReset((n) => n + 1);
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label="Contact Muhammad"
      onClose={() => isOpen && close()}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className={`${styles.modal} gradient-border`}>
        {isOpen && (
          <img src="/images/orb-blinking.gif" alt="" className={styles.orb} />
        )}

        <div className={styles.formBlock}>
          {status === "success" ? (
            <div className={styles.success} role="status">
              Transmission received. I’ll make sure Muhammad gets it! 😎
            </div>
          ) : (
            <form className={styles.form} onSubmit={onSubmit}>
              {isOpen && <OrbSpeech lines={orbLines.modal} loop backDelay={3000} variant="modal" />}
              <label className="visually-hidden" htmlFor="contact-name">Name</label>
              <input id="contact-name" className={styles.field} name="name" placeholder="Name" type="text" maxLength={256} required autoComplete="name" />
              <label className="visually-hidden" htmlFor="contact-email">Email</label>
              <input id="contact-email" className={styles.field} name="email" placeholder="Email" type="email" maxLength={256} required autoComplete="email" />
              <label className="visually-hidden" htmlFor="contact-message">Message</label>
              <textarea id="contact-message" className={`${styles.field} ${styles.textarea}`} name="message" placeholder="Your Message" maxLength={5000} required />
              {/* Honeypot: hidden from people, filled in by bots. */}
              <input className={styles.honeypot} name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              {isOpen && (
                <Turnstile
                  onToken={(token) => {
                    setTurnstileToken(token);
                    if (token) setTurnstileError("");
                  }}
                  onError={setTurnstileError}
                  resetKey={turnstileReset}
                />
              )}
              <div className={styles.spacer} />
              <button type="submit" className={styles.submit} disabled={status === "sending"} data-sound-click="">
                <PulseDot />
                <span>{status === "sending" ? "....." : "Send Transmission"}</span>
              </button>
              {status === "error" && (
                <div className={styles.error} role="alert">
                  Oops! Something went wrong while submitting the form.{errorMessage && ` ${errorMessage}`}
                </div>
              )}
            </form>
          )}
        </div>

        <Ellipses variant="modal" />
        <button type="button" className={styles.close} onClick={close} aria-label="Close contact form" data-sound-click="">
          <CloseIcon />
        </button>
      </div>
    </dialog>
  );
}
