"use client";

import { useEffect, useRef } from "react";
import { isIOS, isVirtualKeyboardVisible } from "@/lib/mobile-utils";

interface IOSKeyboardHandlerProps {
  /** Whether to auto-scroll to focused input */
  autoScroll?: boolean;
  /** Offset from top when scrolling (px) */
  scrollOffset?: number;
}

/**
 * IOSKeyboardHandler handles iOS-specific keyboard overlap issues.
 * Automatically scrolls focused inputs into view when keyboard appears.
 *
 * @example
 * ```tsx
 * <IOSKeyboardHandler autoScroll={true} scrollOffset={20} />
 * ```
 */
export function IOSKeyboardHandler({
  autoScroll = true,
  scrollOffset = 20,
}: IOSKeyboardHandlerProps) {
  const lastScrollPosition = useRef(0);

  useEffect(() => {
    if (!isIOS() || !autoScroll) return;

    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;

      // Only handle input elements
      if (
        !target ||
        (target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          target.tagName !== "SELECT")
      ) {
        return;
      }

      // Save current scroll position
      lastScrollPosition.current = window.scrollY;

      // Wait for keyboard to appear (300ms is typical iOS delay)
      setTimeout(() => {
        if (!isVirtualKeyboardVisible()) return;

        const rect = target.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;

        // Scroll so input is `scrollOffset` px from top
        window.scrollTo({
          top: absoluteTop - scrollOffset,
          behavior: "smooth",
        });
      }, 300);
    };

    const handleBlur = () => {
      // When keyboard closes, restore scroll position
      setTimeout(() => {
        if (isVirtualKeyboardVisible()) return;

        window.scrollTo({
          top: lastScrollPosition.current,
          behavior: "smooth",
        });
      }, 100);
    };

    document.addEventListener("focusin", handleFocus);
    document.addEventListener("focusout", handleBlur);

    return () => {
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("focusout", handleBlur);
    };
  }, [autoScroll, scrollOffset]);

  return null;
}
