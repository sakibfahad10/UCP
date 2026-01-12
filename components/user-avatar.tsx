"use client"

import { User } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const sizeClass = sizeClasses[size]
  
  // If avatar URL exists, show the image
  if (avatarUrl) {
    return (
      <div className={cn("relative rounded-full overflow-hidden bg-slate-100", sizeClass, className)}>
        <img 
          src={avatarUrl} 
          alt={name || "User"} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, hide it and show fallback
            e.currentTarget.style.display = 'none'
          }}
        />
        {/* Fallback icon in case image fails */}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <User className="w-1/2 h-1/2 text-slate-400" />
        </div>
      </div>
    )
  }
  
  // Default: show user icon
  return (
    <div className={cn(
      "rounded-full bg-slate-100 flex items-center justify-center",
      sizeClass,
      className
    )}>
      <User className="w-1/2 h-1/2 text-slate-400" />
    </div>
  )
}
