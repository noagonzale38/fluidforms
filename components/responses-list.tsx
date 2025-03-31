"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import Link from "next/link"

export function ResponsesList() {
  // Start with an empty array instead of mock data
  const [responses, setResponses] = useState([])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
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
      {responses.map((response) => (
        <Card key={response.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={response.respondent.avatar} alt={response.respondent.name} />
                  <AvatarFallback>{response.respondent.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-base font-medium">{response.respondent.name}</h4>
                  <p className="text-base text-muted-foreground">{response.respondent.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <Link href={`/forms/${response.formId}`} className="text-base font-medium hover:underline">
                    {response.formTitle}
                  </Link>
                  <p className="text-sm text-muted-foreground">Submitted {formatDate(response.submittedAt)}</p>
                </div>
                <Badge
                  variant={response.status === "complete" ? "default" : "secondary"}
                  className="capitalize text-sm px-3 py-1"
                >
                  {response.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-center mt-6">
        <Button variant="outline" className="rounded-full text-base px-6 py-2 h-auto">
          View All Responses
        </Button>
      </div>
    </div>
  )
}

