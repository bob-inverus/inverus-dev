"use client"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Settings2, Search, Users, X } from "lucide-react"
import { useState } from "react"

type Service = {
  id: string
  name: string
  shortName: string
  icon: React.ComponentType<{ className?: string }>
}

const services: Service[] = [
  {
    id: "harvestor",
    name: "Power of Internet",
    shortName: "Harvestor",
    icon: Search,
  },
  {
    id: "consortium",
    name: "Power of Network",
    shortName: "Consortium",
    icon: Users,
  }
]

type ButtonToolsProps = {
  selectedService?: string
  onServiceChange?: (serviceId: string) => void
  className?: string
}

export function ButtonTools({ 
  selectedService, 
  onServiceChange,
  className 
}: ButtonToolsProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const handleServiceSelect = (serviceId: string) => {
    onServiceChange?.(serviceId)
    setIsPopoverOpen(false)
  }

  const selectedServiceData = services.find(s => s.id === selectedService)
  const ActiveServiceIcon = selectedServiceData?.icon

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "border-border dark:bg-secondary size-9 rounded-full border bg-transparent flex items-center justify-center transition-colors hover:bg-accent dark:hover:bg-[#515151] focus-visible:outline-none focus-visible:ring-ring",
                  className
                )}
                aria-label="Select Service"
              >
                <Settings2 className="size-4" />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Select Service</TooltipContent>
        </Tooltip>
        <PopoverContent 
          side="top" 
          align="start"
          className="w-64 rounded-xl bg-popover dark:bg-[#303030] p-2 text-popover-foreground dark:text-white"
        >
          <div className="flex flex-col gap-1">
            {services.map(service => (
              <button 
                key={service.id} 
                onClick={() => handleServiceSelect(service.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md p-2 text-left text-sm transition-colors",
                  selectedService === service.id 
                    ? "bg-accent dark:bg-[#515151] hover:bg-accent/80 dark:hover:bg-[#454545]"
                    : "hover:bg-accent dark:hover:bg-[#515151]"
                )}
              >
                <service.icon className="h-4 w-4" />
                <span>{service.name}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {selectedServiceData && (
        <>
          <div className="h-6 w-px bg-border dark:bg-gray-600 self-center" />
          <button 
            onClick={() => onServiceChange?.("")}
            className="flex h-8 items-center gap-2 rounded-full px-2 text-sm bg-accent dark:bg-[#3b4045] hover:bg-accent/80 dark:hover:bg-[#2e3338] cursor-pointer dark:text-[#99ceff] text-[#2294ff] transition-colors"
          >
            {ActiveServiceIcon && <ActiveServiceIcon className="h-4 w-4" />}
            {selectedServiceData.shortName}
            <X className="h-4 w-4" />
          </button>
        </>
      )}
    </>
  )
} 