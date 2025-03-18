/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from "next/navigation";
import useSWR from "swr";

export const useLongPolling = (
  endpoint: string,
  fetcher: any,
  onSuccessURL: string,
  onErrorURL: string
) => {
  const router = useRouter();

  useSWR(endpoint, fetcher, {
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
