import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

type User = {
    id: number;
    username: string;
    email: string;
    fullName: string;
    role: 'admin' | 'user';
    status: 'active' | 'inactive';
    projectCount: number;
    taskCount: number;
    dateJoined: string;
};

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'username',
        header: 'Username',
    },
    {
        accessorKey: 'fullName',
        header: 'Full Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => {
            const role = row.getValue('role') as string;
            return (
                <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
                    {role.toUpperCase()}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            return (
                <Badge variant={status === 'active' ? 'default' : 'outline'}>
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'projectCount',
        header: 'Projects',
    },
    {
        accessorKey: 'taskCount',
        header: 'Tasks',
    },
    {
        accessorKey: 'dateJoined',
        header: 'Date Joined',
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const user = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                            Copy email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit user
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete user
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];