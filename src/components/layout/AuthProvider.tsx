"use client"

import { useEffect } from "react"
import { useAppStore } from "@/lib/store/useAppStore"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useAppStore()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .catch(() => setUser(null))
  }, [setUser])

  return <>{children}</>
}
