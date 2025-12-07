import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"
import { SessionContextProvider } from "@/lib/session-context"
import "./globals.css"

const _inter = Inter({ subsets: ["latin", "greek"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ftiaxesite.gr - Website Builder",
  description: "Build beautiful websites with our easy-to-use CMS platform",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f11" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <SessionContextProvider>
          {children}
          <Analytics />
        </SessionContextProvider>
      </body>
    </html>
  )
}
