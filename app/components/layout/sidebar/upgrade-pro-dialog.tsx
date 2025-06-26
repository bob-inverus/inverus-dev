"use client"

import { useBreakpoint } from "@/app/hooks/use-breakpoint"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { APP_NAME } from "@/lib/config"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/user-store/provider"
import { useMutation } from "@tanstack/react-query"
import Image from "next/image"

type UpgradeProDialogProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function UpgradeProDialog({
  isOpen,
  setIsOpen,
}: UpgradeProDialogProps) {
  const { user } = useUser()
  const isMobile = useBreakpoint(768)
  const mutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Missing user")

      const supabase = await createClient()
      if (!supabase) throw new Error("Missing supabase")
      const { error } = await supabase.from("feedback").insert({
        message: `I'm interested in upgrading to Pro`,
        user_id: user.id,
      })

      if (error) throw new Error(error.message)
    },
  })

  const renderContent = () => (
    <div className="flex max-h-[70vh] flex-col">
      <div className="relative">
        <Image
          src="/banner_ocean.jpg"
          alt={`Upgrade to ${APP_NAME} Pro`}
          width={400}
          height={128}
          className="h-32 w-full object-cover"
        />
      </div>

      <div className="px-6 pt-4 text-center text-lg leading-tight font-medium">
        Upgrade to {APP_NAME} Pro
      </div>

      <div className="flex-grow overflow-y-auto">
        <div className="px-6 py-4">
          <p className="text-muted-foreground">
            Get access to premium features, unlimited usage, and priority support.
          </p>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-sm">
              <span className="text-green-600 mr-2">✓</span>
              Unlimited conversations
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 mr-2">✓</span>
              Access to premium models
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 mr-2">✓</span>
              Priority support
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 mr-2">✓</span>
              Advanced features
            </div>
          </div>

          <p className="text-muted-foreground mt-5">
            Want to learn more about Pro features?
          </p>
          {mutation.isSuccess ? (
            <div className="mt-5 flex justify-center gap-3">
              <Badge className="bg-green-600 text-white">
                Thanks! We&apos;ll be in touch soon
              </Badge>
            </div>
          ) : (
            <div className="mt-5 flex justify-center gap-3">
              <Button
                className="w-full"
                onClick={() => mutation.mutate()}
                size="sm"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Sending..." : "Get notified about Pro"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="px-0">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Upgrade to Pro</DrawerTitle>
          </DrawerHeader>
          {renderContent()}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="[&>button:last-child]:bg-background gap-0 overflow-hidden rounded-3xl p-0 shadow-xs sm:max-w-md [&>button:last-child]:rounded-full [&>button:last-child]:p-1">
        <DialogHeader className="sr-only">
          <DialogTitle>Upgrade to Pro</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
} 