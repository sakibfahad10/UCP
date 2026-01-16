import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "sonner" // For showing success/error messages

export const metadata: Metadata = {
  title: "UCP - Code. Compete. Conquer.",
  description:
    "Join a competitive programming platform with live contests, integrated IDE, and global leaderboards. Code, compete, and conquer.",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-favicon.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
          {/* Toaster added here so toast.success works from AuthForm */}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  )
}
