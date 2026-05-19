import { NextRequest, NextResponse } from "next/server";
import cors, { withCors } from "../../../../utils/cors";
import {
  getUserByEmail,
  createUser,
} from "../../../../services/database/userService";
import bcrypt from "bcryptjs";

export const OPTIONS = cors;

export const POST = withCors(async function (req: NextRequest) {
  try {
    const body = await req.json();
    console.log("REGISTER REQUEST BODY:", body);

    const { full_name, email, password } = body;

    if (!email || !password || !full_name) {
      console.log("REGISTER ERROR: missing fields");
      return NextResponse.json(
        { error: "Missing full_name, email, or password" },
        { status: 400 }
      );
    }

    const existing = await getUserByEmail(email);
    console.log("EXISTING USER CHECK:", existing);

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(password, 10);
    console.log("PASSWORD HASH CREATED");

    await createUser(full_name, email, hash);
    console.log("USER CREATED SUCCESSFULLY");

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("REGISTER CRASH ERROR:", e);

    return NextResponse.json(
      { error: e.message || "Internal server error" },
      { status: 500 }
    );
  }
});