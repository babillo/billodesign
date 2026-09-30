"use client";

import type { Howl } from "howler";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/*
 * Sound design, rebuilt from the original Howler script (docs/animations.md#sound).
 *
 * Differences from Webflow, decided by the owner (docs/migration.md §5):
 * - Starts muted. Nothing is downloaded until the visitor turns sound on.
 * - The choice is remembered in localStorage("soundOn"), as before.
 *
 * Markup opts in with data attributes so server components stay handler-free:
 *   data-sound-click  → click beep
 *   data-sound-hover  → hover beep + happy orb, sad orb on leave
 */

const SOUNDS = {
  click: { src: "/audio/click-beep.mp3", volume: 1 },
  hover: { src: "/audio/hover.mp3", volume: 1 },
  ambient: { src: "/audio/bg-ambient.mp3", volume: 0.1, loop: true },
  typing: { src: "/audio/typing-loop.mp3", volume: 0.3, loop: true },
  chatTyping: { src: "/audio/chat-typing-loop.mp3", volume: 0.15, loop: true },
  orbHappy: { src: "/audio/orb-happy.mp3", volume: 0.4 },
  orbHappyShort: { src: "/audio/orb-happy-short-0.mp3", volume: 0.4 },
  orbSad: { src: "/audio/orb-sad.mp3", volume: 0.4 },
  orbSadShort: { src: "/audio/orb-sad-short-0.mp3", volume: 0.4 },
} as const;

export type SoundName = keyof typeof SOUNDS;

type SoundContextValue = {
  enabled: boolean;
  toggle: () => void;
  play: (name: SoundName) => void;
  stop: (...names: SoundName[]) => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

const STORAGE_KEY = "soundOn";

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const howls = useRef<Partial<Record<SoundName, Howl>>>({});
  const enabledRef = useRef(false);
  // Loops that should be running right now, so they can resume after unmute or tab focus.
  const activeLoops = useRef(new Set<SoundName>());

  const load = useCallback(async () => {
    if (Object.keys(howls.current).length) return;
    const { Howl } = await import("howler");
    for (const [name, cfg] of Object.entries(SOUNDS)) {
      howls.current[name as SoundName] = new Howl({
        src: [cfg.src],
        volume: cfg.volume,
        loop: "loop" in cfg ? cfg.loop : false,
        preload: name !== "ambient",
      });
    }
  }, []);

  const play = useCallback((name: SoundName) => {
    if ("loop" in SOUNDS[name]) activeLoops.current.add(name);
    if (!enabledRef.current) return;
    const howl = howls.current[name];
    if (!howl) return;
    if ("loop" in SOUNDS[name] && howl.playing()) return;
    howl.play();
  }, []);

  const stop = useCallback((...names: SoundName[]) => {
    for (const name of names) {
      activeLoops.current.delete(name);
      howls.current[name]?.stop();
    }
  }, []);

  const setSound = useCallback(
    async (on: boolean) => {
      enabledRef.current = on;
      setEnabled(on);
      try {
        localStorage.setItem(STORAGE_KEY, String(on));
      } catch {}
      if (on) {
        await load();
        activeLoops.current.add("ambient");
        for (const name of activeLoops.current) howls.current[name]?.play();
      } else {
        for (const howl of Object.values(howls.current)) howl?.pause();
      }
    },
    [load],
  );

  const toggle = useCallback(() => void setSound(!enabledRef.current), [setSound]);

  // Restore a previous "sound on" choice. Browsers block audio until the first
  // user gesture, so playback starts on the first interaction.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {}
    if (saved !== "true") return;
    const resume = () => void setSound(true);
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
  }, [setSound]);

  // Pause loops while the tab is hidden, resume when visible (original behavior).
  useEffect(() => {
    const onVisibility = () => {
      if (!enabledRef.current) return;
      for (const name of activeLoops.current) {
        const howl = howls.current[name];
        if (document.hidden) howl?.pause();
        else howl?.play();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Delegated listeners for the data-sound-* attributes.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element).closest?.("[data-sound-click]")) play("click");
    };
    const onOver = (e: PointerEvent) => {
      const el = (e.target as Element).closest?.("[data-sound-hover]");
      if (!el || el.contains(e.relatedTarget as Node)) return;
      play("hover");
      stop("orbSadShort");
      play("orbHappyShort");
    };
    const onOut = (e: PointerEvent) => {
      const el = (e.target as Element).closest?.("[data-sound-hover]");
      if (!el || el.contains(e.relatedTarget as Node)) return;
      stop("orbHappyShort");
      play("orbSadShort");
    };
    document.addEventListener("click", onClick);
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
    };
  }, [play, stop]);

  return <SoundContext value={{ enabled, toggle, play, stop }}>{children}</SoundContext>;
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used inside <SoundProvider>");
  return ctx;
}
