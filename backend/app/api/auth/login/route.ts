import { NextRequest, NextResponse } from "next/server";
import cors from "../../../../utils/cors";
import { getUserByEmail } from "../../../../services/database/userService";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret";

export async function OPTIONS(req: NextRequest) {
  return cors(req);
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const res = NextResponse.json({ message: "Login successful", token }, { status: 200 });
    res.headers.set("Access-Control-Allow-Origin", "*");
    return res;
  } catch {
    const res = NextResponse.json({ error: "Internal server error" }, { status: 500 });
    res.headers.set("Access-Control-Allow-Origin", "*");
    return res;
  }
}