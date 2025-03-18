/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from "next/navigation";
import useSWR from "swr";

export const useLongPolling = (
  sessionId: string,
  fetcher: any,
  onSuccessURL: string,
  onErrorURL: string
) => {
  const router = useRouter();

  useSWR(`/api?reference=${sessionId}`, fetcher, {
    refreshInterval: 5000,
    onSuccess: (data) => {
      if (data.status === "success") {
        router.push(onSuccessURL);
      }
    },
    onError: (err) => {
      console.log(err);
      router.push(onErrorURL);
    },
  });
};
