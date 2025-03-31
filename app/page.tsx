import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, CheckCircle, FileText, BarChart3 } from "lucide-react"
import { GradientTextCycler } from "@/components/gradient-text-cycler"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Create, Share, and Analyze Forms with{" "}
                  <GradientTextCycler
                    phrases={["Ease", "Confidence", "Style", "Precision", "Intelligence", "Flexibility"]}
                    className="font-extrabold"
                  />
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Build beautiful forms with conditional logic, collect responses, and analyze results on the best forms for developers with API endpoints & custom integrations that anyone can make!
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/dashboard">
                  <Button className="rounded-full text-lg px-6 py-3 h-auto">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" className="rounded-full text-lg px-6 py-3 h-auto">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Powerful Features</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Everything you need to create and manage forms
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
              <div className="flex flex-col items-center space-y-4 rounded-2xl bg-card p-6 shadow-lg">
                <div className="rounded-full bg-primary/10 p-3">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Form Builder</h3>
                <p className="text-muted-foreground text-center text-base">
                  Drag and drop interface with 15+ field types and conditional logic
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-2xl bg-card p-6 shadow-lg">
                <div className="rounded-full bg-primary/10 p-3">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Response Collection</h3>
                <p className="text-muted-foreground text-center text-base">
                  Collect responses with validation and real-time updates
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-2xl bg-card p-6 shadow-lg">
                <div className="rounded-full bg-primary/10 p-3">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Analytics</h3>
                <p className="text-muted-foreground text-center text-base">
                  Visualize responses with charts and export data in multiple formats
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t border-border/40 py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-base text-muted-foreground">© 2025 FluidForms. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-base text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="text-base text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

