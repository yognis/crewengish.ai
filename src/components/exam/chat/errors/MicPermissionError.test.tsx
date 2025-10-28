import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MicPermissionError } from "./MicPermissionError";

describe("MicPermissionError", () => {
  const mockOnRetry = vi.fn();

  beforeEach(() => {
    mockOnRetry.mockClear();
  });

  describe("Rendering", () => {
    it("should render error title and description", () => {
      render(<MicPermissionError onRetry={mockOnRetry} />);

      expect(screen.getByText("Mikrofon İzni Gerekli")).toBeInTheDocument();
      expect(
        screen.getByText(/Sesli cevap verebilmek için/i),
      ).toBeInTheDocument();
    });

    it("should render retry button", () => {
      render(<MicPermissionError onRetry={mockOnRetry} />);

      const button = screen.getByRole("button", { name: /tekrar dene/i });
      expect(button).toBeInTheDocument();
    });

    it("should have proper ARIA attributes", () => {
      const { container } = render(<MicPermissionError onRetry={mockOnRetry} />);

      const alertElement = container.querySelector('[role="alert"]');
      expect(alertElement).toBeInTheDocument();
      expect(alertElement).toHaveAttribute("aria-live", "assertive");
    });
  });

  describe("Browser Detection", () => {
    it("should show Chrome instructions for Chrome browser", () => {
      // Mock Chrome user agent
      Object.defineProperty(navigator, "userAgent", {
        value:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        configurable: true,
      });

      render(<MicPermissionError onRetry={mockOnRetry} />);

      expect(
        screen.getByText(/Adres çubuğunun solundaki kilit ikonuna/i),
      ).toBeInTheDocument();
    });

    it("should show Safari instructions for Safari browser", () => {
      // Mock Safari user agent
      Object.defineProperty(navigator, "userAgent", {
        value:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        configurable: true,
      });

      render(<MicPermissionError onRetry={mockOnRetry} />);

      expect(screen.getByText(/Safari > 'Tercihler'/i)).toBeInTheDocument();
    });
  });

  describe("Device Detection", () => {
    it("should show iOS instructions for iPhone", () => {
      // Mock iPhone user agent
      Object.defineProperty(navigator, "userAgent", {
        value:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        configurable: true,
      });

      render(<MicPermissionError onRetry={mockOnRetry} />);

      expect(screen.getByText(/Safari 'Ayarlar'/i)).toBeInTheDocument();
    });

    it("should show Android instructions for Android device", () => {
      // Mock Android user agent
      Object.defineProperty(navigator, "userAgent", {
        value:
          "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        configurable: true,
      });

      render(<MicPermissionError onRetry={mockOnRetry} />);

      expect(screen.getByText(/Chrome menü/i)).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should call onRetry when retry button is clicked", () => {
      render(<MicPermissionError onRetry={mockOnRetry} />);

      const button = screen.getByRole("button", { name: /tekrar dene/i });
      fireEvent.click(button);

      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple retry clicks", () => {
      render(<MicPermissionError onRetry={mockOnRetry} />);

      const button = screen.getByRole("button", { name: /tekrar dene/i });
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnRetry).toHaveBeenCalledTimes(3);
    });
  });

  describe("Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <MicPermissionError onRetry={mockOnRetry} className="custom-class" />,
      );

      const errorDiv = container.querySelector(".custom-class");
      expect(errorDiv).toBeInTheDocument();
    });

    it("should have error color scheme", () => {
      const { container } = render(<MicPermissionError onRetry={mockOnRetry} />);

      const errorDiv = container.querySelector('[role="alert"]');
      expect(errorDiv).toHaveClass("border-error", "bg-score-poor");
    });
  });

  describe("Accessibility", () => {
    it("should have proper button aria-label", () => {
      render(<MicPermissionError onRetry={mockOnRetry} />);

      const button = screen.getByLabelText("Mikrofon izni için tekrar dene");
      expect(button).toBeInTheDocument();
    });

    it("should hide decorative icons from screen readers", () => {
      const { container } = render(<MicPermissionError onRetry={mockOnRetry} />);

      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it("should have focus ring on button", () => {
      render(<MicPermissionError onRetry={mockOnRetry} />);

      const button = screen.getByRole("button", { name: /tekrar dene/i });
      expect(button).toHaveClass("focus:ring-2", "focus:ring-thy-red");
    });
  });
});
