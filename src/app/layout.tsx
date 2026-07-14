import type { Metadata, Viewport } from "next"
import "./globals.css"
import AppShell from "@/components/app-shell"
import VisitorNav from "@/components/visitor-nav"
import AutoLogoutProvider from "@/components/auto-logout-provider"
import SwRegister from "@/components/sw-register"
import AddToHomeScreenPrompt from "@/components/add-to-home-screen-prompt"

export const metadata: Metadata = {
  title: "見沼氷川ハーブ園",
  description:
    "見沼氷川公園ハーブ園の植物ガイド。園内のハーブを写真付きで紹介します。",
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "見沼氷川ハーブ園",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#16a34a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <AppShell>{children}</AppShell>
        <VisitorNav />
        <AutoLogoutProvider />
        <SwRegister />
        <AddToHomeScreenPrompt />
      </body>
    </html>
  )
}
