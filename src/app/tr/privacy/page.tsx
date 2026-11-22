import type { Metadata } from "next"
import { PrivacyPolicy } from "@/components/privacy-policy"

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "Baran’s Money Manager uygulamasını kullandığınızda bilgilerin nasıl işlendiği.",
}

export default function TurkishPrivacyPage() {
  return <PrivacyPolicy locale="tr" />
}
