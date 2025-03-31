// This file contains helper functions that use the RLS bypass API route
// for operations that require admin privileges

/**
 * Saves a form using the admin API route to bypass RLS
 */
export async function saveFormAdmin(formData: any, userId: string) {
  try {
    console.log("Saving form with admin privileges, user ID:", userId)

    // Determine if this is an update or insert
    const operation = formData.id ? "update" : "insert"
    console.log(`${operation} operation detected for form:`, formData.id || "new form")

    // Save the form metadata
    const formResponse = await fetch("/api/supabase/rls-bypass", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: operation,
        table: "forms",
        data: {
          title: formData.title,
          description: formData.description || "",
          updated_at: new Date().toISOString(),
          status: formData.status || "draft",
          require_login: formData.requireLogin || false,
          share_id: formData.shareId || generateShareId(),
          ...(operation === "insert"
              ? {
                created_by: userId,
                created_by_username: formData.creatorUsername || "Anonymous User",
              }
              : {}),
        },
        ...(operation === "update"
            ? {
              filters: {
                eq: {
                  id: formData.id,
                },
              },
            }
            : {}),
      }),
    })

    if (!formResponse.ok) {
      const errorData = await formResponse.json()
      throw new Error(errorData.error || "Failed to save form")
    }

    const formResult = await formResponse.json()
    const form = formResult.data[0]

    console.log("Form metadata saved successfully:", form)

    // Then save all form elements
    if (formData.elements && formData.elements.length > 0) {
      // If updating, first delete existing elements
      if (formData.id) {
        const deleteResponse = await fetch("/api/supabase/rls-bypass", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operation: "delete",
            table: "form_elements",
            filters: {
              eq: {
                form_id: formData.id,
              },
            },
          }),
        })

        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json()
          console.error("Error deleting existing elements:", errorData.error)
        }
      }

      // Insert all elements
      const elementsResponse = await fetch("/api/supabase/rls-bypass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "insert",
          table: "form_elements",
          data: formData.elements.map((element: any, index: number) => ({
            form_id: form.id,
            element_id: element.id,
            type: element.type,
            label: element.label,
            required: element.required,
            properties: element.properties || {},
            conditions: element.conditions || [],
            order: index,
          })),
        }),
      })

      if (!elementsResponse.ok) {
        const errorData = await elementsResponse.json()
        console.error("Error saving form elements:", errorData.error)
      } else {
        console.log("Form elements saved successfully")
      }
    }

    return { success: true, formId: form.id, shareId: form.share_id }
  } catch (error) {
    console.error("Error saving form with admin privileges:", error)
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown error saving form"),
    }
  }
}

/**
 * Gets forms for a user using the admin API route to bypass RLS
 */
export async function getUserFormsAdmin(userId: string) {
  // Initialize countMap here
  const countMap: { [formId: string]: number } = {}

  try {
    console.log("Getting forms for user:", userId)

    const response = await fetch("/api/supabase/rls-bypass", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: "select",
        table: "forms",
        data: "*",
        filters: {
          eq: {
            created_by: userId,
          },
          order: {
            updated_at: "desc",
          },
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Error response from API:", errorData)
      throw new Error(errorData.error || "Failed to fetch forms")
    }

    const result = await response.json()
    console.log("Forms API response:", result)

    if (!result.data) {
      console.error("No data returned from forms API")
      return { success: true, forms: [] }
    }

    const forms = result.data
    console.log("Raw forms data:", forms)

    // Get response counts for each form
    const formIds = forms.map((form: any) => form.id)

    if (formIds.length > 0) {
      try {
        const countsResponse = await fetch("/api/supabase/rls-bypass", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operation: "select",
            table: "form_responses",
            filters: {
              in: {
                form_id: formIds,
              },
              groupBy: "form_id",
            },
          }),
        })

        if (countsResponse.ok) {
          const countsResult = await countsResponse.json()
          console.log("Response counts result:", countsResult)

          if (countsResult.data) {
            // Create a map of form_id to response count
            countsResult.data.forEach((item: any) => {
              countMap[item.form_id] = Number.parseInt(item.count)
            })
          }
        }
      } catch (error) {
        console.error("Error fetching response counts:", error)
      }
    }

    const mappedForms = forms.map((form: any) => ({
      id: form.id,
      title: form.title,
      description: form.description,
      createdAt: form.created_at,
      updatedAt: form.updated_at,
      status: form.status,
      requireLogin: form.require_login,
      shareId: form.share_id,
      responseCount: countMap[form.id] || 0,
    }))

    console.log("Mapped forms:", mappedForms)

    return {
      success: true,
      forms: mappedForms,
    }
  } catch (error) {
    console.error("Error getting user forms with admin privileges:", error)
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown error fetching forms"),
    }
  }
}

/**
 * Gets a form by ID using the admin API route to bypass RLS
 */
export async function getFormByIdAdmin(formId: string) {
  try {
    console.log("Getting form by ID:", formId)

    // Get form metadata
    const formResponse = await fetch("/api/supabase/rls-bypass", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: "select",
        table: "forms",
        data: "*",
        filters: {
          eq: {
            id: formId,
          },
        },
      }),
    })

    if (!formResponse.ok) {
      const errorData = await formResponse.json()
      console.error("Error response from form API:", errorData)
      throw new Error(errorData.error || "Failed to fetch form")
    }

    const formResult = await formResponse.json()
    console.log("Form API response:", formResult)

    if (!formResult.data || formResult.data.length === 0) {
      console.error("No form found with ID:", formId)
      throw new Error("Form not found")
    }

    const form = formResult.data[0]
    console.log("Form found:", form)

    // Get form elements
    const elementsResponse = await fetch("/api/supabase/rls-bypass", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: "select",
        table: "form_elements",
        data: "*",
        filters: {
          eq: {
            form_id: form.id,
          },
          order: {
            order: "asc",
          },
        },
      }),
    })

    if (!elementsResponse.ok) {
      const errorData = await elementsResponse.json()
      console.error("Error fetching form elements:", errorData)
      throw new Error(errorData.error || "Failed to fetch form elements")
    }

    const elementsResult = await elementsResponse.json()
    const elements = elementsResult.data || []
    console.log(`Found ${elements.length} form elements`)

    return {
      success: true,
      form: {
        ...form,
        elements: elements.map((element: any) => ({
          id: element.element_id,
          type: element.type,
          label: element.label,
          required: element.required,
          properties: element.properties,
          conditions: element.conditions,
        })),
      },
    }
  } catch (error) {
    console.error("Error getting form with admin privileges:", error)
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown error fetching form"),
    }
  }
}

/**
 * Gets a form by share ID using the admin API route to bypass RLS
 */
export async function getFormByShareIdAdmin(shareId: string) {
  try {
    console.log("Getting form by share ID:", shareId)

    // Get form metadata with creator info
    const formResponse = await fetch("/api/supabase/rls-bypass", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: "select",
        table: "forms",
        data: "*",
        filters: {
          eq: {
            share_id: shareId,
          },
        },
      }),
    })

    if (!formResponse.ok) {
      const errorData = await formResponse.json()
      console.error("Error response from form API:", errorData)
      throw new Error(errorData.error || "Failed to fetch form")
    }

    const formResult = await formResponse.json()
    console.log("Form API response:", formResult)

    if (!formResult.data || formResult.data.length === 0) {
      console.error("No form found with share ID:", shareId)
      throw new Error("Form not found")
    }

    const form = formResult.data[0]
    console.log("Form found:", form)

    // Get form elements
    const elementsResponse = await fetch("/api/supabase/rls-bypass", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: "select",
        table: "form_elements",
        data: "*",
        filters: {
          eq: {
            form_id: form.id,
          },
          order: {
            order: "asc",
          },
        },
      }),
    })

    if (!elementsResponse.ok) {
      const errorData = await elementsResponse.json()
      console.error("Error fetching form elements:", errorData)
      throw new Error(errorData.error || "Failed to fetch form elements")
    }

    const elementsResult = await elementsResponse.json()
    const elements = elementsResult.data || []
    console.log(`Found ${elements.length} form elements`)

    return {
      success: true,
      form: {
        ...form,
        elements: elements.map((element: any) => ({
          id: element.element_id,
          type: element.type,
          label: element.label,
          required: element.required,
          properties: element.properties,
          conditions: element.conditions,
        })),
      },
    }
  } catch (error) {
    console.error("Error getting form with admin privileges:", error)
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown error fetching form"),
    }
  }
}

/**
 * Saves a form response using the admin API route to bypass RLS
 */
export async function saveFormResponseAdmin(formId: string, responseData: any, userId?: string) {
  try {
    const response = await fetch("/api/supabase/rls-bypass", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: "insert",
        table: "form_responses",
        data: {
          form_id: formId,
          respondent_id: userId || null,
          data: responseData,
          created_at: new Date().toISOString(),
          status: "complete",
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to save form response")
    }

    const result = await response.json()
    return { success: true, responseId: result.data[0].id }
  } catch (error) {
    console.error("Error saving form response with admin privileges:", error)
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown error saving form response"),
    }
  }
}

/**
 * Gets form responses using the admin API route to bypass RLS
 */
export async function getFormResponsesAdmin(formId: string) {
  try {
    console.log("Getting responses for form ID:", formId)

    const response = await fetch("/api/supabase/rls-bypass", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: "select",
        table: "form_responses",
        data: "*",
        filters: {
          eq: {
            form_id: formId,
          },
          order: {
            created_at: "desc",
          },
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Error response from API:", errorData)
      throw new Error(errorData.error || "Failed to fetch form responses")
    }

    const result = await response.json()
    console.log("Form responses API response:", result)

    if (!result.data) {
      console.error("No data returned from form responses API")
      return { success: true, responses: [] }
    }

    return {
      success: true,
      responses: result.data,
    }
  } catch (error) {
    console.error("Error getting form responses with admin privileges:", error)
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown error fetching form responses"),
    }
  }
}

// Add this new function to get recent responses for the dashboard

/**
 * Gets recent responses for a user using the admin API route to bypass RLS
 */
export async function getRecentResponsesAdmin(userId: string) {
  try {
    console.log("Getting recent responses for user:", userId)

    // First get the user's forms
    const formsResponse = await fetch("/api/supabase/rls-bypass", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: "select",
        table: "forms",
        data: "id, title",
        filters: {
          eq: {
            created_by: userId,
          },
        },
      }),
    })

    if (!formsResponse.ok) {
      const errorData = await formsResponse.json()
      console.error("Error response from forms API:", errorData)
      throw new Error(errorData.error || "Failed to fetch user forms")
    }

    const formsResult = await formsResponse.json()

    if (!formsResult.data || formsResult.data.length === 0) {
      return { success: true, responses: [] }
    }

    const formIds = formsResult.data.map((form: any) => form.id)
    const formTitlesMap: { [key: string]: string } = {}
    formsResult.data.forEach((form: any) => {
      formTitlesMap[form.id] = form.title
    })

    // Then get recent responses for those forms
    const responsesResponse = await fetch("/api/supabase/rls-bypass", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: "select",
        table: "form_responses",
        data: "*",
        filters: {
          in: {
            form_id: formIds,
          },
          order: {
            created_at: "desc",
          },
          limit: 10,
        },
      }),
    })

    if (!responsesResponse.ok) {
      const errorData = await responsesResponse.json()
      console.error("Error response from responses API:", errorData)
      throw new Error(errorData.error || "Failed to fetch form responses")
    }

    const responsesResult = await responsesResponse.json()

    if (!responsesResult.data) {
      return { success: true, responses: [] }
    }

    // Generate mock user profiles for respondent_ids
    const respondentIds = responsesResult.data.filter((r: any) => r.respondent_id).map((r: any) => r.respondent_id)

    const userProfiles: { [key: string]: any } = {}

    if (respondentIds.length > 0) {
      // Simulate fetching user profiles
      respondentIds.forEach((userId: string) => {
        // Generate consistent mock data based on the userId
        const hash = Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const names = ["Alex", "Jamie", "Taylor", "Jordan", "Casey", "Riley", "Morgan"]
        const name = names[hash % names.length]

        userProfiles[userId] = {
          username: `${name}${userId.substring(0, 4)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        }
      })
    }

    // Add form titles and user profiles to responses
    const enhancedResponses = responsesResult.data.map((response: any) => ({
      ...response,
      formTitle: formTitlesMap[response.form_id] || "Untitled Form",
      userProfile: response.respondent_id ? userProfiles[response.respondent_id] : null,
    }))

    return {
      success: true,
      responses: enhancedResponses,
    }
  } catch (error) {
    console.error("Error getting recent responses with admin privileges:", error)
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown error fetching recent responses"),
    }
  }
}

function generateShareId() {
  return Math.random().toString(36).substring(2, 10)
}

