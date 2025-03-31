import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FluidForms - Modern Form Management",
  description: "Create, manage, and analyze forms with ease",
  icons: {
    icon: "https://cdn.discordapp.com/attachments/1222395559843991623/1355733439831081020/Untitled38_20250329224024.png?ex=67ea00a8&is=67e8af28&hm=0e2ee03e52bda82c8e90a2fe81d5acde4c700d584d545ae5c9e07c8950e2227a&",
    apple: "https://cdn.discordapp.com/attachments/1222395559843991623/1355733439831081020/Untitled38_20250329224024.png?ex=67ea00a8&is=67e8af28&hm=0e2ee03e52bda82c8e90a2fe81d5acde4c700d584d545ae5c9e07c8950e2227a&",
  },
    generator: 'next.js'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'
