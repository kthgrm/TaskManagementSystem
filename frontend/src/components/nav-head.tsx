import React from 'react'
import { SidebarMenuButton } from './ui/sidebar'

export const NavHead = () => {
    return (
        <SidebarMenuButton size="lg" asChild>
            <a href="/">
                <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <img src="/src/assets/tuesday.svg" alt="Tuesday Logo" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium text-xl">uesday</span>
                </div>
            </a>
        </SidebarMenuButton>
    )
}
