"use client";

import { useEffect, useCallback } from "react";

interface KeyboardNavigationOptions {
  /** Enable Escape key to clear focus */
  enableEscape?: boolean;
  /** Enable Enter key on focused elements */
  enableEnter?: boolean;
  /** Enable Tab key navigation */
  enableTab?: boolean;
  /** Callback when Escape is pressed */
  onEscape?: () => void;
  /** Callback when Enter is pressed */
  onEnter?: () => void;
  /** Whether keyboard navigation is enabled */
  enabled?: boolean;
}

/**
 * useKeyboardNavigation provides keyboard accessibility features
 * for exam interface components.
 *
 * Supports:
 * - Escape key: Clear focus / cancel action
 * - Enter key: Activate focused element
 * - Tab key: Navigate between focusable elements
 *
 * @example
 * ```tsx
 * useKeyboardNavigation({
 *   enableEscape: true,
 *   onEscape: () => console.log('Escape pressed'),
 *   enabled: true,
 * });
 * ```
 */
export function useKeyboardNavigation(
  options: KeyboardNavigationOptions = {},
) {
  const {
    enableEscape = true,
    enableEnter = true,
    enableTab = true,
    onEscape,
    onEnter,
    enabled = true,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Escape key - clear focus or trigger callback
      if (enableEscape && event.key === "Escape") {
        event.preventDefault();
        if (onEscape) {
          onEscape();
        } else {
          // Blur the currently focused element
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        }
      }

      // Enter key - activate focused element
      if (enableEnter && event.key === "Enter") {
        const target = event.target as HTMLElement;

        // Don't interfere with buttons, they handle Enter naturally
        if (target.tagName === "BUTTON") {
          return;
        }

        // Don't interfere with inputs
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
          return;
        }

        // For other focusable elements, trigger callback
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
      }

      // Tab key - ensure focus is visible
      if (enableTab && event.key === "Tab") {
        // Add a class to body to show focus indicators
        document.body.classList.add("keyboard-navigation-active");
      }
    },
    [enabled, enableEscape, enableEnter, enableTab, onEscape, onEnter],
  );

  const handleMouseDown = useCallback(() => {
    // Remove the keyboard navigation class on mouse interaction
    document.body.classList.remove("keyboard-navigation-active");
  }, []);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [enabled, handleKeyDown, handleMouseDown]);
}

/**
 * Hook to trap focus within a specific element (e.g., modal, dialog)
 *
 * @example
 * ```tsx
 * const dialogRef = useRef<HTMLDivElement>(null);
 * useFocusTrap(dialogRef, isOpen);
 * ```
 */
export function useFocusTrap(
  elementRef: React.RefObject<HTMLElement>,
  enabled: boolean = true,
) {
  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const element = elementRef.current;

    // Get all focusable elements
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab - going backwards
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab - going forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener("keydown", handleTabKey);

    // Focus the first element when trap is enabled
    firstElement?.focus();

    return () => {
      element.removeEventListener("keydown", handleTabKey);
    };
  }, [elementRef, enabled]);
}
