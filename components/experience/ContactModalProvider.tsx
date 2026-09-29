"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSound } from "./SoundProvider";

type ContactModalContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

/*
 * Any element with data-open-contact opens the contact modal. This replaces the
 * Webflow "modal open" interactions bound to the hero/CTA buttons and the
 * navbar "Contact" link, and lets those stay server-rendered.
 */
export function ContactModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { play, stop } = useSound();

  const open = useCallback(() => {
    stop("orbSadShort", "orbSad", "orbHappyShort", "typing");
    play("orbHappy");
    setIsOpen(true);
  }, [play, stop]);

  const close = useCallback(() => {
    stop("orbHappy");
    play("orbSad");
    setIsOpen(false);
  }, [play, stop]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const trigger = (e.target as Element).closest?.("[data-open-contact]");
      if (!trigger) return;
      e.preventDefault();
      open();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  return <ContactModalContext value={{ isOpen, open, close }}>{children}</ContactModalContext>;
}

export function useContactModal() {
  const ctx = useContext(ContactModalContext);
  if (!ctx) throw new Error("useContactModal must be used inside <ContactModalProvider>");
  return ctx;
}
