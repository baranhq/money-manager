import type { Metadata } from "next"
import { NoticeLayout } from "@/components/notice-layout"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = { title: "Privacy Policy" }

export default function PrivacyPage() {
  return <NoticeLayout title="Privacy Policy" description="How this version of Money Manager handles your information.">
    <div className="space-y-4">
      <Card className="gap-2 bg-accent/60 p-5 shadow-none">
        <h2 className="font-semibold">Profiles and records stay in your browser</h2>
        <p className="text-sm leading-relaxed">Money Manager uses IndexedDB to remember profile names, selected avatar colours and vector icons, transactions, categories, budgets, savings pots, dated deposits and withdrawals, and preferences. A deposit reduces Available to spend; a withdrawal adds that amount back. Each profile has a separate local ledger. Calculations and file checks take place in your browser; the app has no sign-in, analytics, advertising or cloud sync. Profiles do not have passwords, so anyone with access to this browser can switch between them.</p>
      </Card>
      <Card className="gap-2 p-5 shadow-none">
        <h2 className="font-semibold">Control your records and copies</h2>
        <p className="text-sm leading-relaxed">Use <a href="/#accounts" className="font-medium text-primary underline underline-offset-4">Settings → Profiles</a> to switch or personalise profiles. Use <a href="/#data" className="font-medium text-primary underline underline-offset-4">Settings → Data &amp; backup</a> to back up or clear the selected profile’s financial records. Backups contain that profile’s ledger, not its name or avatar. Clearing site data or losing access to this browser can erase all profiles and records. Backups are readable JSON or CSV files. Store them somewhere private and delete them separately when you no longer need them.</p>
      </Card>
      <Card className="gap-2 p-5 shadow-none">
        <h2 className="font-semibold">Hosting</h2>
        <p className="text-sm leading-relaxed">This notice describes the app in private development. Hosting providers may process information about ordinary page requests, such as your IP address. Provider, contact, retention and rights information must be confirmed for the public installation before release.</p>
      </Card>
    </div>
  </NoticeLayout>
}
