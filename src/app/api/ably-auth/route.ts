import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

function createAblyJwt(
  clientId: string,
  displayName: string | null,
  apiKey: string,
): string {
  const [keyId, keySecret] = apiKey.split(":");

  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT", kid: keyId }),
  ).toString("base64url");

  const now = Math.floor(Date.now() / 1000);
  const claims: Record<string, unknown> = {
    "x-ably-capability": JSON.stringify({
      "[chat]*": ["*"],
      "online-status": ["presence", "subscribe"],
    }),
    "x-ably-clientId": clientId,
    iat: now,
    exp: now + 3600,
  };

  if (displayName) {
    claims["ably.room.*"] = JSON.stringify({ display_name: displayName });
  }

  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", keySecret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

export async function GET(request: NextRequest) {
  if (!process.env.ABLY_API_KEY) {
    return NextResponse.json(
      { error: "Missing ABLY_API_KEY environment variable." },
      { status: 500 },
    );
  }

  const clientId =
    request.nextUrl.searchParams.get("clientId") ?? "NO_CLIENT_ID_PROVIDED";
  const displayName = request.nextUrl.searchParams.get("displayName");

  const jwt = createAblyJwt(clientId, displayName, process.env.ABLY_API_KEY);

  return new NextResponse(jwt, {
    headers: { "Content-Type": "application/jwt" },
  });
}
