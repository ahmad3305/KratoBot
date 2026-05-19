// utils/cors.ts

import { NextRequest, NextResponse } from "next/server";

// Use your real frontend URL instead of * for production and with credentials
const ALLOWED_ORIGIN = process.env.FRONTEND_ORIGIN || "https://krato-bot.vercel.app";

// Use this as a wrapper for all handler responses
export function withCors(handler: (req: NextRequest) => Promise<NextResponse> | NextResponse) {
  return async function(req: NextRequest) {
    const res = await handler(req);
    // Dynamically reflect request origin if you want
    const origin = req.headers.get('origin') || ALLOWED_ORIGIN;
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.headers.set("Vary", "Origin"); // good practice for proxies/CDNs
    return res;
  };
}

// Still export your OPTIONS function (used for preflight)
export default function cors(req: NextRequest) {
  const origin = req.headers.get("origin") || ALLOWED_ORIGIN;
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    },
  });
}
