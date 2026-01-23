"use client"

import { User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface UserAvatarProps {
  avatarUrl?: string | null
  name?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-base",
  xl: "w-40 h-40 text-2xl",
}

export default function UserAvatar({ 
  avatarUrl, 
  name, 
  size = "md",
  className 
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false)
  const sizeClass = sizeClasses[size]
  
  // If avatar URL exists and hasn't errored out, show the image
  if (avatarUrl && !imageError) {
    return (
      <div className={cn("relative rounded-full overflow-hidden bg-slate-800", sizeClass, className)}>
        <img 
          src={avatarUrl} 
          alt={name || "User"} 
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    )
  }
  
  // Default/Fallback: show user icon
  return (
    <div className={cn(
      "rounded-full bg-slate-800 flex items-center justify-center border border-white/10",
      sizeClass,
      className
    )}>
      <User className="w-1/2 h-1/2 text-slate-500" />
    </div>
  )
}
