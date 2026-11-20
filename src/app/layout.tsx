import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { connection } from "next/server"
import { Appearance } from "@/components/appearance"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: "Baran’s Money Manager", template: "%s · Money Manager" },
  description: "Manage transactions, budgets and savings in your browser.",
  robots: { index: false, follow: false },
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await connection()
  return (
    <html lang="en-GB" className={GeistSans.variable}>
      <body><Appearance />{children}</body>
    </html>
  )
}
