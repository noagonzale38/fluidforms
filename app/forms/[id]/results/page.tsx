"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import  Navbar  from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, BarChart3, FileText, Users, Clock, ChevronDown } from "lucide-react"
import Link from "next/link"
import { getFormByIdAdmin, getFormResponsesAdmin } from "@/lib/supabase-admin"
import { useToast } from "@/hooks/use-toast"
import { use } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function FormResults({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [form, setForm] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [isFormLoading, setIsFormLoading] = useState(true)
  const [isResponsesLoading, setIsResponsesLoading] = useState(true)
  const [selectedResponse, setSelectedResponse] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    async function loadFormAndResponses() {
      if (!id || !user) return

      setIsFormLoading(true)
      setIsResponsesLoading(true)

      try {
        console.log("Loading form with ID:", id)
        const formResult = await getFormByIdAdmin(id)

        if (formResult.success && formResult.form) {
          console.log("Form loaded successfully:", formResult.form)
          setForm(formResult.form)

          // Now load responses
          const responsesResult = await getFormResponsesAdmin(id)

          if (responsesResult.success) {
            console.log("Responses loaded successfully:", responsesResult.responses)
            setResponses(responsesResult.responses || [])
          } else {
            console.error("Error loading responses:", responsesResult.error)
            toast({
              title: "Error",
              description: "Failed to load form responses",
              variant: "destructive",
            })
          }
        } else {
          console.error("Error loading form:", formResult.error)
          toast({
            title: "Error",
            description: "Failed to load form data",
            variant: "destructive",
          })
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error fetching form or responses:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading the data",
          variant: "destructive",
        })
      } finally {
        setIsFormLoading(false)
        setIsResponsesLoading(false)
      }
    }

    if (!isLoading && user) {
      loadFormAndResponses()
    }
  }, [id, user, isLoading, toast, router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
  }

  const exportResponses = () => {
    if (!responses || responses.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no responses to export",
        variant: "destructive",
      })
      return
    }

    try {
      // Create CSV content
      const headers = ["Response ID", "Submission Date", "Status", ...form.elements.map((el: any) => el.label)]

      const rows = responses.map((response) => {
        const row = [response.id, formatDate(response.created_at), response.status]

        // Add data for each form element
        form.elements.forEach((element: any) => {
          const value = response.data[element.id] || ""
          row.push(typeof value === "object" ? JSON.stringify(value) : value)
        })

        return row
      })

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `${form.title.replace(/\s+/g, "_")}_responses.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export successful",
        description: "Responses have been exported to CSV",
      })
    } catch (error) {
      console.error("Error exporting responses:", error)
      toast({
        title: "Export failed",
        description: "There was a problem exporting the responses",
        variant: "destructive",
      })
    }
  }

  const getAnalyticsData = (elementId: string) => {
    const element = form.elements.find((el: any) => el.id === elementId)
    if (!element) return []

    const data: { [key: string]: number } = {}
    responses.forEach((response) => {
      const value = response.data[elementId]
      if (value) {
        if (Array.isArray(value)) {
          // Handle checkboxes
          value.forEach((v) => {
            data[v] = (data[v] || 0) + 1
          })
        } else {
          // Handle other types
          data[value] = (data[value] || 0) + 1
        }
      }
    })

    return Object.entries(data).map(([name, value]) => ({ name, value }))
  }

  const CHART_COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#0088fe",
    "#00c49f",
    "#ffbb28",
    "#ff8042",
  ]

  const renderResponseDetails = (response: any) => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Submission Date</p>
            <p className="font-medium">{formatDate(response.created_at)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <Badge variant={response.status === "complete" ? "default" : "secondary"} className="mt-1">
              {response.status}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Responses</h4>
          {form.elements.map((element: any) => (
            <div key={element.id} className="space-y-2">
              <p className="text-sm text-muted-foreground">{element.label}</p>
              <div className="rounded-md bg-muted p-3">
                {(() => {
                  const value = response.data[element.id]
                  if (Array.isArray(value)) {
                    return value.join(", ")
                  } else if (typeof value === "object") {
                    return JSON.stringify(value, null, 2)
                  } else {
                    return value || "—"
                  }
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
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
            <p className="text-muted-foreground mb-6">Please log in to view form results.</p>
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
            <h1 className="text-3xl font-bold">{form.title}: Results</h1>
          </div>
          <Button onClick={exportResponses} className="rounded-full" disabled={responses.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export Responses
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Total Responses</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{responses.length}</div>
              <p className="text-sm text-muted-foreground">
                {responses.length === 0
                  ? "No responses yet"
                  : `${responses.length} response${responses.length !== 1 ? "s" : ""} received`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Unique Respondents</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {new Set(responses.map(r => r.respondent_id).filter(Boolean)).size}
              </div>
              <p className="text-sm text-muted-foreground">Unique users who submitted responses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Average Time</CardTitle>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2m 30s</div>
              <p className="text-sm text-muted-foreground">Average completion time</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="responses" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="responses" className="text-base py-2">
              Responses
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-base py-2">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="responses" className="mt-6">
            {isResponsesLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : responses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <FileText className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">No responses yet</h3>
                <p className="text-muted-foreground mb-6 text-lg max-w-md">
                  Share your form with others to start collecting responses
                </p>
                <Button
                  className="rounded-full"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${typeof window !== "undefined" ? window.location.origin : ""}/forms/s/${form.share_id}`,
                    )
                    toast({
                      title: "Link copied",
                      description: "Share link copied to clipboard",
                    })
                  }}
                >
                  Copy Share Link
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {responses.map((response) => (
                  <Card key={response.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{response.respondent_id ? "U" : "A"}</AvatarFallback>
                            </Avatar>
                            <h4 className="text-base font-medium">
                              {response.respondent_id ? "Authenticated User" : "Anonymous User"}
                            </h4>
                          </div>
                          <p className="text-sm text-muted-foreground">Submitted {formatDate(response.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={response.status === "complete" ? "default" : "secondary"}
                            className="capitalize text-sm px-3 py-1"
                          >
                            {response.status}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full"
                            onClick={() => {
                              setSelectedResponse(response)
                              setIsDialogOpen(true)
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>

                      <Collapsible className="mt-4 pt-4 border-t">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="flex items-center gap-2 w-full justify-between">
                            <span className="text-sm font-medium">Response Summary</span>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {form.elements.map((element: any) => (
                              <div key={element.id} className="overflow-hidden">
                                <p className="text-xs text-muted-foreground">{element.label}</p>
                                <p className="text-sm truncate">
                                  {(() => {
                                    const value = response.data[element.id]
                                    if (Array.isArray(value)) {
                                      return value.join(", ")
                                    } else if (typeof value === "object") {
                                      return JSON.stringify(value)
                                    } else {
                                      return value || "—"
                                    }
                                  })()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Analytics</CardTitle>
                <CardDescription>Visual representation of form responses</CardDescription>
              </CardHeader>
              <CardContent>
                {responses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                      <BarChart3 className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">No data to analyze</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Analytics will be available once you start receiving responses
                    </p>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {form.elements
                      .filter((element: any) =>
                        ["multiple-choice", "checkboxes", "dropdown", "rating-scale"].includes(element.type),
                      )
                      .map((element: any) => {
                        const data = getAnalyticsData(element.id)
                        const total = data.reduce((sum, item) => sum + item.value, 0)

                        return (
                          <div key={element.id} className="space-y-4">
                            <h3 className="text-lg font-medium">{element.label}</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              {/* Bar Chart */}
                              <div className="h-[300px] w-full">
                                <BarChart
                                  width={500}
                                  height={300}
                                  data={data}
                                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="value" fill="#8884d8" />
                                </BarChart>
                              </div>

                              {/* Pie Chart */}
                              <div className="h-[300px] w-full">
                                <PieChart width={400} height={300}>
                                  <Pie
                                    data={data}
                                    cx={200}
                                    cy={150}
                                    labelLine={false}
                                    label={({ name, value }) => `${name} (${Math.round((value / total) * 100)}%)`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                  >
                                    {data.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </div>
                            </div>
                          </div>
                        )
                      })}

                    {form.elements.filter((element: any) =>
                      ["multiple-choice", "checkboxes", "dropdown", "rating-scale"].includes(element.type),
                    ).length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No chart-compatible questions found in this form. Add multiple choice, checkbox, dropdown, or
                          rating questions to see analytics.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Response Details</DialogTitle>
            <DialogDescription>
              Submitted {selectedResponse && formatDate(selectedResponse.created_at)}
            </DialogDescription>
          </DialogHeader>
          {selectedResponse && renderResponseDetails(selectedResponse)}
        </DialogContent>
      </Dialog>
    </div>
  )
}