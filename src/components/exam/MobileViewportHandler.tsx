"use client";

import { useEffect } from "react";
import {
  setViewportHeight,
  preventIOSBounce,
  enableSmoothScrolling,
} from "@/lib/mobile-utils";

/**
 * MobileViewportHandler sets up mobile-specific viewport and scroll behavior.
 * Should be mounted once at the app/layout level.
 *
 * Features:
 * - Dynamic viewport height (--vh CSS variable)
 * - iOS bounce scroll prevention
 * - Smooth scrolling
 */
export function MobileViewportHandler() {
  useEffect(() => {
    // Set up dynamic viewport height
    setViewportHeight();

    // Prevent iOS bounce
    preventIOSBounce();

    // Enable smooth scrolling
    enableSmoothScrolling();

    // Cleanup is handled inside setViewportHeight
  }, []);

  return null; // This component doesn't render anything
}
