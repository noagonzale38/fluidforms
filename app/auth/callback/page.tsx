"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get("error")
    const errorDescription = urlParams.get("error_description")
    const code = urlParams.get("code") // The authorization code from Discord

    // Log error received in URL parameters
    if (errorParam) {
      console.log("Authentication error received:", errorParam, errorDescription) // Log error details
      setError(`Authentication error: ${errorDescription || errorParam}`)
      setTimeout(() => router.push("/"), 3000) // Redirect back to home after showing error
      return
    }

    // If no `code`, something went wrong
    if (!code) {
      console.log("No authentication code received in the URL.") // Log if no code found
      setError("No authentication code received. Please try again.")
      setTimeout(() => router.push("/"), 3000) // Redirect back to home after showing error
      return
    }

    // Exchange the code for an access token
    const fetchAccessToken = async (code: string) => {
      try {
        const response = await fetch("/api/discord/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Error exchanging code for access token:", errorText)
          setError("Failed to authenticate with Discord.")
          setTimeout(() => router.push("/"), 3000)
          return
        }

        const data = await response.json()
        const { access_token } = data

        if (access_token) {
          console.log("Access token received:", access_token) // Log the token
          localStorage.setItem("discord_token", access_token)
          console.log("Token saved to localStorage.") // Log saving the token

          // Fetch user info
          const userResponse = await fetch("https://discord.com/api/users/@me", {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          })

          if (!userResponse.ok) {
            setError("Failed to get user info.")
            setTimeout(() => router.push("/"), 3000)
            return
          }

          const userData = await userResponse.json()

          const userObj = {
            id: userData.id,
            username: userData.username,
            avatar: userData.avatar
                ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
                : `https://cdn.discordapp.com/embed/avatars/${Number.parseInt(userData.discriminator || "0") % 5}.png`,
            accessToken: access_token,
          }

          // Store user in localStorage
          localStorage.setItem("formflow_user", JSON.stringify(userObj))

          router.push("/dashboard") // Redirect to the dashboard page after saving the token
        } else {
          setError("Failed to retrieve access token.")
          setTimeout(() => router.push("/"), 3000) // Redirect back to home after error
        }
      } catch (error) {
        console.error("Error exchanging code for access token:", error)
        setError("Error exchanging code for access token.")
        setTimeout(() => router.push("/"), 3000) // Redirect back to home after error
      }
    }

    fetchAccessToken(code)
  }, [router])

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
                <p className="mt-4 text-lg">Authenticating...</p>
                <p className="text-sm text-muted-foreground">You will be redirected shortly</p>
              </>
          )}
        </div>
      </div>
  )
}

