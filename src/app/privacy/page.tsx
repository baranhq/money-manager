import type { Metadata } from "next"
import { PrivacyPolicy } from "@/components/privacy-policy"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Money Manager stores app data and how website requests and privacy enquiries are handled.",
}

export default function PrivacyPage() {
  return <PrivacyPolicy locale="en" />
}
