import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Function to bypass RLS for Discord-authenticated users
// This is needed because we're using Discord OAuth instead of Supabase Auth
export async function bypassRLS() {
  try {
    // Call a Supabase function or stored procedure that bypasses RLS
    // This is a placeholder - you'll need to create this function in Supabase
    await supabase.rpc("bypass_rls")
    return true
  } catch (error) {
    console.error("Failed to bypass RLS:", error)
    return false
  }
}

export async function saveForm(formData: any, userId: string) {
  try {
    console.log("Saving form with user ID:", userId)

    // First save the form metadata
    const { data: form, error: formError } = await supabase
      .from("forms")
      .upsert({
        id: formData.id || undefined,
        title: formData.title,
        description: formData.description || "",
        created_by: userId,
        updated_at: new Date().toISOString(),
        status: formData.status || "draft",
        require_login: formData.requireLogin || false,
        share_id: formData.shareId || generateShareId(),
      })
      .select()
      .single()

    if (formError) {
      console.error("Error saving form metadata:", formError)
      throw formError
    }

    console.log("Form metadata saved successfully:", form)

    // Then save all form elements
    if (formData.elements && formData.elements.length > 0) {
      // If updating, first delete existing elements
      if (formData.id) {
        const { error: deleteError } = await supabase.from("form_elements").delete().eq("form_id", formData.id)

        if (deleteError) {
          console.error("Error deleting existing elements:", deleteError)
          throw deleteError
        }
      }

      // Insert all elements
      const { error: elementsError } = await supabase.from("form_elements").insert(
        formData.elements.map((element: any, index: number) => ({
          form_id: form.id,
          element_id: element.id,
          type: element.type,
          label: element.label,
          required: element.required,
          properties: element.properties || {},
          conditions: element.conditions || [],
          order: index,
        })),
      )

      if (elementsError) {
        console.error("Error saving form elements:", elementsError)
        throw elementsError
      }

      console.log("Form elements saved successfully")
    }

    return { success: true, formId: form.id, shareId: form.share_id }
  } catch (error) {
    console.error("Error saving form:", error)
    return { success: false, error }
  }
}

export async function getFormById(formId: string) {
  try {
    const { data: form, error } = await supabase.from("forms").select("*").eq("id", formId).single()

    if (error) {
      console.error("Error fetching form:", error)
      return { success: false, error }
    }

    return { success: true, form }
  } catch (error) {
    console.error("Error fetching form:", error)
    return { success: false, error }
  }
}

export async function getFormByShareId(shareId: string) {
  try {
    const { data: form, error } = await supabase.from("forms").select("*").eq("share_id", shareId).single()

    if (error) {
      console.error("Error fetching form:", error)
      return { success: false, error }
    }

    return { success: true, form }
  } catch (error) {
    console.error("Error fetching form:", error)
    return { success: false, error }
  }
}

export async function getUserForms(userId: string) {
  try {
    const { data: forms, error } = await supabase
      .from("forms")
      .select(`*, responseCount:form_responses(count)`)
      .eq("created_by", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user forms:", error)
      return { success: false, error }
    }

    return { success: true, forms }
  } catch (error) {
    console.error("Error fetching user forms:", error)
    return { success: false, error }
  }
}

export async function saveFormResponse(formId: string, data: any, respondentId?: string) {
  try {
    const { data: response, error } = await supabase
      .from("form_responses")
      .insert({
        form_id: formId,
        respondent_id: respondentId || null,
        data: data,
        status: "complete",
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving form response:", error)
      return { success: false, error }
    }

    return { success: true, response }
  } catch (error) {
    console.error("Error saving form response:", error)
    return { success: false, error }
  }
}

export async function getFormResponses(formId: string) {
  try {
    const { data: responses, error } = await supabase.from("form_responses").select("*").eq("form_id", formId)

    if (error) {
      console.error("Error fetching form responses:", error)
      return { success: false, error }
    }

    return { success: true, responses }
  } catch (error) {
    console.error("Error fetching form responses:", error)
    return { success: false, error }
  }
}

function generateShareId() {
  return Math.random().toString(36).substring(2, 10)
}

