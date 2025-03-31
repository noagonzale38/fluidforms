"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import Navbar  from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { FormBuilder } from "@/components/form-builder"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { saveFormAdmin } from "@/lib/supabase-admin"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function CreateForm() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formElements, setFormElements] = useState([])
  const [requireLogin, setRequireLogin] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

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
      title: formTitle,
      description: formDescription,
      elements: formElements,
      status: "active",
      requireLogin,
      creatorUsername: user?.username || "Anonymous User",
    }

    console.log("Saving form with data:", {
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
          description: "Your form has been saved successfully",
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

  if (isLoading || !user) {
    return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
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
              <h1 className="text-3xl font-bold">Create Form</h1>
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="rounded-full text-base px-6 py-2 h-auto">
              {isSaving ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent mr-2"></div>
                    Saving...
                  </>
              ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" /> Save Form
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
                        <p className="text-sm text-muted-foreground">
                          After saving, you'll be able to share your form with others via a unique link.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                          You'll receive email notifications when someone submits your form.
                        </p>
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

