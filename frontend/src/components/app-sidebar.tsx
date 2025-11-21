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
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import { useAuth } from "@/contexts/AuthContext"
import { NavHead } from "./nav-head"
import { NavProjects } from "./nav-projects"
import { projectService, type Project } from "@/api/project.service"
import { useProjectRefresh } from "@/contexts/ProjectContext"

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
  { title: "My Projects", icon: FolderKanban, url: "/user/projects" },
  { title: "Reports", icon: BarChart3, url: "/user/reports" },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const { refreshTrigger } = useProjectRefresh();
  const [projects, setProjects] = React.useState<Project[]>([]);

  // Determine navigation items based on user role
  const navItems = React.useMemo(() => {
    if (!user?.role) return userNavItems;
    return user.role === 'admin' ? adminNavItems : userNavItems;
  }, [user?.role]);

  // Fetch user's projects for sidebar
  React.useEffect(() => {
    if (user?.role === 'user') {
      loadProjects();
    }
  }, [user, refreshTrigger]);

  const loadProjects = async () => {
    try {
      const data = await projectService.getAllProjects();
      // Get up to 3 recent projects
      setProjects(data.slice(0, 3));
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const projectItems = projects.map(p => ({
    title: p.title,
    url: `/user/projects/${p.id}`,
  }));

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="mt-2">
        <NavHead />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        {user?.role === 'user' && projects.length > 0 && <NavProjects items={projectItems} />}
        <NavUser user={user} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
