import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { isDeveloper } from "@/lib/auth-utils"

// This is a server-side route that will execute SQL queries directly
export async function POST(req: NextRequest) {
    try {
        // Get the query from the request body
        const body = await req.json()
        const { query } = body

        // Get the user's token from the request
        const token = req.headers.get("authorization")?.split("Bearer ")[1]

        if (!token) {
            return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 })
        }

        // Verify the user is a developer
        try {
            // Fetch user info from Discord
            const userResponse = await fetch("https://discord.com/api/users/@me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!userResponse.ok) {
                return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 })
            }

            const userData = await userResponse.json()

            if (!isDeveloper(userData.id)) {
                return NextResponse.json({ error: "Forbidden: Developer access required" }, { status: 403 })
            }
        } catch (error) {
            return NextResponse.json({ error: "Error verifying developer status" }, { status: 500 })
        }

        // Create a Supabase client with the service role key (admin privileges)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "",
            process.env.SUPABASE_SERVICE_ROLE_KEY || "",
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
                global: {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                },
            },
        )

        // Execute the query
        const { data, error } = await supabaseAdmin.rpc("execute_sql", { query_text: query })

        if (error) {
            console.error("Error executing SQL query:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error("Error in developer query:", error)
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
    }
}

