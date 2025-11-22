import React from "react"
import { useLocation } from "react-router-dom"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar } from "./ui/avatar"
import { getInitials } from "@/lib/utils"

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
    const location = useLocation()

    return (
        <SidebarGroup {...props}>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                                <a href={item.url} className="py-6">
                                    <Avatar className="bg-violet-500 text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg text-xs font-semibold">
                                        {getInitials(item.title)}
                                    </Avatar>
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
