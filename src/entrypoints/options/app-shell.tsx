import type { ReactNode } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"

/**
 * The chrome around every options route: the sidebar and the main column the pages render into.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        {children}
      </SidebarInset>
    </>
  )
}