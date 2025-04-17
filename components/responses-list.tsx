"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-provider"
import { getRecentResponsesAdmin } from "@/lib/supabase-admin"

export function ResponsesList() {
  const { user } = useAuth()
  const [responses, setResponses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadResponses() {
      if (!user) return
      
      try {
        const result = await getRecentResponsesAdmin(user.id)
        if (result.success) {
          setResponses(result.responses)
        }
      } catch (error) {
        console.error("Error loading responses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadResponses()
  }, [user])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (responses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <FileText className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-3">No responses yet</h3>
        <p className="text-muted-foreground mb-6 text-lg max-w-md">
          Share your forms with others to start collecting responses
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {responses.map((response: any) => (
        <Card key={response.id}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8">
                    {response.userProfile ? (
                      <AvatarImage src={response.userProfile.avatar} alt={response.userProfile.username} />
                    ) : (
                      <AvatarFallback>A</AvatarFallback>
                    )}
                  </Avatar>
                  <h4 className="text-base font-medium">
                    {response.userProfile ? response.userProfile.username : "Anonymous User"}
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
                <Link href={`/forms/${response.form_id}/results`}>
                  <Button variant="outline" size="sm" className="rounded-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h5 className="text-sm font-medium mb-2">Form: {response.formTitle}</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(response.data).slice(0, 4).map(([key, value]: [string, any]) => (
                  <div key={key} className="overflow-hidden">
                    <p className="text-xs text-muted-foreground">{key}</p>
                    <p className="text-sm truncate">
                      {typeof value === "object" ? JSON.stringify(value) : value.toString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}