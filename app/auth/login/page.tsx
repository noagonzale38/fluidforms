"use client"

import { Button } from "@/components/ui/button"
import { FaDiscord } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import Link from "next/link"
import { useGoogleLogin } from '@react-oauth/google'
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<{discord: boolean, google: boolean}>({
    discord: false,
    google: false
  })
  const [discordWindow, setDiscordWindow] = useState<Window | null>(null)

  // Handle Discord OAuth popup
  const handleDiscordLogin = () => {
    setIsLoading(prev => ({ ...prev, discord: true }))
    
    const width = 500
    const height = 800
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      'https://discord.com/oauth2/authorize?client_id=1355768994312749117&response_type=code&redirect_uri=https%3A%2F%2Fstaging.fluidforms.org/api/discord/callback&scope=identify+email',
      'DiscordAuth',
      `width=${width},height=${height},left=${left},top=${top}`
    )
    
    setDiscordWindow(popup)
  }

  useEffect(() => {
    if (!discordWindow) return
  
    const checkPopup = setInterval(() => {
      if (discordWindow.closed) {
        setIsLoading(prev => ({ ...prev, discord: false }))
        clearInterval(checkPopup)
      }
    }, 500)
  
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'DISCORD_AUTH_SUCCESS') {
        setIsLoading(prev => ({ ...prev, discord: false }))
    
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000) // 3 seconds delay
    
      } else if (event.data?.type === 'DISCORD_AUTH_ERROR') {
        setIsLoading(prev => ({ ...prev, discord: false }))
        toast({
          title: "Authentication Failed",
          description: "There was a problem logging in with Discord.",
          variant: "destructive",
        })
      }
    }
    
  
    window.addEventListener('message', handleMessage)
  
    return () => {
      clearInterval(checkPopup)
      window.removeEventListener('message', handleMessage)
    }
  }, [discordWindow, toast, router])
  

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setIsLoading(prev => ({ ...prev, google: true }))
        // Get user info from Google
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` },
        }).then(res => res.json())

        // Create user object
        const user = {
          id: userInfo.sub, 
          username: userInfo.name,
          avatar: userInfo.picture,
          accessToken: response.access_token,
        }

        // Store user data
        localStorage.setItem('formflow_user', JSON.stringify(user))
        localStorage.setItem('google_token', response.access_token)

        router.push('/dashboard')
      } catch (error) {
        console.error('Error during Google login:', error)
        toast({
          title: "Login Error",
          description: "Failed to complete Google login",
          variant: "destructive",
        })
      } finally {
        setIsLoading(prev => ({ ...prev, google: false }))
      }
    },
    onError: () => {
      toast({
        title: "Login Error",
        description: "Failed to login with Google",
        variant: "destructive",
      })
      setIsLoading(prev => ({ ...prev, google: false }))
    },
    flow: 'implicit',
  })

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
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Log in to FluidForms</h1>
            <p className="text-gray-400">Sign in to continue to FluidForms</p>
          </div>
          
          <div className="space-y-4">
            <Button
              onClick={handleDiscordLogin}
              disabled={isLoading.discord}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white relative"
            >
              {isLoading.discord ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center bg-indigo-600">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span className="ml-2">Connecting to Discord...</span>
                  </div>
                </>
              ) : (
                <>
                  <FaDiscord className="h-5 w-5 mr-2" />
                  Continue with Discord
                </>
              )}
            </Button>

            <Button
              onClick={() => handleGoogleLogin()}
              disabled={isLoading.google}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 relative"
            >
              {isLoading.google ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center bg-white">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
                    <span className="ml-2 text-gray-900">Connecting to Google...</span>
                  </div>
                </>
              ) : (
                <>
                  <FcGoogle className="h-5 w-5 mr-2" />
                  Continue with Google
                </>
              )}
            </Button>
          </div>

          <p className="text-sm text-gray-400">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-indigo-400 hover:text-indigo-300">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}