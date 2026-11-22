import type { Metadata } from "next"
import { PrivacyPolicy } from "@/components/privacy-policy"

export const metadata: Metadata = {
  title: "Политика за поверителност",
  description: "Как Money Manager съхранява данните в приложението и как се обработват заявките към сайта и запитванията за поверителност.",
}

export default function BulgarianPrivacyPage() {
  return <PrivacyPolicy locale="bg" />
}
