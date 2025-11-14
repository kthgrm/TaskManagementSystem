"use client"

import * as React from "react"
import {
  LayoutDashboard,
  ListChecks,
  FolderKanban,
  Users,
  Settings,
  BarChart3,
  ClipboardList,
  Folder,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import { useAuth } from "@/contexts/AuthContext"
import { NavProjects } from "./nav-projects"
import { NavHead } from "./nav-head"

// Admin navigation items - full system access
const adminNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/admin/dashboard" },
  { title: "User Management", icon: Users, url: "/admin/users" },
  { title: "All Projects", icon: FolderKanban, url: "/admin/projects" },
  { title: "All Tasks", icon: ClipboardList, url: "/admin/tasks" },
  { title: "Analytics", icon: BarChart3, url: "/admin/analytics" },
  { title: "System Settings", icon: Settings, url: "/admin/settings" },
]

// User navigation items - limited to own tasks and projects
const userNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/user/dashboard" },
  { title: "My Tasks", icon: ListChecks, url: "/user/tasks" },
]

// Sample teams data - can be fetched from API based on user
const sampleTeams = [
  { name: "Team Alpha", logo: Folder, plan: "Pro" },
  { name: "Team Beta", logo: Folder, plan: "Free" },
]

// Sample projects - can be fetched from API based on user
const sampleProjects = [
  { name: "Project One", url: "/projects/1", icon: Folder },
  { name: "Project Two", url: "/projects/2", icon: Folder },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  // Determine navigation items based on user role
  const navItems = React.useMemo(() => {
    if (!user?.profile?.role) return userNavItems;
    return user.profile.role === 'admin' ? adminNavItems : userNavItems;
  }, [user?.profile?.role]);

  // Show team switcher only for users with teams
  const showTeamSwitcher = user?.profile?.role === 'user';

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="mt-2">
        {showTeamSwitcher ? <TeamSwitcher teams={sampleTeams} /> : <NavHead />}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        {user?.profile?.role === 'user' && <NavProjects projects={sampleProjects} />}
        <NavUser user={user} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
