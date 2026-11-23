import { redirect } from "next/navigation"
import { privacyLinks } from "@/lib/privacy-links"

export default function PrivacyPage() {
  redirect(privacyLinks.en)
}
