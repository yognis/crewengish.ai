import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NetworkError } from "./NetworkError";

describe("NetworkError", () => {
  const mockOnRetry = vi.fn();

  it("should render default error message", () => {
    render(<NetworkError onRetry={mockOnRetry} />);

    expect(screen.getByText("Bağlantı Sorunu")).toBeInTheDocument();
    expect(
      screen.getByText(/İnternet bağlantınız kesildi veya çok yavaş/i),
    ).toBeInTheDocument();
  });

  it("should render custom error message", () => {
    render(
      <NetworkError onRetry={mockOnRetry} message="Custom error message" />,
    );

    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("should display troubleshooting checklist", () => {
    render(<NetworkError onRetry={mockOnRetry} />);

    expect(
      screen.getByText(/Wi-Fi veya mobil veri bağlantınız açık mı/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/İnternet sinyaliniz güçlü mü/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Başka sitelere erişebiliyor musunuz/i),
    ).toBeInTheDocument();
  });

  it("should call onRetry when button is clicked", () => {
    render(<NetworkError onRetry={mockOnRetry} />);

    const button = screen.getByRole("button", { name: /bağlantıyı tekrar dene/i });
    fireEvent.click(button);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it("should have proper ARIA attributes", () => {
    const { container } = render(<NetworkError onRetry={mockOnRetry} />);

    const alertElement = container.querySelector('[role="alert"]');
    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveAttribute("aria-live", "assertive");
  });

  it("should have warning color scheme", () => {
    const { container } = render(<NetworkError onRetry={mockOnRetry} />);

    const alertDiv = container.querySelector('[role="alert"]');
    expect(alertDiv).toHaveClass("border-warning", "bg-score-fair");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <NetworkError onRetry={mockOnRetry} className="test-class" />,
    );

    const alertDiv = container.querySelector(".test-class");
    expect(alertDiv).toBeInTheDocument();
  });
});
