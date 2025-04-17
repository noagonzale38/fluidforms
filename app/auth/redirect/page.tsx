"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DiscordRedirect() {
    const router = useRouter()

    useEffect(() => {
        window.location.href = "https://discord.com/oauth2/authorize?client_id=1355768994312749117&response_type=code&redirect_uri=https%3A%2F%2Fstaging.fluidforms.org%2Fapi%2Fdiscord%2Fcallback&scope=email+identify"
    }, [])
}
