import { NextRequest, NextResponse } from "next/server";
import cors from "../../../../utils/cors"
import { getUserByEmail, createUser } from "../../../../services/database/userService";
import bcrypt from "bcryptjs";

export async function OPTIONS(req: NextRequest) {
  return cors(req);
}

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, password } = await req.json();

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: "Missing full_name, email, or password" }, { status: 400 });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    await createUser(full_name, email, hash);

    const res = NextResponse.json({ message: "User registered successfully" }, { status: 201 });
    res.headers.set("Access-Control-Allow-Origin", "*");
    return res;
  } catch (e) {
    const res = NextResponse.json({ error: "Internal server error" }, { status: 500 });
    res.headers.set("Access-Control-Allow-Origin", "*");
    return res;
  }
}