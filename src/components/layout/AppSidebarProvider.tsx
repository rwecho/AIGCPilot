"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"

export function AppSidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-open')
    if (saved !== null) {
      setOpen(saved === 'true')
    }
    setMounted(true)
  }, [])

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    localStorage.setItem('sidebar-open', String(isOpen))
  }

  // 防止初次渲染时的闪烁
  if (!mounted) return <div className="flex h-screen w-full bg-background" />

  return (
    <SidebarProvider open={open} onOpenChange={handleOpenChange}>
      {children}
    </SidebarProvider>
  )
}
