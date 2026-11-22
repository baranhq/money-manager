import type { Metadata } from "next"
import { PrivacyPolicy } from "@/components/privacy-policy"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Baran’s Money Manager handles information when you use the app.",
}

export default function PrivacyPage() {
  return <PrivacyPolicy locale="en" />
}
