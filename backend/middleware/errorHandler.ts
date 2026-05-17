import { NextRequest, NextResponse } from "next/server";


export function handleError(error: any) {
  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }
  return NextResponse.json(
    { success: false, message: "Internal Server Error", error: error?.message },
    { status: 500 }
  );
}