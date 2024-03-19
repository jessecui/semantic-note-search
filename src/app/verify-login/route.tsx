import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const password = request.nextUrl.searchParams.get("password");

  return NextResponse.json({
    verified: password == process.env.PASSWORD,
  });
}
