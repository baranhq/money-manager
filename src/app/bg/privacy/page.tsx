import type { Metadata } from "next"
import { PrivacyPolicy } from "@/components/privacy-policy"

export const metadata: Metadata = {
  title: "Политика за поверителност",
  description: "Как Baran’s Money Manager обработва информацията, когато използвате приложението.",
}

export default function BulgarianPrivacyPage() {
  return <PrivacyPolicy locale="bg" />
}
