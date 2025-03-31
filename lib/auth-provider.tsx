"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

type User = {
  id: string
  username: string
  avatar: string
  accessToken: string
} | null

type AuthContextType = {
  user: User
  login: () => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
})

// Hardcoded redirect URLs for different environments
const REDIRECT_URLS = {
  // Add your production domain
  "fluidforms.org": "https://fluidforms.org/api/discord/callback",
  // Add your staging domain if applicable
  "staging.fluidforms.org": "https://staging.fluidforms.org/api/discord/callback",
  // Local development fallback
  localhost: "http://localhost:3000/api/discord/callback",
  // Default fallback - use this if none of the above match
  default: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || "http://localhost:3000/api/discord/callback",
}

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        console.log("Checking for stored user data...")
        const storedUser = localStorage.getItem("formflow_user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          console.log("Found stored user:", {
            id: parsedUser.id,
            username: parsedUser.username,
            hasToken: !!parsedUser.accessToken,
          })

          setUser(parsedUser)
        } else {
          console.log("No stored user found")
        }
      } catch (error) {
        console.error("Error loading user from localStorage:", error)
        toast({
          title: "Error",
          description: "Failed to load user data from storage",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUserFromStorage()
  }, [toast])

  const login = () => {
    try {
      const authUrl = `https://staging.fluidforms.org/auth/login`
      console.log("Redirecting to Discord auth:", authUrl)
      window.location.href = authUrl
    } catch (error) {
      console.error("Error during login redirect:", error)
      toast({
        title: "Login Error",
        description: "Failed to redirect to Discord login",
        variant: "destructive",
      })
    }
  }

  const logout = () => {
    try {
      console.log("Logging out user...")
      localStorage.removeItem("formflow_user")
      localStorage.removeItem("discord_token")
      setUser(null)
      console.log("User logged out successfully")
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      })
    } catch (error) {
      console.error("Error during logout:", error)
      toast({
        title: "Logout Error",
        description: "Failed to complete logout process",
        variant: "destructive",
      })
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

