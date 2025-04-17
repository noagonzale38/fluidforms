import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

// This is a server-side route that will execute SQL queries directly
export async function POST(req: NextRequest) {
    try {
        // Get the query from the request body
        const body = await req.json()
        const { query } = body

        // Verify required environment variables
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error("Missing required Supabase environment variables")
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
        }

        // Create a Supabase client with the service role key (admin privileges)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
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

        // Execute the query using the execute_sql RPC function
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
