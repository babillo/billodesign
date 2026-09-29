"use client";

import { Component } from "react";

/*
 * If the Spline scene can't be fetched (offline, ad-blocker, CDN outage) the
 * runtime throws. Without this boundary that error would replace the whole
 * page with Next's error screen; with it, the orb simply doesn't appear.
 */
export class OrbErrorBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Spline orb failed to load:", error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
