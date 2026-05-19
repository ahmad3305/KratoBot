import { NextRequest, NextResponse } from "next/server";
import cors, { withCors } from "../../../../utils/cors";
import { getUserByEmail } from "../../../../services/database/userService";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret";

export const OPTIONS = cors;

export const POST = withCors(async function (req: NextRequest) {
  try {
    const body = await req.json();
    console.log("LOGIN REQUEST BODY:", body);

    const { email, password } = body;

    if (!email || !password) {
      console.log("LOGIN ERROR: missing fields");
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    console.log("USER FOUND:", !!user);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    console.log("PASSWORD VALID:", valid);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("LOGIN SUCCESS TOKEN GENERATED");

    return NextResponse.json(
      { message: "Login successful", token },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("LOGIN CRASH ERROR:", e);

    return NextResponse.json(
      { error: e.message || "Internal server error" },
      { status: 500 }
    );
  }
});