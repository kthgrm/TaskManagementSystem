import React from "react"
import { type LucideIcon } from "lucide-react"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { useNavigate } from "react-router-dom"
import { Avatar } from "./ui/avatar"

export function NavProjects({
    items,
    ...props
}: {
    items: {
        title: string
        url: string
        badge?: React.ReactNode
    }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    const { isMobile } = useSidebar()
    const navigate = useNavigate()
    const [activeProject, setActiveProject] = React.useState(items[0])

    if (!activeProject) {
        return null
    }

    const handleProjectChange = (project: typeof items[0]) => {
        setActiveProject(project)
        navigate(project.url)
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }
    return (
        <SidebarGroup {...props}>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                                <a href={item.url}>
                                    <Avatar className="bg-violet-500 text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg text-xs font-semibold">
                                        {getInitials(item.title)}
                                    </Avatar>
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                            {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
