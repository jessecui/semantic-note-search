import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const verified =
    request.nextUrl.searchParams.get("password") == process.env.PASSWORD;

  let supabaseCredentials = {};
  if (verified) {
    supabaseCredentials = {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    };
  }

  return NextResponse.json({
    verified,
    supabaseCredentials,
  });
}
