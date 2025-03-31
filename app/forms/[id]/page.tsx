"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import Navbar  from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import { FormElementPreview } from "@/components/form-element-preview"
import type { Form } from "@/types/form"
import { getFormByIdAdmin } from "@/lib/supabase-admin"
import { useToast } from "@/hooks/use-toast"
import { use } from "react"

export default function ViewForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params) // Properly unwrap the params Promise
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState<Form | null>(null)
  const [isFormLoading, setIsFormLoading] = useState(true)

  useEffect(() => {
    async function loadForm() {
      if (!id) return

      setIsFormLoading(true)
      try {
        console.log("Loading form with ID:", id)
        const result = await getFormByIdAdmin(id)

        if (result.success && result.form) {
          console.log("Form loaded successfully:", result.form)
          setForm(result.form)
        } else {
          console.error("Error loading form:", result.error)
          toast({
            title: "Error",
            description: "Failed to load form data",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching form:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading the form",
          variant: "destructive",
        })
      } finally {
        setIsFormLoading(false)
      }
    }

    if (!isLoading && user) {
      loadForm()
    }
  }, [id, user, isLoading, toast])

  const copyShareLink = () => {
    if (!form) return

    const shareUrl = `${window.location.origin}/forms/s/${form.share_id}`
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Share link copied",
      description: "The form share link has been copied to your clipboard.",
    })
  }

  if (isLoading || isFormLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
    )
  }

  if (!user) {
    return (
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 container py-8">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground mb-6">Please log in to view this form.</p>
              <Link href="/">
                <Button className="rounded-full">Back to Home</Button>
              </Link>
            </div>
          </main>
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
              <p className="text-muted-foreground mb-6">
                The form you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Link href="/dashboard">
                <Button className="rounded-full">Back to Dashboard</Button>
              </Link>
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
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">{form.title}</h1>
            </div>
            <Button className="rounded-full" onClick={copyShareLink}>
              <Share2 className="mr-2 h-4 w-4" /> Share Form
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{form.title}</CardTitle>
                  {form.description && <CardDescription>{form.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <form className="space-y-8">
                    {form.elements.map((element) => (
                        <div key={element.id} className="form-element">
                          <FormElementPreview element={element} />
                        </div>
                    ))}

                    <div className="flex justify-end">
                      <Button type="submit" className="rounded-full">
                        Submit
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
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                        <p>{new Date(form.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
                        <p>{user.username || "You"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                        <p>{new Date(form.updated_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Questions</h3>
                        <p>{form.elements.length}</p>
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

