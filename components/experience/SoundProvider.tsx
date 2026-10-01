"use client";

import type { Howl } from "howler";
import { createContext, useCallback, useContext, useEffect, useRef, useSyncExternalStore } from "react";

/*
 * Sound design, rebuilt from the original Howler script (docs/animations.md#sound).
 *
 * Owner decisions (docs/migration.md §5):
 * - First visit starts muted; nothing is downloaded until sound is turned on.
 * - The choice is remembered in localStorage("soundOn"), as on Webflow, and a
 *   remembered "on" plays again on the next visit (subject to the browser's
 *   autoplay rules, see below).
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

/*
 * The on/off choice lives in localStorage (as on the Webflow site), so it's
 * read as an external store: the server renders "off", the client then shows
 * the remembered choice without a setState-in-effect round trip. The module
 * variable keeps working when storage is blocked.
 */
let soundOn: boolean | null = null;
const listeners = new Set<() => void>();

function getSoundOn() {
  if (soundOn === null) {
    try {
      soundOn = localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      soundOn = false;
    }
  }
  return soundOn;
}

function setSoundOn(on: boolean) {
  soundOn = on;
  try {
    localStorage.setItem(STORAGE_KEY, String(on));
  } catch {}
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const enabled = useSyncExternalStore(subscribe, getSoundOn, () => false);
  const howls = useRef<Partial<Record<SoundName, Howl>>>({});
  const audioCtx = useRef<AudioContext | null>(null);
  // Loops that should be running right now, so they can resume after unmute or tab focus.
  const activeLoops = useRef(new Set<SoundName>());
  // Howler sound id per loop, so repeated starts resume that sound instead of stacking copies.
  const loopIds = useRef<Partial<Record<SoundName, number>>>({});

  // Browsers keep audio locked until the visitor interacts with the page
  // (unless they've already allowed this site to autoplay). While it's locked,
  // Howler would queue every play() and fire them all on unlock, so nothing is
  // started until the AudioContext is running. HTML5-audio fallback: no context.
  const audioAllowed = useCallback(() => !audioCtx.current || audioCtx.current.state === "running", []);

  // Howler doesn't load a `preload: false` sound (the large ambient track) on
  // play(); it stays silent until load() is called.
  const start = useCallback(
    (name: SoundName) => {
      const howl = howls.current[name];
      if (!howl || !audioAllowed()) return;
      if (howl.state() === "unloaded") howl.load();
      if (!("loop" in SOUNDS[name])) {
        howl.play();
        return;
      }
      // play(id) is a no-op for a sound that's already playing.
      const id = howl.play(loopIds.current[name]);
      if (typeof id === "number") loopIds.current[name] = id;
    },
    [audioAllowed],
  );

  const startLoops = useCallback(() => {
    if (!getSoundOn()) return;
    for (const name of activeLoops.current) start(name);
  }, [start]);

  const load = useCallback(async () => {
    if (Object.keys(howls.current).length) return;
    const { Howl, Howler } = await import("howler");
    if (Object.keys(howls.current).length) return;
    // Otherwise Howler suspends the context after 30s of silence, which would
    // look the same as "locked by the browser".
    Howler.autoSuspend = false;
    for (const [name, cfg] of Object.entries(SOUNDS)) {
      howls.current[name as SoundName] = new Howl({
        src: [cfg.src],
        volume: cfg.volume,
        loop: "loop" in cfg ? cfg.loop : false,
        preload: name !== "ambient",
      });
    }
    // The context exists once the first Howl is created. When the browser
    // unlocks it, start whatever should be playing.
    audioCtx.current = Howler.ctx ?? null;
    audioCtx.current?.addEventListener("statechange", () => {
      if (audioAllowed()) startLoops();
    });
  }, [audioAllowed, startLoops]);

  const unlock = useCallback(() => {
    const ctx = audioCtx.current;
    if (ctx && ctx.state !== "running") ctx.resume().catch(() => {});
  }, []);

  const play = useCallback(
    (name: SoundName) => {
      if ("loop" in SOUNDS[name]) activeLoops.current.add(name);
      if (getSoundOn()) start(name);
    },
    [start],
  );

  const stop = useCallback((...names: SoundName[]) => {
    for (const name of names) {
      activeLoops.current.delete(name);
      howls.current[name]?.stop();
    }
  }, []);

  const setSound = useCallback(
    async (on: boolean) => {
      setSoundOn(on);
      if (on) {
        await load();
        // Turned off again while Howler was still loading: don't start anything.
        if (!getSoundOn()) return;
        activeLoops.current.add("ambient");
        unlock();
        startLoops();
      } else {
        for (const howl of Object.values(howls.current)) howl?.pause();
      }
    },
    [load, unlock, startLoops],
  );

  const toggle = useCallback(() => void setSound(!getSoundOn()), [setSound]);

  // Like the Webflow site: a visitor who left sound on gets it again on the
  // next visit. Playback starts immediately if the browser allows autoplay for
  // this site; otherwise on the first click/tap/key press. (Owner decision
  // 2026-10-01, replacing "always start muted".)
  useEffect(() => {
    if (getSoundOn()) void setSound(true);
  }, [setSound]);

  // The first interaction unlocks audio. A click on the toggle is left to the
  // toggle: for someone hearing nothing yet, that click means "mute".
  useEffect(() => {
    const onGesture = (e: Event) => {
      if (!getSoundOn() || audioAllowed()) return;
      if ((e.target as Element | null)?.closest?.("[data-sound-toggle]")) return;
      unlock();
    };
    // Capture phase: elements like the Spline canvas stop these events from bubbling.
    const events = ["pointerup", "keydown", "touchend"] as const;
    for (const type of events) window.addEventListener(type, onGesture, true);
    return () => {
      for (const type of events) window.removeEventListener(type, onGesture, true);
    };
  }, [audioAllowed, unlock]);

  // Pause loops while the tab is hidden, resume when visible (original behavior).
  useEffect(() => {
    const onVisibility = () => {
      if (!getSoundOn()) return;
      for (const name of activeLoops.current) {
        const howl = howls.current[name];
        if (document.hidden) howl?.pause();
        else start(name);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [start]);

  // Delegated listeners for the data-sound-* attributes.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element).closest?.("[data-sound-click]")) play("click");
    };
    // Hover sounds (beep + happy/sad orb) are for mouse hover only; on phones a
    // tap fires pointerover/out, which made the orb "react" to every tap.
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element).closest?.("[data-sound-hover]");
      if (!el || el.contains(e.relatedTarget as Node)) return;
      play("hover");
      stop("orbSadShort");
      play("orbHappyShort");
    };
    const onOut = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
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
