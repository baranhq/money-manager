import Image from "next/image"
import wordmark from "@/logo/Baran's _Money_Manager.svg"
import { cn } from "@/lib/utils"

export function BrandLogo({ className }: { className?: string }) {
  return <Image src={wordmark} alt="Baran’s Money Manager" className={cn("h-auto w-48 max-w-full", className)} />
}
