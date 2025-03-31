import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  // Get the origin from the request URL
  const origin = req.headers.get("host") || "localhost:3000"
  const protocol = origin.includes("localhost") ? "http" : "https"

  // Create the redirect URL using the same origin as the request
  const url = new URL("/auth/callback", `${protocol}://${origin}`)

  // Copy all query parameters
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value)
  })

  console.log("API route redirecting to:", url.toString())
  return NextResponse.redirect(url)
}

