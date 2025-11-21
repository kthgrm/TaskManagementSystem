import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SortableHeader } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { User } from "@/api/user.service";

interface ColumnActions {
    onDelete: (user: User) => void;
    onToggleStatus: (user: User) => void;
}

export const createColumns = (actions: ColumnActions): ColumnDef<User>[] => [
    {
        accessorKey: 'username',
        header: ({ column }) => <SortableHeader column={column}>Username</SortableHeader>,
    },
    {
        accessorKey: 'full_name',
        header: ({ column }) => <SortableHeader column={column}>Full Name</SortableHeader>,
        cell: ({ row }) => {
            const fullName = row.getValue('full_name') as string;
            return fullName || '-';
        },
    },
    {
        accessorKey: 'email',
        header: ({ column }) => <SortableHeader column={column}>Email</SortableHeader>,
    },
    {
        accessorKey: 'role',
        header: ({ column }) => <SortableHeader column={column}>Role</SortableHeader>,
        cell: ({ row }) => {
            const role = row.getValue('role') as string;
            return (
                <Badge variant={role === 'admin' ? 'default' : 'secondary'} className={role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                    {role.toUpperCase()}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'is_active',
        header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
        cell: ({ row }) => {
            const user = row.original;
            const isActive = user.is_active ?? (user.status === 'active');
            return (
                <Badge variant={isActive ? 'default' : 'destructive'} className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {isActive ? 'Active' : 'Inactive'}
                </Badge>
            );
        }
    },
    {
        accessorKey: 'date_joined',
        header: ({ column }) => <SortableHeader column={column}>Date Joined</SortableHeader>,
        cell: ({ row }) => {
            const date = row.getValue('date_joined') as string;
            return new Date(date).toLocaleDateString();
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const user = row.original;
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