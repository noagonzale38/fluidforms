"use client"

import { useState, useEffect } from "react"

interface GradientTextCyclerProps {
  phrases: string[]
  interval?: number
  className?: string
}

export function GradientTextCycler({ phrases, interval = 3000, className = "" }: GradientTextCyclerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % phrases.length)
        setIsTransitioning(false)
      }, 500) // Half a second for fade out/in transition
    }, interval)

    return () => clearInterval(timer)
  }, [phrases, interval])

  return (
    <span
      className={`bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent transition-opacity duration-500 ${
        isTransitioning ? "opacity-0" : "opacity-100"
      } ${className}`}
    >
      {phrases[currentIndex]}
    </span>
  )
}

