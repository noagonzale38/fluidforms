import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI

export async function POST(req: NextRequest) {
  try {
    console.log("Token exchange request received")

    // Check environment variables
    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URI) {
      console.error("Missing Discord environment variables:", {
        hasClientId: !!DISCORD_CLIENT_ID,
        hasClientSecret: !!DISCORD_CLIENT_SECRET,
        hasRedirectUri: !!DISCORD_REDIRECT_URI,
      })
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Get the code from the body
    const body = await req.json().catch((err) => {
      console.error("Error parsing request body:", err)
      return null
    })

    if (!body) {
      console.error("Invalid request body")
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { code, redirectUri } = body

    if (!code) {
      console.error("No code provided in request body")
      return NextResponse.json({ error: "No code provided" }, { status: 400 })
    }

    console.log("Exchanging code for access token...")

    // Use the provided redirectUri if available, otherwise fall back to the environment variable
    const finalRedirectUri = DISCORD_REDIRECT_URI

    // Exchange code for access token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: finalRedirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error("Error exchanging code for access token:", errorText, tokenResponse.status)
      return NextResponse.json(
          { error: "Failed to exchange code", details: errorText },
          { status: tokenResponse.status },
      )
    }

    const data = await tokenResponse.json()
    console.log("Token exchange successful")

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error processing token exchange:", error)
    return NextResponse.json(
        { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
        { status: 500 },
    )
  }
}