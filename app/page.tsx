"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import  Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { GradientTextCycler } from "@/components/gradient-text-cycler"
import { ArrowRight } from "lucide-react"

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()
  
  // Optional: if you need to wait for the client to mount before reading the auth state,
  // you may still include this mounted check. Remove if not required.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section with left text and right image */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl">
                    Create, Share, and Analyze Forms with{" "}
                    <GradientTextCycler
                      phrases={[
                        "Ease", 
                        "Confidence", 
                        "Style", 
                        "Precision", 
                        "Intelligence", 
                        "Flexibility"
                      ]}
                      className="bg-gradient-to-r from-primary to-purple-400"
                    />
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Build beautiful forms with conditional logic, collect responses, and analyze results through custom integrations.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {/* Using the login logic from the second code version */}
                  {mounted && (
                    <Link href={user ? "/dashboard" : "/auth/login"}>
                      <Button className="rounded-full text-lg px-6 py-3 h-auto">
                        {user ? "Go to Dashboard" : "Get Started"}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                  <Link href="#features">
                    <Button variant="outline" className="rounded-full text-lg px-6 py-3 h-auto">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto flex items-center justify-center">
                <div className="relative w-full max-w-[500px] aspect-square">
                  <Image
                    src="/placeholder.svg?height=500&width=500"
                    alt="Form Builder Preview"
                    className="rounded-xl object-cover"
                    fill
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with background style from the second code */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Powerful Features</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Everything you need to create, share, and analyze forms.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
              <div className="flex flex-col items-center space-y-4 rounded-2xl bg-card p-6 shadow-lg">
                <div className="rounded-full bg-primary/10 p-3">
                  {/* Example icon (from lucide-react or your own icon component) */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16h8M8 12h8M8 8h8" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Form Builder</h3>
                <p className="text-muted-foreground text-center text-base">
                  Drag and drop interface with multiple field types and conditional logic.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-2xl bg-card p-6 shadow-lg">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Response Collection</h3>
                <p className="text-muted-foreground text-center text-base">
                  Collect responses with validation and real-time updates.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-2xl bg-card p-6 shadow-lg">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18V3H3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Analytics</h3>
                <p className="text-muted-foreground text-center text-base">
                  Visualize and export form responses in multiple formats.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Optional Call-to-Action Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to create your first form?</h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                Sign up for free and start building forms in minutes. No credit card required.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
              <Link href="/forms/create">
                <Button className="rounded-full text-base px-8 py-6 h-auto">Get Started</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 md:flex-row">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} FluidForms. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-sm font-medium hover:underline" href="/terms">
              Terms of Service
            </Link>
            <Link className="text-sm font-medium hover:underline" href="/privacy">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
