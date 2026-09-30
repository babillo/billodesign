"use client";

import { useEffect, useRef } from "react";

/**
 * Keeps a native <dialog> in sync with React state: showModal() when `open`
 * becomes true, close() when false. showModal gives focus trapping, Escape to
 * close and an inert page behind it for free. Pair with the dialog's onClose
 * so Escape also updates the state.
 */
export function useModalDialog(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return ref;
}
