import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, MoreHorizontal, Trash2, UserCheck, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { User } from "@/api/user.service";

interface ColumnActions {
    onDelete: (user: User) => void;
    onToggleStatus: (user: User) => void;
}

export const createColumns = (actions: ColumnActions): ColumnDef<User>[] => [
    {
        accessorKey: 'username',
        header: 'Username',
    },
    {
        accessorKey: 'full_name',
        header: 'Full Name',
        cell: ({ row }) => {
            const fullName = row.getValue('full_name') as string;
            return fullName || '-';
        },
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
        accessorKey: 'project_count',
        header: 'Projects',
        cell: ({ row }) => {
            const count = row.getValue('project_count') as number;
            return count || 0;
        },
    },
    {
        accessorKey: 'task_count',
        header: 'Tasks',
        cell: ({ row }) => {
            const count = row.getValue('task_count') as number;
            return count || 0;
        },
    },
    {
        accessorKey: 'date_joined',
        header: 'Date Joined',
        cell: ({ row }) => {
            const date = row.getValue('date_joined') as string;
            return new Date(date).toLocaleDateString();
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const user = row.original;
            const isActive = user.status === 'active' || user.is_active;
            const navigate = useNavigate();

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
                        <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit user
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => actions.onToggleStatus(user)}>
                            {isActive ? (
                                <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Deactivate
                                </>
                            ) : (
                                <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Activate
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => actions.onDelete(user)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete user
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];