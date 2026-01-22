// app/auth/page.tsx

import { Suspense } from "react"
// এখানে { AuthForm } ব্যবহার করুন যদি ফাইলে 'export function AuthForm' থাকে
import { AuthForm } from "@/components/auth-form" 
import AuthLoading from "./loading" // অথবা আপনার লোডিং কম্পোনেন্ট

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center p-4">
      <Suspense fallback={<AuthLoading />}>
        <AuthForm />
      </Suspense>
    </div>
  )
}
