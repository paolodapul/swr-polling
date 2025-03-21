"use client";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useLongPolling } from "@/lib/use-long-polling";

type PaymentStatus = {
  reference: string;
  status: string;
  elapsedSeconds: number;
  nextCheckpointInSeconds: number;
};

export default function Home() {
  const { sessionId } = useParams();
  useLongPolling<PaymentStatus>(
    `/generate-payment-code`,
    "/payment-code",
    "/error",
    { reference: sessionId as string }
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-md">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">
          Please do not close, refresh or exit this page
        </h1>
        <p className="text-muted-foreground">
          Your request is being processed. This may take a few moments.
        </p>
      </div>
    </div>
  );
}
