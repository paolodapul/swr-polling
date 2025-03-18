import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useEffect, useRef } from "react";
import { apiClient } from "./api-client";

interface WithStatus {
  status: string;
}

export const useLongPolling = <T extends WithStatus>(
  endpoint: string,
  onSuccessURL: string,
  onErrorURL: string,
  params?: Record<string, string>,
  timeoutMs: number = 180000 // Default timeout of 3 minutes
) => {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetcher = () => apiClient.get<T>(endpoint, params);

  const { data, error, mutate } = useSWR(
    params ? [endpoint, params] : endpoint,
    fetcher,
    {
      refreshInterval: 5000,
      onSuccess: (data) => {
        if (data.status === "success") {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          router.push(onSuccessURL);
        }
      },
      onError: (err) => {
        console.log(err);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        router.push(onErrorURL);
      },
    }
  );

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      mutate();
      router.push(onErrorURL);
    }, timeoutMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [endpoint, onErrorURL, router, timeoutMs, mutate]);

  return { data, error };
};
