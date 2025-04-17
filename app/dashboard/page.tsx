"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, FileText, BarChart3, Settings } from "lucide-react"
import Link from "next/link"
import { FormsList } from "@/components/forms-list"
import { ResponsesList } from "@/components/responses-list"
import { getUserFormsAdmin } from "@/lib/supabase-admin"
import { useToast } from "@/hooks/use-toast"

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [stats, setStats] = useState({
    totalForms: 0,
    totalResponses: 0,
    completionRate: 0,
    startTime: Date.now(),
  })
  const [isLoading, setIsLoading] = useState(true)
  const [forms, setForms] = useState([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    // Store start time in localStorage if not exists
    if (!localStorage.getItem('session_start_time')) {
      localStorage.setItem('session_start_time', Date.now().toString())
    }
  }, [])

  useEffect(() => {
    async function loadStats() {
      if (!user) return

      console.log("Loading stats for user:", user.id)
      setIsLoading(true)

      try {
        const result = await getUserFormsAdmin(user.id)
        console.log("getUserFormsAdmin result:", result)

        setIsLoading(false)

        if (result.success) {
          const forms = result.forms
          console.log("Forms loaded:", forms)
          setForms(forms)

          const totalForms = forms.length
          const totalResponses = forms.reduce((sum, form) => sum + form.responseCount, 0)

          // Calculate completion rate based on actual completed responses
          const completedResponses = forms.reduce((sum, form) => {
            return sum + (form.responses?.filter(r => r.status === 'complete').length || 0)
          }, 0)
          
          const completionRate = totalResponses > 0 
            ? Math.round((completedResponses / totalResponses) * 100)
            : 0

          setStats({
            totalForms,
            totalResponses,
            completionRate,
            startTime: parseInt(localStorage.getItem('session_start_time') || Date.now().toString()),
          })
        } else {
          console.error("Error from getUserFormsAdmin:", result.error)
          toast({
            title: "Error loading dashboard",
            description: "There was a problem loading your dashboard data.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Unexpected error loading dashboard:", error)
        setIsLoading(false)
        toast({
          title: "Error loading dashboard",
          description: "There was a problem loading your dashboard data.",
          variant: "destructive",
        })
      }
    }

    if (!authLoading && user) {
      loadStats()
    }
  }, [user, authLoading, toast])

  if (authLoading || !user) {
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link href="/forms/create">
            <Button className="rounded-full text-base px-6 py-2 h-auto">
              <Plus className="mr-2 h-5 w-5" /> Create Form
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Total Forms</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalForms}</div>
              <p className="text-sm text-muted-foreground">
                {stats.totalForms === 0
                  ? "Create your first form to get started"
                  : `${stats.totalForms} form${stats.totalForms !== 1 ? "s" : ""} created`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Total Responses</CardTitle>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalResponses}</div>
              <p className="text-sm text-muted-foreground">
                {stats.totalResponses === 0
                  ? "Share your forms to collect responses"
                  : `${stats.totalResponses} response${stats.totalResponses !== 1 ? "s" : ""} received`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Completion Rate</CardTitle>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.completionRate}%</div>
              <p className="text-sm text-muted-foreground">
                {stats.totalResponses === 0
                  ? "Track form completion statistics"
                  : `${stats.completionRate}% completion rate`}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="forms" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="forms" className="text-base py-2">
              My Forms
            </TabsTrigger>
            <TabsTrigger value="responses" className="text-base py-2">
              Recent Responses
            </TabsTrigger>
          </TabsList>
          <TabsContent value="forms" className="mt-6">
            <FormsList forms={forms} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="responses" className="mt-6">
            <ResponsesList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}