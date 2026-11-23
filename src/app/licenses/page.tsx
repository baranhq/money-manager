import type { Metadata } from "next"
import { ChevronDown, Download, ExternalLink } from "lucide-react"
import { NoticeLayout } from "@/components/notice-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import inventory from "@/generated/licenses.json"

export const metadata: Metadata = { title: "Licenses", description: "Project and third-party software, font, and icon licences for Money Manager." }

export default function LicensesPage() {
  return <NoticeLayout title="Licenses" description="Project and third-party software, fonts and icons used in Money Manager.">
    <Card className="gap-0 divide-y px-4 py-0 shadow-none sm:px-5">
      <section aria-labelledby="project-licence" className="space-y-3 py-5">
        <h2 id="project-licence" className="text-xl font-semibold tracking-tight">Project licence</h2>
        <p className="text-sm text-muted-foreground">Money Manager’s project code is licensed under the GNU Affero General Public License v3.0 only (AGPL-3.0-only). Third-party packages and assets retain their own licences.</p>
        <Button asChild variant="outline" className="min-h-11"><a href="/AGPL-3.0.txt" download><Download /> Download the AGPL v3 licence</a></Button>
        <a href="https://github.com/baranhq/money-manager" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4">Browse the source repository <ExternalLink size={13} aria-hidden="true" /></a>
      </section>
      <section aria-labelledby="third-party-notices" className="space-y-3 py-5">
        <h2 id="third-party-notices" className="text-xl font-semibold tracking-tight">Third-party notices</h2>
        <p className="text-sm text-muted-foreground">This inventory covers bundled assets, copied components and packages. Download the complete licence texts and attribution notices for the listed material.</p>
        <Button asChild variant="outline" className="min-h-11"><a href="/third-party-notices.txt" download><Download /> Download complete notices</a></Button>
        <details className="group/inventory rounded-xl border bg-card">
          <summary className="flex min-h-12 list-none items-center justify-between gap-2 rounded-xl px-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
            All third-party material <ChevronDown size={16} className="group-open/inventory:rotate-180" aria-hidden="true" />
          </summary>
          <div className="overflow-hidden rounded-b-xl border-t">
            <Table><TableHeader><TableRow><TableHead>Material</TableHead><TableHead>Licence</TableHead><TableHead className="hidden sm:table-cell">Use</TableHead></TableRow></TableHeader>
              <TableBody>
                {inventory.featured.map(item => <TableRow key={item.name}>
                  <TableCell className="max-w-48 whitespace-normal [overflow-wrap:anywhere] sm:max-w-none">
                    <details className="group/notice">
                      <summary className="flex min-h-10 list-none cursor-pointer items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
                        <span><strong className="block text-sm">{item.name}</strong><span className="text-xs text-muted-foreground">{item.version}<span className="sm:hidden"> · Bundled asset or copied source</span></span></span>
                        <ChevronDown size={16} className="shrink-0 text-muted-foreground group-open/notice:rotate-180" aria-hidden="true" />
                      </summary>
                      <div className="space-y-3 py-3">
                        <a href={item.source} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4">Upstream source <ExternalLink size={13} /></a>
                        <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">{item.text}</pre>
                      </div>
                    </details>
                  </TableCell>
                  <TableCell className="max-w-28 whitespace-normal [overflow-wrap:anywhere]">{item.licence}</TableCell>
                  <TableCell className="hidden sm:table-cell">Bundled asset or copied source</TableCell>
                </TableRow>)}
                {inventory.packages.map((item, index) => <TableRow key={`${item.name}-${index}`}>
                  <TableCell className="max-w-48 whitespace-normal [overflow-wrap:anywhere] sm:max-w-none">
                    <a href={item.source} className="text-primary underline underline-offset-4">{item.name}</a>
                    <span className="block text-xs text-muted-foreground">{item.version}<span className="sm:hidden"> · {item.scope}</span></span>
                  </TableCell>
                  <TableCell className="max-w-28 whitespace-normal [overflow-wrap:anywhere]">{item.licence}</TableCell>
                  <TableCell className="hidden sm:table-cell">{item.scope}</TableCell>
                </TableRow>)}
              </TableBody>
            </Table>
          </div>
        </details>
      </section>
    </Card>
  </NoticeLayout>
}
