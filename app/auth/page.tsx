// app/auth/page.tsx

import { Suspense } from "react"
// Use { AuthForm } here if the file exports 'export function AuthForm'
import { AuthForm } from "@/components/auth-form" 
import AuthLoading from "./loading" // or your loading component

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center p-4">
      <Suspense fallback={<AuthLoading />}>
        <AuthForm />
      </Suspense>
    </div>
  )
}
