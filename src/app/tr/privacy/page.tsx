import type { Metadata } from "next"
import { PrivacyPolicy } from "@/components/privacy-policy"

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "Money Manager uygulama verilerini nasıl saklar; site istekleri ve gizlilik başvuruları nasıl işlenir.",
}

export default function TurkishPrivacyPage() {
  return <PrivacyPolicy locale="tr" />
}
