import type { Metadata } from "next"
import localFont from "next/font/local"
import { connection } from "next/server"
import { Appearance } from "@/components/appearance"
import "./globals.css"

const GeistSans = localFont({
  src: [
    { path: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Regular.woff2", weight: "400" },
    { path: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Medium.woff2", weight: "500" },
    { path: "../../node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.woff2", weight: "600" },
    { path: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Bold.woff2", weight: "700" },
  ],
  variable: "--font-geist-sans",
})

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
