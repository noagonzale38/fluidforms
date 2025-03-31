"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function AuthCallback() {
  const router = useRouter()
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("Initializing authentication...")
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleAuth = async () => {
      try {
        setStatus("Reading URL parameters...")
        const urlParams = new URLSearchParams(window.location.search)
        const errorParam = urlParams.get("error")
        const errorDescription = urlParams.get("error_description")
        const code = urlParams.get("code") // The authorization code from Discord

        console.log("Auth callback initialized", {
          hasError: !!errorParam,
          hasCode: !!code,
          url: window.location.href,
        })

        // Log error received in URL parameters
        if (errorParam) {
          console.error("Authentication error received:", errorParam, errorDescription)
          setError(`Authentication error: ${errorDescription || errorParam}`)
          toast({
            title: "Authentication Failed",
            description: errorDescription || errorParam,
            variant: "destructive",
          })
          setTimeout(() => router.push("/"), 3000)
          return
        }

        // If no `code`, something went wrong
        if (!code) {
          console.error("No authentication code received in the URL.")
          setError("No authentication code received. Please try again.")
          toast({
            title: "Authentication Failed",
            description: "No authentication code received. Please try again.",
            variant: "destructive",
          })
          setTimeout(() => router.push("/"), 3000)
          return
        }

        // Exchange the code for an access token
        setStatus("Exchanging code for access token...")
        console.log("Exchanging code for access token...")

        // Get the redirect URI that was used for the initial auth request
        const redirectUri =
            sessionStorage.getItem("discord_redirect_uri") || process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI

        console.log("Using redirect URI from session:", redirectUri)

        const response = await fetch("/api/discord/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            redirectUri,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Error exchanging code for access token:", errorText, response.status)
          setError(`Failed to authenticate with Discord. Status: ${response.status}`)
          toast({
            title: "Authentication Failed",
            description: `Failed to authenticate with Discord. Status: ${response.status}`,
            variant: "destructive",
          })
          setTimeout(() => router.push("/"), 3000)
          return
        }

        const data = await response.json()
        console.log("Token response received:", {
          hasAccessToken: !!data.access_token,
          tokenType: data.token_type,
          expiresIn: data.expires_in,
        })

        const { access_token } = data

        if (!access_token) {
          console.error("No access token in response:", data)
          setError("Failed to retrieve access token from Discord.")
          toast({
            title: "Authentication Failed",
            description: "Failed to retrieve access token from Discord.",
            variant: "destructive",
          })
          setTimeout(() => router.push("/"), 3000)
          return
        }

        // Save token to localStorage
        setStatus("Saving authentication token...")
        try {
          localStorage.setItem("discord_token", access_token)
          console.log("Token saved to localStorage successfully")
        } catch (e) {
          console.error("Failed to save token to localStorage:", e)
          setError("Failed to save authentication data. Please enable cookies and localStorage.")
          toast({
            title: "Storage Error",
            description: "Failed to save authentication data. Please enable cookies and localStorage.",
            variant: "destructive",
          })
          setTimeout(() => router.push("/"), 3000)
          return
        }

        // Fetch user info
        setStatus("Fetching user information...")
        console.log("Fetching user information from Discord API...")

        const userResponse = await fetch("https://discord.com/api/users/@me", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })

        if (!userResponse.ok) {
          const userErrorText = await userResponse.text()
          console.error("Failed to get user info:", userErrorText, userResponse.status)
          setError(`Failed to get user info. Status: ${userResponse.status}`)
          toast({
            title: "Authentication Failed",
            description: `Failed to get user info. Status: ${userResponse.status}`,
            variant: "destructive",
          })
          setTimeout(() => router.push("/"), 3000)
          return
        }

        const userData = await userResponse.json()
        console.log("User data received:", {
          id: userData.id,
          username: userData.username,
          hasAvatar: !!userData.avatar,
        })

        const userObj = {
          id: userData.id,
          username: userData.username,
          avatar: userData.avatar
              ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
              : `https://cdn.discordapp.com/embed/avatars/${Number.parseInt(userData.discriminator || "0") % 5}.png`,
          accessToken: access_token,
        }

        // Store user in localStorage
        setStatus("Saving user information...")
        try {
          localStorage.setItem("formflow_user", JSON.stringify(userObj))
          console.log("User data saved to localStorage successfully")
        } catch (e) {
          console.error("Failed to save user data to localStorage:", e)
          setError("Failed to save user data. Please enable cookies and localStorage.")
          toast({
            title: "Storage Error",
            description: "Failed to save user data. Please enable cookies and localStorage.",
            variant: "destructive",
          })
          setTimeout(() => router.push("/"), 3000)
          return
        }

        // Authentication successful, redirect to dashboard
        setStatus("Authentication successful! Redirecting to dashboard...")
        console.log("Authentication successful, redirecting to dashboard")

        // Clean up the session storage
        sessionStorage.removeItem("discord_redirect_uri")

        // Small delay to ensure localStorage is saved before redirect
        setTimeout(() => {
          router.push("/dashboard")
        }, 500)

      } catch (error) {
        console.error("Unexpected error during authentication:", error)
        setError("An unexpected error occurred during authentication.")
        toast({
          title: "Authentication Error",
          description: "An unexpected error occurred during authentication.",
          variant: "destructive",
        })
        setTimeout(() => router.push("/"), 3000)
      } finally {
        setIsProcessing(false)
      }
    }

    handleAuth()
  }, [router, toast])

  return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-6 max-w-md">
          {error ? (
              <>
                <div className="text-destructive text-xl mb-4">⚠️ Error</div>
                <p className="text-destructive mb-4">{error}</p>
                <p className="text-sm text-muted-foreground">Redirecting you back...</p>
              </>
          ) : (
              <>
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                <p className="mt-4 text-lg">{status}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {isProcessing
                      ? "Please wait while we complete the authentication process..."
                      : "You will be redirected shortly"}
                </p>
              </>
          )}
        </div>
      </div>
  )
}

