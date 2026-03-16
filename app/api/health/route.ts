import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const healthHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "clashkeys-web",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: healthHeaders,
    }
  );
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: healthHeaders,
  });
}
