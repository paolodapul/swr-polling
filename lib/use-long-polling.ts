import { useRouter } from "next/navigation";
import useSWR from "swr";
import { apiClient } from "./api-client";

interface WithStatus {
  status: string;
}

export const useLongPolling = <T extends WithStatus>(
  endpoint: string,
  onSuccessURL: string,
  onErrorURL: string,
  params?: Record<string, string>
) => {
  const router = useRouter();
  const fetcher = () => apiClient.get<T>(endpoint, params);

  const { data, error } = useSWR(
    params ? [endpoint, params] : endpoint,
    fetcher,
    {
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
    }
  );

  return { data, error };
};
