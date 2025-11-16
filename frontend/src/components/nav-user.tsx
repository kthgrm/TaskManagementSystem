import {
    ChevronsUpDown,
    LogOut,
    User as UserIcon,
} from "lucide-react"
import { useState } from "react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { LogoutConfirmation } from "@/components/LogoutConfirmation"
import type { User } from "@/types/auth.types"

export function NavUser({
    user,
}: {
    user: User | null
}) {
    const { isMobile } = useSidebar()
    const { logout } = useAuth()
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)

    const handleLogout = () => {
        setShowLogoutDialog(true)
    }

    if (!user) return null;

    const displayName = user.first_name || user.username;
    const avatarUrl = user.profile_picture || "";
    const initials = displayName.substring(0, 2).toUpperCase();

    return (
        <SidebarMenu className="mt-auto p-2">
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={avatarUrl} alt={displayName} />
                                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{displayName}</span>
                                <span className="truncate text-xs">{user.email}</span>
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
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={avatarUrl} alt={displayName} />
                                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{displayName}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <Link to="/profile">
                                <DropdownMenuItem>
                                    <UserIcon />
                                    Profile
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
            <LogoutConfirmation
                open={showLogoutDialog}
                onOpenChange={setShowLogoutDialog}
                onConfirm={logout}
            />
        </SidebarMenu>
    )
}
