"use client"

import * as React from "react"
import {
  LayoutDashboard,
  ListChecks,
  FolderKanban,
  BarChart3,
  ClipboardList,
  UsersRound,
  FileText,
  icons,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { ProjectSwitcher } from "@/components/project-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import { useAuth } from "@/contexts/AuthContext"
import { NavHead } from "./nav-head"
import { NavProjects } from "./nav-projects"

// Admin navigation items - full system access
const adminNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/admin/dashboard" },
  { title: "Users", icon: UsersRound, url: "/admin/users" },
  { title: "Projects", icon: FolderKanban, url: "/admin/projects" },
  { title: "Tasks", icon: ClipboardList, url: "/admin/tasks" },
  { title: "Reports", icon: FileText, url: "/admin/reports" },
  { title: "Audit Trail", icon: BarChart3, url: "/admin/audit-trail" },
]

// User navigation items - limited to own tasks and projects
const userNavItems = [
  { title: "Home", icon: LayoutDashboard, url: "/user/dashboard" },
  { title: "My Tasks", icon: ListChecks, url: "/user/tasks" },
]

// Sample projects - can be fetched from API based on user
const sampleProjects = [
  { title: "Authentication System", url: "/project/1" },
  { title: "UI Redesign", url: "/project/2" },
  { title: "Payment Gateway", url: "/project/3" },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  // Determine navigation items based on user role
  const navItems = React.useMemo(() => {
    if (!user?.role) return userNavItems;
    return user.role === 'admin' ? adminNavItems : userNavItems;
  }, [user?.role]);

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="mt-2">
        <NavHead />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        {user?.role === 'user' && <NavProjects items={sampleProjects} />}
        <NavUser user={user} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
