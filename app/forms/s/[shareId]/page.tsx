"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import  Navbar  from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { FormElementPreview } from "@/components/form-element-preview"
import { getFormByShareIdAdmin, saveFormResponseAdmin } from "@/lib/supabase-admin"
import { useToast } from "@/hooks/use-toast"
import { use } from "react"

export default function SharedForm({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = use(params) // Properly unwrap the params Promise
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [form, setForm] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})

  useEffect(() => {
    async function loadForm() {
      console.log("Loading form with shareId:", shareId)
      setIsLoading(true)
      const result = await getFormByShareIdAdmin(shareId)
      setIsLoading(false)

      if (result.success) {
        console.log("Form loaded successfully:", result.form)
        setForm(result.form)

        // Check if login is required
        if (result.form.require_login && !user && !authLoading) {
          toast({
            title: "Login Required",
            description: "You need to log in to access this form.",
            variant: "destructive",
          })
          router.push("/")
        }
      } else {
        console.error("Error loading form:", result.error)
        toast({
          title: "Form Not Found",
          description: "The form you're looking for doesn't exist or has been removed.",
          variant: "destructive",
        })
        router.push("/")
      }
    }

    if (!authLoading) {
      loadForm()
    }
  }, [shareId, router, toast, user, authLoading])

  const handleInputChange = (elementId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [elementId]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const missingRequired = form.elements
        .filter((element: any) => element.required)
        .some((element: any) => !formData[element.id])

    if (missingRequired) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    const result = await saveFormResponseAdmin(form.id, formData, user?.id)

    setIsSubmitting(false)

    if (result.success) {
      toast({
        title: "Form Submitted",
        description: "Your response has been recorded. Thank you!",
      })

      // Clear form data
      setFormData({})

      // Redirect to a thank you page or back to the form
      router.push(`/forms/s/${shareId}/thank-you`)
    } else {
      toast({
        title: "Submission Error",
        description: "There was a problem submitting your response. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading || authLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
    )
  }

  if (!form) {
    return (
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 container py-8">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h2 className="text-2xl font-bold mb-2">Form Not Found</h2>
              <p className="text-muted-foreground mb-6">The form you're looking for doesn't exist or has been removed.</p>
              <Link href="/">
                <Button className="rounded-full">Back to Home</Button>
              </Link>
            </div>
          </main>
        </div>
    )
  }

  // If login is required and user is not logged in
  if (form.require_login && !user) {
    return (
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 container py-8">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h2 className="text-2xl font-bold mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-6">You need to log in to access this form.</p>
              <Button onClick={() => router.push("/")} className="rounded-full">
                Go to Login
              </Button>
            </div>
          </main>
        </div>
    )
  }

  return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">{form.title}</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{form.title}</CardTitle>
                  {form.description && <CardDescription>{form.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {form.elements.map((element: any) => (
                        <div key={element.id} className="form-element">
                          <FormElementPreview
                              element={element}
                              value={formData[element.id]}
                              onChange={(value) => handleInputChange(element.id, value)}
                          />
                        </div>
                    ))}

                    <div className="flex justify-end">
                      <Button type="submit" className="rounded-full text-base px-6 py-2 h-auto" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent mr-2"></div>
                              Submitting...
                            </>
                        ) : (
                            "Submit"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <div className="sticky top-24">
                <Card>
                  <CardHeader>
                    <CardTitle>Form Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                        <p className="capitalize">{form.status}</p>
                      </div>
                      {form.require_login && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Authentication</h3>
                            <p>Login required to submit</p>
                          </div>
                      )}
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
                        <p>{form.created_by_username || "Form Creator"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
  )
}

