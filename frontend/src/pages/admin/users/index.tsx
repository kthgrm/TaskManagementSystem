import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, UserPlus, Edit, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

const testUsers: User[] = [
    {
        id: 1,
        username: 'john_doe',
        email: 'john.doe@example.com',
        fullName: 'John Doe',
        role: 'admin',
        status: 'active',
        projectCount: 5,
        taskCount: 23,
        dateJoined: '2024-01-15',
    },
    {
        id: 2,
        username: 'jane_smith',
        email: 'jane.smith@example.com',
        fullName: 'Jane Smith',
        role: 'user',
        status: 'active',
        projectCount: 3,
        taskCount: 15,
        dateJoined: '2024-02-20',
    },
    {
        id: 3,
        username: 'bob_wilson',
        email: 'bob.wilson@example.com',
        fullName: 'Bob Wilson',
        role: 'user',
        status: 'active',
        projectCount: 2,
        taskCount: 8,
        dateJoined: '2024-03-10',
    },
    {
        id: 4,
        username: 'alice_brown',
        email: 'alice.brown@example.com',
        fullName: 'Alice Brown',
        role: 'user',
        status: 'inactive',
        projectCount: 1,
        taskCount: 3,
        dateJoined: '2024-04-05',
    },
    {
        id: 5,
        username: 'charlie_davis',
        email: 'charlie.davis@example.com',
        fullName: 'Charlie Davis',
        role: 'user',
        status: 'active',
        projectCount: 4,
        taskCount: 18,
        dateJoined: '2024-05-12',
    },
];

const columns: ColumnDef<User>[] = [
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

export default function UsersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">Manage system users and their roles</p>
                </div>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>
            <DataTable columns={columns} data={testUsers} />
        </div>
    );
}