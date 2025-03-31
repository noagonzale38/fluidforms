"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Navbar  from "@/components/navbar"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { use } from "react"

export default function ThankYouPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = use(params) // Properly unwrap the params Promise

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription className="text-base">Your response has been successfully submitted.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-6">
              <p className="text-muted-foreground">
                We appreciate your time and feedback. Your response has been recorded.
              </p>
              <div className="flex flex-col space-y-3">
                <Link href={`/forms/s/${shareId}`}>
                  <Button variant="outline" className="w-full rounded-full">
                    Submit Another Response
                  </Button>
                </Link>
                <Link href="/">
                  <Button className="w-full rounded-full">Return to Home</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

