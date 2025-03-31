"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, BarChart3, ExternalLink, FileText, MoreHorizontal, Plus, Share2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

type FormsListProps = {
  forms: Array<{
    id: string
    title: string
    description?: string
    createdAt: string
    updatedAt: string
    status: string
    requireLogin?: boolean
    shareId: string
    responseCount: number
  }>
  isLoading: boolean
}

export function FormsList({ forms, isLoading }: FormsListProps) {
  const { toast } = useToast()

  console.log("Forms list received:", forms)

  const deleteForm = async (formId: string) => {
    // In a real implementation, this would delete from Supabase
    // We would use the admin API route to bypass RLS
    try {
      const response = await fetch("/api/supabase/rls-bypass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "delete",
          table: "forms",
          filters: {
            eq: {
              id: formId,
            },
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete form")
      }

      toast({
        title: "Form deleted",
        description: "The form has been successfully deleted",
      })

      // Refresh the page to update the list
      window.location.reload()
    } catch (error) {
      console.error("Error deleting form:", error)
      toast({
        title: "Error deleting form",
        description: error instanceof Error ? error.message : "There was a problem deleting the form",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const copyShareLink = (shareId: string) => {
    const shareUrl = `${window.location.origin}/forms/s/${shareId}`
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Share link copied",
      description: "The form share link has been copied to your clipboard.",
    })
  }

  const duplicateForm = (formId: string) => {
    // In a real implementation, this would duplicate the form in the database
    toast({
      title: "Duplicating form",
      description: "This feature is not yet implemented.",
    })
  }

  if (isLoading) {
    return (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
    )
  }

  if (forms.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-3">No forms created yet</h3>
          <p className="text-muted-foreground mb-8 text-lg max-w-md">
            Create your first form to start collecting responses from your audience
          </p>
          <Link href="/forms/create">
            <Button className="rounded-full text-lg px-8 py-3 h-auto">
              <Plus className="mr-2 h-5 w-5" /> Create Your First Form
            </Button>
          </Link>
        </div>
    )
  }

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map((form) => (
            <Card key={form.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{form.title}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2 text-base">{form.description}</CardDescription>
                  </div>
                  <Badge
                      variant={form.status === "active" ? "default" : "secondary"}
                      className="capitalize text-sm px-3 py-1"
                  >
                    {form.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center justify-between text-base">
                  <div className="text-muted-foreground">Updated {formatDate(form.updatedAt)}</div>
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-1 text-muted-foreground" />
                    <span>{form.responseCount} responses</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-3 border-t">
                <Link href={`/forms/${form.id}`}>
                  <Button variant="outline" className="rounded-full text-base px-4 py-2 h-auto">
                    <ExternalLink className="h-5 w-5 mr-2" /> View
                  </Button>
                </Link>
                <div className="flex gap-2">
                  <Link href={`/forms/${form.id}/edit`}>
                    <Button variant="outline" className="rounded-full h-10 w-10 p-0">
                      <Edit className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href={`/forms/${form.id}/results`}>
                    <Button variant="outline" className="rounded-full h-10 w-10 p-0">
                      <BarChart3 className="h-5 w-5" />
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="rounded-full h-10 w-10 p-0">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel className="text-base">Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-base" onClick={() => copyShareLink(form.shareId)}>
                        <Share2 className="h-5 w-5 mr-2" /> Copy Share Link
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive focus:text-destructive text-base"
                          >
                            <Trash2 className="h-5 w-5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl">Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription className="text-base">
                              This will permanently delete the form and all its responses. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-full text-base">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="rounded-full bg-destructive hover:bg-destructive/90 text-base"
                                onClick={() => deleteForm(form.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardFooter>
            </Card>
        ))}
      </div>
  )
}

