import { ArrowLeft } from "lucide-react"
import { Sidebar } from "@/components/navigation"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { privacyLinks } from "@/lib/privacy-links"

export function NoticeLayout({ title, description, children, lang = "en-GB", backLabel = "About & legal", privacyHref = privacyLinks.en, privacyLabel = "Privacy", licencesLabel = "Licences" }: {
  title: string
  description: string
  children: React.ReactNode
  lang?: string
  backLabel?: string
  privacyHref?: string
  privacyLabel?: string
  licencesLabel?: string
}) {
  return <TooltipProvider>
    <a href="#notice-content" className="sr-only fixed top-2 left-2 z-50 rounded-md bg-primary p-3 text-primary-foreground focus:not-sr-only">Skip to content</a>
    <Sidebar route="about" hrefPrefix="/" />
    <main id="notice-content" lang={lang} className="min-h-dvh px-4 py-5 md:ml-[72px] md:px-6 xl:ml-[246px] xl:px-8">
      <div className="max-w-[700px]">
        <Button variant="outline" className="mb-4 min-h-10 bg-card" asChild><a href="/#about"><ArrowLeft /> {backLabel}</a></Button>
        <h1 className="text-[1.75rem] font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 mb-7 text-sm text-muted-foreground sm:text-base">{description}</p>
        {children}
        <footer lang={lang} className="mt-8 flex gap-4 border-t pt-4 text-sm text-muted-foreground">
          <a href={privacyHref} className="underline underline-offset-4">{privacyLabel}</a>
          <a href="/licenses" className="underline underline-offset-4">{licencesLabel}</a>
        </footer>
      </div>
    </main>
  </TooltipProvider>
}
