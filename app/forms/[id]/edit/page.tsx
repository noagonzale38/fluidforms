"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import  Navbar  from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { FormBuilder } from "@/components/form-builder"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getFormByIdAdmin, saveFormAdmin } from "@/lib/supabase-admin"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { use } from "react"

export default function EditForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formElements, setFormElements] = useState([])
  const [requireLogin, setRequireLogin] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading2, setIsLoading2] = useState(true)
  const [shareId, setShareId] = useState("")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    async function loadForm() {
      if (!id || !user) return

      setIsLoading2(true)
      try {
        console.log("Loading form for editing, ID:", id)
        const result = await getFormByIdAdmin(id)

        if (result.success && result.form) {
          console.log("Form loaded successfully for editing:", result.form)
          setFormTitle(result.form.title)
          setFormDescription(result.form.description || "")
          setFormElements(result.form.elements || [])
          setRequireLogin(result.form.require_login || false)
          setShareId(result.form.share_id || "")
        } else {
          console.error("Error loading form for editing:", result.error)
          toast({
            title: "Error",
            description: "Failed to load form data for editing",
            variant: "destructive",
          })
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error fetching form for editing:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading the form",
          variant: "destructive",
        })
        router.push("/dashboard")
      } finally {
        setIsLoading2(false)
      }
    }

    if (!isLoading && user) {
      loadForm()
    }
  }, [id, user, isLoading, toast, router])

  const handleSave = async () => {
    if (!formTitle.trim()) {
      toast({
        title: "Form title required",
        description: "Please enter a title for your form",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    const formData = {
      id: id,
      title: formTitle,
      description: formDescription,
      elements: formElements,
      status: "active",
      requireLogin,
      shareId: shareId,
      creatorUsername: user?.username || "Anonymous User",
    }

    console.log("Saving edited form with data:", {
      title: formData.title,
      elementsCount: formData.elements.length,
      userId: user?.id,
    })

    try {
      const result = await saveFormAdmin(formData, user.id)

      setIsSaving(false)

      if (result.success) {
        toast({
          title: "Form saved",
          description: "Your form has been updated successfully",
        })

        router.push("/dashboard")
      } else {
        console.error("Error from saveFormAdmin:", result.error)
        toast({
          title: "Error saving form",
          description: result.error?.message || "There was a problem saving your form. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Unexpected error saving form:", error)
      setIsSaving(false)

      toast({
        title: "Error saving form",
        description: error instanceof Error ? error.message : "There was a problem saving your form. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading || isLoading2) {
    return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
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
              <p className="text-muted-foreground mb-6">Please log in to edit this form.</p>
              <Link href="/">
                <Button className="rounded-full">Back to Home</Button>
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
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Edit Form</h1>
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="rounded-full text-base px-6 py-2 h-auto">
              {isSaving ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent mr-2"></div>
                    Saving...
                  </>
              ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" /> Save Changes
                  </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="text-base font-medium mb-2 block">
                        Form Title
                      </label>
                      <Input
                          id="title"
                          placeholder="Enter form title"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          className="text-lg h-12"
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="text-base font-medium mb-2 block">
                        Description (optional)
                      </label>
                      <Textarea
                          id="description"
                          placeholder="Enter form description"
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          rows={3}
                          className="text-base"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <FormBuilder elements={formElements} setElements={setFormElements} />
            </div>

            <div>
              <div className="sticky top-24">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-medium mb-4">Form Settings</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="require-login" className="text-base">
                            Require Login
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Only allow authenticated users to submit this form
                          </p>
                        </div>
                        <Switch id="require-login" checked={requireLogin} onCheckedChange={setRequireLogin} />
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Share Options</h4>
                        <p className="text-sm text-muted-foreground">Share your form with others via this unique link:</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                              value={`${typeof window !== "undefined" ? window.location.origin : ""}/forms/s/${shareId}`}
                              readOnly
                              className="text-sm"
                          />
                          <Button
                              variant="outline"
                              className="shrink-0"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                    `${typeof window !== "undefined" ? window.location.origin : ""}/forms/s/${shareId}`,
                                )
                                toast({
                                  title: "Link copied",
                                  description: "Share link copied to clipboard",
                                })
                              }}
                          >
                            Copy
                          </Button>
                        </div>
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

