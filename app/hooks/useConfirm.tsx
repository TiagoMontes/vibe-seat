"use client"

import { useState } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface ConfirmOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    description: "",
  })
  const [resolveCallback, setResolveCallback] = useState<((value: boolean) => void) | null>(null)

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(options)
      setIsOpen(true)
      setResolveCallback(() => resolve)
    })
  }

  const handleConfirm = () => {
    setIsOpen(false)
    if (resolveCallback) {
      resolveCallback(true)
      setResolveCallback(null)
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    if (resolveCallback) {
      resolveCallback(false)
      setResolveCallback(null)
    }
  }

  const ConfirmComponent = () => (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleCancel()
        }
      }}
      title={options.title}
      description={options.description}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      destructive={options.destructive}
      onConfirm={handleConfirm}
    />
  )

  return { confirm, ConfirmComponent }
}