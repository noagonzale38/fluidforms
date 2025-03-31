import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

// This is a server-side route that will use service_role key to bypass RLS
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { operation, table, data, filters } = body

    // Create a Supabase client with the service role key (admin privileges)
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.SUPABASE_SERVICE_ROLE_KEY || "",
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
          // Add global headers to fix 406 errors
          global: {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        },
    )

    console.log(`RLS Bypass: ${operation} on ${table}`, {
      dataPreview: typeof data === "object" ? "(object)" : data,
      filters: filters ? JSON.stringify(filters) : "none",
    })

    let result

    switch (operation) {
      case "select":
        let query = supabaseAdmin.from(table).select(data || "*")

        // Apply filters if provided
        if (filters) {
          if (filters.eq) {
            Object.entries(filters.eq).forEach(([column, value]) => {
              console.log(`Adding eq filter: ${column} = ${value}`)
              query = query.eq(column, value)
            })
          }
          if (filters.in) {
            Object.entries(filters.in).forEach(([column, values]) => {
              console.log(`Adding in filter: ${column} in [${values}]`)
              query = query.in(column, values)
            })
          }
          if (filters.order) {
            Object.entries(filters.order).forEach(([column, direction]) => {
              console.log(`Adding order: ${column} ${direction}`)
              query = query.order(column, { ascending: direction === "asc" })
            })
          }
          if (filters.limit) {
            console.log(`Adding limit: ${filters.limit}`)
            query = query.limit(filters.limit)
          }
          if (filters.groupBy) {
            // For count queries with group by
            console.log(`Adding group by: ${filters.groupBy}`)
            query = supabaseAdmin
                .from(table)
                .select(filters.groupBy + ", count(*)", { count: "exact" })
                .groupBy(filters.groupBy)
          }
        }

        result = await query
        break

      case "insert":
        result = await supabaseAdmin.from(table).insert(data).select()
        break

      case "update":
        if (!filters || !filters.eq) {
          return NextResponse.json({ error: "Update requires filters.eq" }, { status: 400 })
        }

        let updateQuery = supabaseAdmin.from(table).update(data)

        // Apply equality filters
        Object.entries(filters.eq).forEach(([column, value]) => {
          updateQuery = updateQuery.eq(column, value)
        })

        // Return the updated record
        result = await updateQuery.select()

        // If no data was returned but the update was successful, fetch the record
        if (result.error === null && (!result.data || result.data.length === 0)) {
          const idField = Object.keys(filters.eq)[0] // Usually 'id'
          const idValue = filters.eq[idField]

          console.log(`Update successful but no data returned. Fetching record with ${idField}=${idValue}`)

          const fetchResult = await supabaseAdmin.from(table).select("*").eq(idField, idValue).single()

          if (fetchResult.error === null) {
            result.data = [fetchResult.data]
          }
        }
        break

      case "delete":
        if (!filters || !filters.eq) {
          return NextResponse.json({ error: "Delete requires filters.eq" }, { status: 400 })
        }

        let deleteQuery = supabaseAdmin.from(table).delete()

        // Apply equality filters
        Object.entries(filters.eq).forEach(([column, value]) => {
          deleteQuery = deleteQuery.eq(column, value)
        })

        result = await deleteQuery
        break

      default:
        return NextResponse.json({ error: "Invalid operation" }, { status: 400 })
    }

    if (result.error) {
      console.error(`Error in RLS bypass (${operation} on ${table}):`, result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    console.log(`RLS Bypass success: ${operation} on ${table}`, {
      dataCount: result.data ? result.data.length : 0,
    })

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error("Error in RLS bypass:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

