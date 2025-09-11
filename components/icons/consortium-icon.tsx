import { cn } from "@/lib/utils"

interface ConsortiumIconProps {
  className?: string
}

export function ConsortiumIcon({ className }: ConsortiumIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-5", className)}
    >
      <defs>
        <linearGradient id="consortium-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      
      {/* Connected network nodes */}
      <circle cx="6" cy="6" r="2" fill="url(#consortium-gradient)" />
      <circle cx="18" cy="6" r="2" fill="url(#consortium-gradient)" />
      <circle cx="6" cy="18" r="2" fill="url(#consortium-gradient)" />
      <circle cx="18" cy="18" r="2" fill="url(#consortium-gradient)" />
      <circle cx="12" cy="12" r="2.5" fill="#1E40AF" />
      
      {/* Connection lines */}
      <path
        d="M6 6L12 12M18 6L12 12M6 18L12 12M18 18L12 12"
        stroke="url(#consortium-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* Outer connections */}
      <path
        d="M6 6L18 6M6 6L6 18M18 6L18 18M6 18L18 18"
        stroke="url(#consortium-gradient)"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  )
}
