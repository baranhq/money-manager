import type { Metadata } from "next"
import { NoticeLayout } from "@/components/notice-layout"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = { title: "Privacy Policy" }

export default function PrivacyPage() {
  return <NoticeLayout title="Privacy Policy" description="How this version of Money Manager handles your information.">
    <div className="space-y-4">
      <Card className="gap-2 bg-accent/60 p-5 shadow-none">
        <h2 className="font-semibold">Profiles and records stay in your browser</h2>
        <p className="text-sm leading-relaxed">Money Manager uses this browser’s IndexedDB to remember profile names, selected avatar colours and vector icons, accounts and opening balances, transactions, categories, budgets, savings pots, dated deposits and withdrawals, and preferences. The browser also saves your setup draft until you finish or skip setup, then stores the completion state so setup opens only once. A deposit reduces Available to spend; a withdrawal adds that amount back. Each profile has a separate local ledger. Calculations and file checks take place in your browser; the app has no online sign-in, analytics, advertising or cloud sync. You can set a local site password to lock the app in this browser. That lock alone does not encrypt browser storage. Optional storage encryption encrypts all local profiles and records; the browser decrypts them after the password is entered. The password is not sent to a server. The lock protects against casual access, not someone who can inspect or change this browser profile or the app. Over plain HTTP, someone who can change network traffic could replace the app page or capture a password; use HTTPS before relying on password protection. There is no password reset: a forgotten password cannot decrypt stored data, and clearing site data to remove a lock-only password erases the local records.</p>
        <p className="text-sm leading-relaxed">This browser remembers whether you were offered, completed or skipped the optional app tour. That choice is stored separately from your ledger in browser local storage. You can replay the tour from Settings.</p>
      </Card>
      <Card className="gap-2 p-5 shadow-none">
        <h2 className="font-semibold">Control your records and copies</h2>
        <p className="text-sm leading-relaxed">Use <a href="/#accounts" className="font-medium text-primary underline underline-offset-4">Settings → Profiles</a> to switch or personalise profiles. Use <a href="/#security" className="font-medium text-primary underline underline-offset-4">Settings → Security</a> to set the site password and choose whether to encrypt this browser’s records. Use <a href="/#data" className="font-medium text-primary underline underline-offset-4">Settings → Data &amp; backup</a> to back up or clear the selected profile’s financial records. Backups contain that profile’s ledger, not its name or avatar. JSON backups include accounts and opening balances. CSV exports contain transactions. Both formats can be password-protected. Ordinary copies are readable files; for a protected copy, keep its password separately. Clearing site data or losing access to this browser can erase all profiles and records. There is no password reset for encrypted local data; if you lose the password, it cannot be decrypted. Keep any backup somewhere private and delete it separately when you no longer need it.</p>
      </Card>
      <Card className="gap-2 p-5 shadow-none">
        <h2 className="font-semibold">Hosting</h2>
        <p className="text-sm leading-relaxed">This notice describes the app in private development. Hosting providers may process information about ordinary page requests, such as your IP address. Provider, contact, retention and rights information must be confirmed for the public installation before release.</p>
      </Card>
    </div>
  </NoticeLayout>
}
