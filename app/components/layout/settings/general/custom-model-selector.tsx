"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Mail } from "lucide-react"

interface CustomModelSelectorProps {
  selectedModelId: string
  onModelChange: (modelId: string) => void
  className?: string
}

const PREFERENCE_MODELS = [
  {
    id: "harvestor",
    name: "Harvestor",
    description: "Fast and efficient model for general tasks"
  },
  {
    id: "consortium", 
    name: "Consortium",
    description: "Advanced model for complex reasoning"
  }
]

export function CustomModelSelector({ 
  selectedModelId, 
  onModelChange, 
  className 
}: CustomModelSelectorProps) {
  
  const handleRequestCustomModel = () => {
    const subject = "Custom Model Request"
    const body = "Hi,\n\nI would like to request access to a custom model for my inVerus account.\n\nPlease let me know what options are available.\n\nThank you!"
    
    const mailtoUrl = `mailto:support@inverus.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl, '_blank')
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Select value={selectedModelId} onValueChange={onModelChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {PREFERENCE_MODELS.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex flex-col items-start">
                <span className="font-medium">{model.name}</span>
                <span className="text-xs text-muted-foreground">{model.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleRequestCustomModel}
      >
        <Mail className="size-4 mr-2" />
        Request Custom Model
      </Button>
    </div>
  )
}
