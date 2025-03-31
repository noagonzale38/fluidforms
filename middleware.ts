import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    // Only apply to developer API routes
    if (request.nextUrl.pathname.startsWith("/api/supabase/developer")) {
        // Get the token from the cookie or localStorage (client-side will handle this)
        const token = request.cookies.get("discord_token")?.value

        // Clone the request headers
        const requestHeaders = new Headers(request.headers)

        // Add the Authorization header if token exists
        if (token) {
            requestHeaders.set("Authorization", `Bearer ${token}`)
        }

        // Return the response with the modified headers
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
    }

    return NextResponse.next()
}

export const config = {
    matcher: "/api/supabase/developer/:path*",
}

