import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">Privacy Policy</h1>
          
          <div className="prose prose-lg dark:prose-invert space-y-6">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, including when you create an account,
              build forms, or submit responses through our platform.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, 
              communicate with you, and safeguard both our services and users.
            </p>

            <h2>3. Information Sharing</h2>
            <p>
              We do not share your personal information with third parties except as outlined in this policy 
              or when you provide explicit consent.
            </p>

            <h2>4. Data Security</h2>
            <p>
              We implement reasonable technical and organizational measures to protect your personal information 
              from loss, misuse, unauthorized access, disclosure, alteration, or destruction.
            </p>

            <h2>5. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information. 
              You may also object to or restrict certain processing of your data.
              <br />
              <br />
              If you have any questions or concerns, feel free to contact us at: <br />
              <a href="mailto:noahgonzales281@gmail.com" className="text-blue-600 dark:text-blue-400 underline">noahgonzales281@gmail.com</a>
            </p>

            <div className="mt-10 flex gap-4">
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
              <Link href="/terms">
                <Button>Terms of Service</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
