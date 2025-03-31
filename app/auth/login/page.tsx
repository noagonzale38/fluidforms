"use client"

import { Button } from "@/components/ui/button"
import { FaDiscord } from "react-icons/fa"

export default function LoginPage() {
  const discordLoginUrl = "https://staging.fluidforms.org/auth/redirect" // Replace with your actual Discord OAuth URL

  return (
      <div className="flex min-h-screen">
        {/* Left side - Background Image */}
        <div className="hidden lg:flex lg:w-1/2 h-screen items-center justify-center bg-[#1a0b2e] relative">
          <div className="absolute inset-0 bg-black/20 z-10"></div>
          <img
              src="https://i.ibb.co/7BRYyLV/fluidforms-login.png"
              alt="FluidForms | Welcome"
              className="h-full w-full object-cover object-center"
          />
        </div>

        {/* Right side - Content */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-black p-8">
          <div className="w-full max-w-md space-y-8 text-center">
            <h1 className="text-3xl font-bold text-white">Log in to FluidForms</h1>
            <p className="mt-2 text-gray-400">Sign in to continue to FluidForms</p>
            <Button
                asChild
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <a href={discordLoginUrl}>
                <FaDiscord className="h-5 w-5 mr-2" />
                Continue with Discord
              </a>
            </Button>
          </div>
        </div>
      </div>
  )
}
