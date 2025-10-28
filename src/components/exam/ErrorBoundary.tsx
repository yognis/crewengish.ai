"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback UI to render on error */
  fallback?: (error: Error, resetError: () => void) => ReactNode;
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show reset button (default: true) */
  showReset?: boolean;
  /** Whether to show home button (default: true) */
  showHome?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary catches JavaScript errors in child component tree,
 * logs errors, and displays a fallback UI.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   onError={(error, errorInfo) => {
 *     console.error('Error caught:', error, errorInfo);
 *   }}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Log to error reporting service (Sentry, LogRocket, etc.)
    // Example:
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  goHome = (): void => {
    window.location.href = "/";
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-thy-lightGray p-4">
          <div className="w-full max-w-md rounded-bubble border-2 border-error bg-white p-8 shadow-lg">
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
                <AlertTriangle className="h-8 w-8 text-error" aria-hidden="true" />
              </div>

              {/* Title */}
              <h1 className="mt-6 text-2xl font-bold text-thy-gray">
                Bir Hata Oluştu
              </h1>

              {/* Error Message */}
              <p className="mt-3 text-thy-gray">
                Beklenmeyen bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
              </p>

              {/* Technical Details (development only) */}
              {process.env.NODE_ENV === "development" && (
                <div className="mt-4 w-full rounded-lg bg-error/10 p-4 text-left">
                  <p className="text-sm font-semibold text-error">
                    Hata Detayları (sadece development):
                  </p>
                  <pre className="mt-2 overflow-auto text-xs text-thy-gray">
                    {this.state.error.message}
                  </pre>
                  {this.state.error.stack && (
                    <pre className="mt-2 overflow-auto text-xs text-thy-gray">
                      {this.state.error.stack.slice(0, 300)}...
                    </pre>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
                {this.props.showReset !== false && (
                  <button
                    onClick={this.resetError}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-thy-red px-6 py-3 font-semibold text-white transition-colors hover:bg-thy-darkRed focus:outline-none focus:ring-2 focus:ring-thy-red focus:ring-offset-2"
                    aria-label="Sayfayı yenile"
                  >
                    <RefreshCw className="h-5 w-5" aria-hidden="true" />
                    Yenile
                  </button>
                )}

                {this.props.showHome !== false && (
                  <button
                    onClick={this.goHome}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-thy-gray bg-white px-6 py-3 font-semibold text-thy-gray transition-colors hover:bg-thy-lightGray focus:outline-none focus:ring-2 focus:ring-thy-gray focus:ring-offset-2"
                    aria-label="Ana sayfaya dön"
                  >
                    <Home className="h-5 w-5" aria-hidden="true" />
                    Ana Sayfa
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
