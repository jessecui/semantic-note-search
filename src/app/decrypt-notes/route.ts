import crypto from "crypto";

export async function POST(request: Request) {
  const algorithm = "aes-256-cbc";
  const key = Buffer.from(process.env.ENCRYPTION_KEY as string, "hex");
  const iv = Buffer.from(process.env.IV as string, "hex");

  const decrypt = (encryptedText: string) => {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  };

  const { notes } = await request.json();

  const decryptedItems = notes.map((item: { text: string; id: any }) => {
    return {
      id: item.id,
      text: decrypt(item.text),
    };
  });

  return Response.json(decryptedItems);
}
