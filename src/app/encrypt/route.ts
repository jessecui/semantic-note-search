import crypto from "crypto";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("text") as string;
  const algorithm = "aes-256-cbc";
  const key = Buffer.from(process.env.ENCRYPTION_KEY as string, "hex");
  const iv = Buffer.from(process.env.IV as string, "hex");

  const encrypt = (text: string) => {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted = encrypted += cipher.final("hex");;
    return encrypted;
  };

  if (!text) {
    Response.json({ error: "Missing text parameter" }, { status: 400 });
  }

  const encryption = encrypt(text);
  return Response.json({ encryption });
}
