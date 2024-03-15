import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");
  const password = request.nextUrl.searchParams.get("password");

  return NextResponse.json({
    verified:
      username == process.env.VALID_USERNAME &&
      password == process.env.VALID_PASSWORD,
  });
}
