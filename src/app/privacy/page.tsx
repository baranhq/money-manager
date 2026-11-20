import type { Metadata } from "next"
import { NoticeLayout } from "@/components/notice-layout"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = { title: "Privacy Policy" }

export default function PrivacyPage() {
  return <NoticeLayout title="Privacy Policy" description="How this version of Money Manager handles your information.">
    <div className="space-y-4">
      <Card className="gap-2 bg-accent/60 p-5 shadow-none">
        <h2 className="font-semibold">Financial records stay in your browser</h2>
        <p className="text-sm leading-relaxed">Money Manager uses IndexedDB to remember transactions, categories, budgets, savings goals, contributions and preferences. All calculations and file checks take place in your browser. The app has no sign-in, analytics, advertising or cloud sync.</p>
      </Card>
      <Card className="gap-2 p-5 shadow-none">
        <h2 className="font-semibold">Control your records and copies</h2>
        <p className="text-sm leading-relaxed">Use <a href="/#data" className="font-medium text-primary underline underline-offset-4">Settings → Data &amp; backup</a> to download a copy or clear financial records. Clearing site data or losing access to a browser profile can erase your saved records. Backups are readable JSON or CSV files. Store them somewhere private and delete them separately when you no longer need them.</p>
      </Card>
      <Card className="gap-2 p-5 shadow-none">
        <h2 className="font-semibold">Hosting</h2>
        <p className="text-sm leading-relaxed">This notice describes the app in private development. Hosting providers may process information about ordinary page requests, such as your IP address. Provider, contact, retention and rights information must be confirmed for the public installation before release.</p>
      </Card>
    </div>
  </NoticeLayout>
}
