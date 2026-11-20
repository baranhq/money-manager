import type { Metadata } from "next"
import { ChevronDown, Download, ExternalLink } from "lucide-react"
import { NoticeLayout } from "@/components/notice-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import inventory from "@/generated/licenses.json"

export const metadata: Metadata = { title: "Licenses", description: "Third-party software, fonts, and icon licences for Money Manager." }

export default function LicensesPage() {
  return <NoticeLayout title="Licenses" description="Third-party software, fonts and icons used in Money Manager.">
    <Card className="gap-0 divide-y px-4 py-0 shadow-none sm:px-5">
      <section aria-labelledby="assets-and-components" className="space-y-3 py-5">
        <h2 id="assets-and-components" className="text-xl font-semibold tracking-tight">Third-party notices</h2>
        <div className="space-y-2">
          {inventory.featured.map(item => <div key={item.name} className="rounded-lg border">
            <details className="group">
              <summary className="flex min-h-14 list-none items-center justify-between gap-3 rounded-xl px-4 py-2 [&::-webkit-details-marker]:hidden">
                <span><strong className="block text-sm">{item.name}</strong><span className="text-xs text-muted-foreground">{item.version} · {item.licence}</span></span>
                <ChevronDown size={16} className="shrink-0 text-muted-foreground group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="space-y-3 border-t p-4">
                <a href={item.source} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4">Upstream source <ExternalLink size={13} /></a>
                <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">{item.text}</pre>
              </div>
            </details>
          </div>)}
        </div>
      </section>
      <section aria-labelledby="software-and-tools" className="space-y-3 py-5">
        <h2 id="software-and-tools" className="text-xl font-semibold tracking-tight">Licence text and attribution</h2>
        <p className="text-sm text-muted-foreground">The complete notices include the licence texts and attributions for dependencies, build tools and the components bundled with Next.js.</p>
        <Button asChild variant="outline" className="min-h-11"><a href="/third-party-notices.txt" download><Download /> Download complete notices</a></Button>
        <details className="group rounded-xl border bg-card">
          <summary className="flex min-h-12 list-none items-center justify-between gap-2 rounded-xl px-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
            All packages <ChevronDown size={16} className="group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="overflow-hidden rounded-b-xl border-t">
            <Table><TableHeader><TableRow><TableHead>Package</TableHead><TableHead>Licence</TableHead><TableHead className="hidden sm:table-cell">Use</TableHead></TableRow></TableHeader>
              <TableBody>{inventory.packages.map((item, index) => <TableRow key={`${item.name}-${index}`}>
                <TableCell className="max-w-48 whitespace-normal [overflow-wrap:anywhere] sm:max-w-none">
                  <a href={item.source} className="text-primary underline underline-offset-4">{item.name}</a>
                  <span className="block text-xs text-muted-foreground">{item.version}<span className="sm:hidden"> · {item.scope}</span></span>
                </TableCell>
                <TableCell className="max-w-28 whitespace-normal [overflow-wrap:anywhere]">{item.licence}</TableCell>
                <TableCell className="hidden sm:table-cell">{item.scope}</TableCell>
              </TableRow>)}</TableBody>
            </Table>
          </div>
        </details>
      </section>
    </Card>
  </NoticeLayout>
}
