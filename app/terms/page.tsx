import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">Terms of Service</h1>
          
          <div className="prose prose-lg dark:prose-invert space-y-6">
            <p className="italic">Effective Date: April 4, 2025</p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using <strong>YourFormsCompany</strong> ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
              If you do not agree to these Terms, please do not use the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              YourFormsCompany provides tools to create, share, and manage online forms. 
              Users can collect responses, analyze results, and export data.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              To access certain features, you must register for an account. 
              You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
            </p>

            <h2>4. User Content</h2>
            <p>
              You retain ownership of all content you submit through the Service. 
              By using the Service, you grant us a limited license to store and process your content solely for the purpose of operating and improving the Service.
            </p>

            <h2>5. Prohibited Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>Violate any laws or regulations</li>
              <li>Distribute spam or malicious content</li>
              <li>Collect sensitive personal information without proper consent</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
            </ul>

            <div className="mt-10 flex gap-4">
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
              <Link href="/privacy">
                <Button>Privacy Policy</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
