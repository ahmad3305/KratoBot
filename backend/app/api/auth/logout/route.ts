import { NextRequest, NextResponse } from "next/server";
import cors from "../../../../utils/cors";

export async function OPTIONS(req: NextRequest) {
  return cors(req);
}

export async function POST(req: NextRequest) {

  const res = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
  res.headers.set("Access-Control-Allow-Origin", "*");
  return res;
}