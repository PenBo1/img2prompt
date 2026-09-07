import { Globe, Info, Keyboard, Settings, Sparkles } from "lucide-react"
import { Link, useLocation } from "react-router"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "API Configuration",
    icon: Sparkles,
    path: "/",
  },
  {
    title: "Preferences",
    icon: Settings,
    path: "/preferences",
  },
  {
    title: "Keyboard Shortcuts",
    icon: Keyboard,
    path: "/shortcuts",
  },
  {
    title: "About",
    icon: Info,
    path: "/about",
  },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-5 pt-4">
        <Link to="/" className="flex items-center gap-2">
          <Globe className="size-6 text-primary" />
          <span className="font-semibold text-lg group-data-[state=collapsed]:hidden">
            img2prompt
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                  >
                    <Link to={item.path}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2">
        <div className="text-xs text-muted-foreground group-data-[state=collapsed]:hidden">
          Version 0.0.0
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}