"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Plus, Terminal } from "lucide-react"
import { useEffect, useState } from "react"
import { isDeveloper } from "@/lib/auth-utils"

export default function Navbar() {
  const { user, login, logout } = useAuth()
  const [mounted, setMounted] = useState(false)

  // This ensures we only render user-dependent UI after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const isUserDeveloper = mounted && user ? isDeveloper(user.id) : false

  return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            FluidForms
          </span>
          </Link>
          <nav className="flex items-center gap-4">
            {mounted && user ? (
                <>
                  <Link href="/forms/create">
                    <Button variant="outline" className="rounded-full text-base px-4 py-2 h-auto">
                      <Plus className="mr-2 h-5 w-5" /> New Form
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button className="rounded-full text-base px-4 py-2 h-auto">Dashboard</Button>
                  </Link>
                  {isUserDeveloper && (
                      <Link href="/developer">
                        <Button variant="outline" className="rounded-full text-base px-4 py-2 h-auto">
                          <Terminal className="mr-2 h-5 w-5" /> Developer
                        </Button>
                      </Link>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} alt={user.username} />
                          <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.username}</p>
                          <p className="text-xs leading-none text-muted-foreground">Discord ID: {user.id}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {isUserDeveloper && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href="/developer" className="flex items-center gap-2 cursor-pointer">
                                <Terminal className="h-4 w-4" />
                                <span>Developer Dashboard</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                      )}
                      <DropdownMenuItem
                          onClick={logout}
                          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
            ) : (
                <Button onClick={login} className="rounded-full text-base px-6 py-2 h-auto">
                  Sign In
                </Button>
            )}
          </nav>
        </div>
      </header>
  )
}

