import { cn } from "@/lib/utils"

interface HarvestorIconProps {
  className?: string
}

export function HarvestorIcon({ className }: HarvestorIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-5", className)}
    >
      <defs>
        <linearGradient id="harvestor-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      
      {/* Wheat/Harvest symbol */}
      <path
        d="M12 2L14 6L18 4L16 8L20 10L16 12L18 16L14 14L12 18L10 14L6 16L8 12L4 10L8 8L6 4L10 6L12 2Z"
        fill="url(#harvestor-gradient)"
        stroke="currentColor"
        strokeWidth="0.5"
      />
      
      {/* Central core */}
      <circle
        cx="12"
        cy="10"
        r="2"
        fill="#065F46"
        stroke="currentColor"
        strokeWidth="0.5"
      />
      
      {/* Bottom stem */}
      <rect
        x="11.5"
        y="18"
        width="1"
        height="4"
        fill="#065F46"
        rx="0.5"
      />
    </svg>
  )
}
