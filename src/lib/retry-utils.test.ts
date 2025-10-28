import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { retryWithBackoff, createRetryState } from "./retry-utils";

describe("retry-utils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("retryWithBackoff", () => {
    it("should succeed on first attempt", async () => {
      const operation = vi.fn().mockResolvedValue("success");

      const promise = retryWithBackoff(operation);
      const result = await promise;

      expect(result).toEqual({
        success: true,
        data: "success",
        attempts: 1,
      });
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("should retry on failure and eventually succeed", async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail 1"))
        .mockRejectedValueOnce(new Error("fail 2"))
        .mockResolvedValue("success");

      const onRetry = vi.fn();

      const promise = retryWithBackoff(operation, {
        maxAttempts: 3,
        initialDelay: 100,
        jitter: false,
        onRetry,
      });

      // Run all timers
      await vi.runAllTimersAsync();

      const result = await promise;

      expect(result).toEqual({
        success: true,
        data: "success",
        attempts: 3,
      });
      expect(operation).toHaveBeenCalledTimes(3);
      expect(onRetry).toHaveBeenCalledTimes(2);
    });

    it("should fail after max attempts", async () => {
      const error = new Error("persistent failure");
      const operation = vi.fn().mockRejectedValue(error);

      const promise = retryWithBackoff(operation, {
        maxAttempts: 3,
        initialDelay: 100,
        jitter: false,
      });

      // Run all timers
      await vi.runAllTimersAsync();

      const result = await promise;

      expect(result).toEqual({
        success: false,
        error,
        attempts: 3,
      });
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it("should apply exponential backoff", async () => {
      const operation = vi.fn().mockRejectedValue(new Error("fail"));

      const promise = retryWithBackoff(operation, {
        maxAttempts: 4,
        initialDelay: 100,
        backoffMultiplier: 2,
        jitter: false, // Disable jitter for predictable delays
      });

      // First retry: 100ms (100 * 2^0)
      await vi.advanceTimersByTimeAsync(100);
      expect(operation).toHaveBeenCalledTimes(2);

      // Second retry: 200ms (100 * 2^1)
      await vi.advanceTimersByTimeAsync(200);
      expect(operation).toHaveBeenCalledTimes(3);

      // Third retry: 400ms (100 * 2^2)
      await vi.advanceTimersByTimeAsync(400);
      expect(operation).toHaveBeenCalledTimes(4);

      await promise;
    });

    it("should respect maxDelay cap", async () => {
      const operation = vi.fn().mockRejectedValue(new Error("fail"));

      const promise = retryWithBackoff(operation, {
        maxAttempts: 5,
        initialDelay: 1000,
        maxDelay: 2000,
        backoffMultiplier: 10,
        jitter: false,
      });

      // First retry: should be capped at 2000ms (not 1000ms)
      await vi.advanceTimersByTimeAsync(1000);

      // Second retry: should be capped at 2000ms (not 10000ms)
      await vi.advanceTimersByTimeAsync(2000);

      // All subsequent retries should also be 2000ms max
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(2000);

      await promise;
      expect(operation).toHaveBeenCalledTimes(5);
    });

    it("should call onRetry callback with attempt and error", async () => {
      const error = new Error("test error");
      const operation = vi.fn().mockRejectedValue(error);
      const onRetry = vi.fn();

      const promise = retryWithBackoff(operation, {
        maxAttempts: 3,
        initialDelay: 100,
        jitter: false,
        onRetry,
      });

      await vi.runAllTimersAsync();
      await promise;

      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenNthCalledWith(1, 1, error);
      expect(onRetry).toHaveBeenNthCalledWith(2, 2, error);
    });

    it("should handle non-Error exceptions", async () => {
      const operation = vi.fn().mockRejectedValue("string error");

      const promise = retryWithBackoff(operation, {
        maxAttempts: 2,
        initialDelay: 100,
        jitter: false,
      });

      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("string error");
    });

    it("should apply jitter to delays", async () => {
      const operation = vi.fn().mockRejectedValue(new Error("fail"));
      const delays: number[] = [];

      // Spy on setTimeout to capture actual delays
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = ((callback: any, delay: number) => {
        delays.push(delay);
        return originalSetTimeout(callback, delay);
      }) as any;

      const promise = retryWithBackoff(operation, {
        maxAttempts: 3,
        initialDelay: 1000,
        jitter: true,
      });

      await vi.runAllTimersAsync();
      await promise;

      // With jitter, delays should vary (±25% of base delay)
      // First delay should be around 1000ms ± 250ms
      expect(delays[0]).toBeGreaterThanOrEqual(750);
      expect(delays[0]).toBeLessThanOrEqual(1250);

      global.setTimeout = originalSetTimeout;
    });
  });

  describe("createRetryState", () => {
    it("should create initial retry state with defaults", () => {
      const state = createRetryState();

      expect(state).toEqual({
        isRetrying: false,
        currentAttempt: 0,
        maxAttempts: 3,
      });
    });

    it("should create initial retry state with custom maxAttempts", () => {
      const state = createRetryState(5);

      expect(state).toEqual({
        isRetrying: false,
        currentAttempt: 0,
        maxAttempts: 5,
      });
    });
  });
});
