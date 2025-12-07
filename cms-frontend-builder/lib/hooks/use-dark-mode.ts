"use client"

import { useState, useEffect } from "react"

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("darkMode")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = stored ? stored === "true" : prefersDark
    setIsDark(shouldBeDark)
    document.documentElement.classList.toggle("dark", shouldBeDark)
  }, [])

  const toggle = () => {
    const newValue = !isDark
    setIsDark(newValue)
    localStorage.setItem("darkMode", String(newValue))
    document.documentElement.classList.toggle("dark", newValue)
  }

  return { isDark, toggle }
}
