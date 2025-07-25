import { useAuthActions } from "@convex-dev/auth/react"
import { api } from "@openteam/backend/convex/_generated/api"
import { useQuery } from "convex/react"
import { ChevronsUpDown, LogOut, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Avatar } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { Settings } from "./settings"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

export function NavUser() {
  const user = useQuery(api.auth.me)
  const { isMobile } = useSidebar()
  const { signOut } = useAuthActions()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar image={user?.image} name={user?.name || "User"} className="h-8 w-8 rounded-lg" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar image={user?.image} name={user?.name || "User"} className="h-8 w-8 rounded-lg" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Settings />
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <NavThemeSwitcher />
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                void signOut().catch(() => {
                  toast.error("Failed to log out")
                })
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function NavThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"
  return (
    <div className="relative flex items-center justify-between pr-1 pl-2 text-sm">
      <div className="flex items-center gap-2">
        {isDark ? <MoonIcon className="size-4 text-muted-foreground" /> : <SunIcon className="size-4 text-muted-foreground" />}
        <p className="text-black dark:text-white">Theme</p>
      </div>
      <Select value={theme || "light"} onValueChange={setTheme}>
        <SelectTrigger size="sm">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
