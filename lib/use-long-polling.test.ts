/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from "vitest";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { renderHook } from "@testing-library/react";
import { useLongPolling } from "./use-long-polling";
import { apiClient } from "./api-client";

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
    default: vi.fn(),
  };
});

// Mock ApiClient class
vi.mock("./api-client", () => {
  const mockGet = vi.fn();
  const MockApiClient = vi.fn(() => ({
    get: mockGet,
  }));

  return {
    ApiClient: MockApiClient,
    apiClient: {
      get: mockGet,
    },
  };
});

describe("useLongPolling", () => {
  const endpoint = `/api/payment-status`;
  const onSuccessURL = "/success";
  const onErrorURL = "/error";
  const params = { reference: "123" };
  const mockPush = vi.fn();

  const mockGet = vi.fn();
  let apiClientMock: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Set up mocks
    (useRouter as unknown as Mock).mockReturnValue({ push: mockPush });
    (useSWR as unknown as Mock).mockReturnValue({ data: null, error: null });

    // Get reference to the mock function from the mocked module
    apiClientMock = vi.mocked(apiClient);
    apiClientMock.get = mockGet;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize SWR with correct parameters", () => {
    renderHook(() =>
      useLongPolling<{ status: string }>(
        endpoint,
        onSuccessURL,
        onErrorURL,
        params
      )
    );

    // Check if useSWR was called with the correct key and options
    expect(useSWR).toHaveBeenCalledWith(
      [endpoint, params],
      expect.any(Function),
      expect.objectContaining({
        refreshInterval: 5000,
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });

  it("should call apiClient.get in the fetcher function", () => {
    renderHook(() =>
      useLongPolling<{ status: string }>(
        endpoint,
        onSuccessURL,
        onErrorURL,
        params
      )
    );

    // Get the fetcher function passed to useSWR
    const fetcher = (useSWR as unknown as Mock).mock.calls[0][1];

    // Execute the fetcher function
    fetcher();

    // Verify apiClient.get was called with correct parameters
    expect(mockGet).toHaveBeenCalledWith(endpoint, params);
  });

  it("should redirect to success URL on successful status", () => {
    renderHook(() =>
      useLongPolling<{ status: string }>(
        endpoint,
        onSuccessURL,
        onErrorURL,
        params
      )
    );

    const swrConfig = (useSWR as unknown as Mock).mock.calls[0][2];
    swrConfig?.onSuccess?.({ status: "success" });

    expect(mockPush).toHaveBeenCalledWith(onSuccessURL);
  });

  it("should redirect to error URL and log on error", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const testError = new Error("Test error");

    renderHook(() =>
      useLongPolling<{ status: string }>(
        endpoint,
        onSuccessURL,
        onErrorURL,
        params
      )
    );

    const swrConfig = (useSWR as unknown as Mock).mock.calls[0][2];
    swrConfig?.onError?.(testError);

    expect(mockPush).toHaveBeenCalledWith(onErrorURL);
    expect(consoleSpy).toHaveBeenCalledWith(testError);

    consoleSpy.mockRestore();
  });

  it("should not redirect on non-success status", () => {
    renderHook(() =>
      useLongPolling<{ status: string }>(
        endpoint,
        onSuccessURL,
        onErrorURL,
        params
      )
    );

    const swrConfig = (useSWR as unknown as Mock).mock.calls[0][2];
    swrConfig?.onSuccess?.({ status: "processing" });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should handle undefined params correctly", () => {
    renderHook(() =>
      useLongPolling<{ status: string }>(endpoint, onSuccessURL, onErrorURL)
    );

    // Check if useSWR was called with just the endpoint when no params
    expect(useSWR).toHaveBeenCalledWith(
      endpoint,
      expect.any(Function),
      expect.anything()
    );

    // Get the fetcher function
    const fetcher = (useSWR as unknown as Mock).mock.calls[0][1];

    // Execute the fetcher
    fetcher();

    // Check if apiClient.get was called without params
    expect(mockGet).toHaveBeenCalledWith(endpoint, undefined);
  });
});
