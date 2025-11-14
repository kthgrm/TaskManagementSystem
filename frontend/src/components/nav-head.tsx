import React from 'react'
import { SidebarMenuButton } from './ui/sidebar'
import { GalleryVerticalEnd } from 'lucide-react'

export const NavHead = () => {
    return (
        <SidebarMenuButton size="lg" asChild>
            <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium">Tuesday</span>
                    <span className="">v1.0.0</span>
                </div>
            </a>
        </SidebarMenuButton>
    )
}
