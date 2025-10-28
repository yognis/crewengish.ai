/**
 * Mobile-specific utilities for handling viewport, keyboard, and touch interactions
 */

/**
 * Detect if the user is on a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

/**
 * Detect if the user is on iOS
 */
export function isIOS(): boolean {
  if (typeof window === "undefined") return false;

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/**
 * Detect if the user is on Android
 */
export function isAndroid(): boolean {
  if (typeof window === "undefined") return false;

  return /Android/i.test(navigator.userAgent);
}

/**
 * Get the actual viewport height accounting for mobile browser UI
 * Uses CSS custom property --vh for dynamic viewport height
 */
export function setViewportHeight(): void {
  if (typeof window === "undefined") return;

  const updateVh = () => {
    // Get actual viewport height
    const vh = window.innerHeight * 0.01;
    // Set CSS custom property
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  // Initial set
  updateVh();

  // Update on resize (handles keyboard show/hide)
  window.addEventListener("resize", updateVh);
  window.addEventListener("orientationchange", updateVh);

  // iOS-specific: update on scroll (Safari toolbar hide/show)
  if (isIOS()) {
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updateVh();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true },
    );
  }
}

/**
 * Calculate safe area insets for iOS devices with notch
 */
export function getSafeAreaInsets() {
  if (typeof window === "undefined") {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const style = getComputedStyle(document.documentElement);

  return {
    top: parseInt(style.getPropertyValue("env(safe-area-inset-top)") || "0"),
    right: parseInt(
      style.getPropertyValue("env(safe-area-inset-right)") || "0",
    ),
    bottom: parseInt(
      style.getPropertyValue("env(safe-area-inset-bottom)") || "0",
    ),
    left: parseInt(
      style.getPropertyValue("env(safe-area-inset-left)") || "0",
    ),
  };
}

/**
 * Prevent iOS bounce scroll (elastic scrolling)
 */
export function preventIOSBounce(): void {
  if (!isIOS()) return;

  document.body.style.overscrollBehavior = "none";
}

/**
 * Handle iOS keyboard overlap issues
 * Scrolls element into view when keyboard appears
 * Returns cleanup function
 */
export function handleKeyboardOverlap(
  element: HTMLElement | null,
): (() => void) | undefined {
  if (!element || !isMobileDevice()) return;

  const handleFocus = () => {
    // Small delay to ensure keyboard is shown
    setTimeout(() => {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
  };

  element.addEventListener("focus", handleFocus);

  // Cleanup
  return () => {
    element.removeEventListener("focus", handleFocus);
  };
}

/**
 * Enable smooth scrolling for iOS
 */
export function enableSmoothScrolling(): void {
  if (typeof window === "undefined") return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (document.documentElement.style as any).webkitOverflowScrolling = "touch";
}

/**
 * Disable text selection on mobile (useful for buttons)
 */
export function disableTextSelection(element: HTMLElement): void {
  element.style.userSelect = "none";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (element.style as any).webkitUserSelect = "none";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (element.style as any).webkitTouchCallout = "none";
}

/**
 * Get touch target size recommendation
 * Returns true if element meets WCAG 2.1 Level AAA (44x44px minimum)
 */
export function meetsWCAGTouchTarget(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const MIN_SIZE = 44; // WCAG 2.1 AAA minimum

  return rect.width >= MIN_SIZE && rect.height >= MIN_SIZE;
}

/**
 * Detect if virtual keyboard is visible (heuristic)
 */
export function isVirtualKeyboardVisible(): boolean {
  if (typeof window === "undefined") return false;

  // Heuristic: if viewport height is significantly smaller than window height
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  const windowHeight = window.screen.height;

  // If viewport is less than 60% of screen height, keyboard is likely visible
  return viewportHeight < windowHeight * 0.6;
}
