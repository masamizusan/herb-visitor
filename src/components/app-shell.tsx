"use client"

import { usePathname } from "next/navigation"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStaff = pathname?.startsWith("/staff")

  return (
    <div
      className={isStaff ? "min-h-dvh" : "max-w-lg mx-auto min-h-dvh"}
      style={{ paddingBottom: "calc(6rem + env(safe-area-inset-bottom, 0px))" }}
    >
      {children}
    </div>
  )
}
