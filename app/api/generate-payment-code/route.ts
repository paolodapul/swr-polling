import { NextResponse } from "next/server";

const paymentStatusStore = new Map();
const TOTAL_DURATION_MS = 10 * 1000;

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
  const forceError = false;

  if (elapsed >= TOTAL_DURATION_MS) {
    if (forceError) {
      return NextResponse.json(
        {
          reference,
          status: "error",
          elapsedSeconds: Math.floor(elapsed / 1000),
        },
        { status: 500 }
      );
    } else {
      return NextResponse.json({
        reference,
        status: "success",
        elapsedSeconds: Math.floor(elapsed / 1000),
      });
    }
  }

  return NextResponse.json({
    reference,
    status: "pending",
    elapsedSeconds: Math.floor(elapsed / 1000),
  });
}
