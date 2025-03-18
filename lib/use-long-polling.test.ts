import { vi, describe, it, expect, beforeEach, afterEach, Mock } from "vitest";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { renderHook } from "@testing-library/react";
import { useLongPolling } from "./use-long-polling";

// Explicit mock setup
vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>(
    "next/navigation"
  );
  return {
    ...actual,
    useRouter: vi.fn(),
  };
});

vi.mock("swr", async () => {
  const actual = await vi.importActual<typeof import("swr")>("swr");
  return {
    ...actual,
    default: vi.fn(), // mock default import (if needed)
  };
});

describe("useLongPolling", () => {
  const endpoint = `/api?reference=123`;
  const fetcher = vi.fn();
  const onSuccessURL = "/success";
  const onErrorURL = "/error";
  const mockPush = vi.fn();

  beforeEach(() => {
    // Type-safe mock
    (useRouter as unknown as Mock).mockReturnValue({ push: mockPush });
    (useSWR as unknown as Mock).mockClear();
    mockPush.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize SWR with correct parameters", () => {
    renderHook(() =>
      useLongPolling(endpoint, fetcher, onSuccessURL, onErrorURL)
    );

    expect(useSWR).toHaveBeenCalledWith(
      endpoint,
      fetcher,
      expect.objectContaining({
        refreshInterval: 5000,
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });

  it("should redirect to success URL on successful status", () => {
    renderHook(() =>
      useLongPolling(endpoint, fetcher, onSuccessURL, onErrorURL)
    );

    const swrConfig = (useSWR as unknown as Mock).mock.calls[0][2];
    swrConfig?.onSuccess?.({ status: "success" });

    expect(mockPush).toHaveBeenCalledWith(onSuccessURL);
  });

  it("should redirect to error URL and log on error", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const testError = new Error("Test error");

    renderHook(() =>
      useLongPolling(endpoint, fetcher, onSuccessURL, onErrorURL)
    );

    const swrConfig = (useSWR as unknown as Mock).mock.calls[0][2];
    swrConfig?.onError?.(testError);

    expect(mockPush).toHaveBeenCalledWith(onErrorURL);
    expect(consoleSpy).toHaveBeenCalledWith(testError);

    consoleSpy.mockRestore();
  });

  it("should not redirect on non-success status", () => {
    renderHook(() =>
      useLongPolling(endpoint, fetcher, onSuccessURL, onErrorURL)
    );

    const swrConfig = (useSWR as unknown as Mock).mock.calls[0][2];
    swrConfig?.onSuccess?.({ status: "processing" });

    expect(mockPush).not.toHaveBeenCalled();
  });
});
