import "./style.css"
import * as React from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createHashRouter, RouterProvider } from "react-router"
import { Toaster } from "@/components/ui/sonner"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import App from "./app"
import { AppShell } from "./app-shell"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

async function initApp() {
  const root = document.getElementById("root")!
  root.className = "antialiased bg-background text-foreground"

  const router = createHashRouter([
    {
      path: "*",
      element: (
        <SidebarProvider>
          <TooltipProvider>
            <QueryClientProvider client={queryClient}>
              <AppShell>
                <App />
              </AppShell>
              <Toaster />
            </QueryClientProvider>
          </TooltipProvider>
        </SidebarProvider>
      ),
    },
  ])

  createRoot(root).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  )
}

void initApp()