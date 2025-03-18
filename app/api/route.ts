import { NextResponse } from "next/server";

const paymentStatusStore = new Map();

// Changed to 15 seconds
const TOTAL_DURATION_MS = 15 * 1000; // 15 seconds
const CHECKPOINTS = 3;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const now = Date.now();
  let startTime = paymentStatusStore.get(reference);

  if (!startTime) {
    startTime = now;
    paymentStatusStore.set(reference, startTime);
  }

  const elapsed = now - startTime;

  const checkpointInterval = TOTAL_DURATION_MS / CHECKPOINTS;
  let status: "pending" | "success" = "pending";

  if (elapsed >= TOTAL_DURATION_MS) {
    status = "success";
  }

  return NextResponse.json({
    reference,
    status,
    elapsedSeconds: Math.floor(elapsed / 1000),
    nextCheckpointInSeconds: Math.ceil(
      (checkpointInterval - (elapsed % checkpointInterval)) / 1000
    ),
  });
}
