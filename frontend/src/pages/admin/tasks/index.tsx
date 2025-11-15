import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Edit, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Task = {
    id: number;
    title: string;
    description: string;
    project: string;
    assignedTo: string;
    assignedToAvatar?: string;
    status: 'todo' | 'in_progress' | 'in_review' | 'completed' | 'blocked';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate: string;
    createdBy: string;
    createdAt: string;
};

const testTasks: Task[] = [
    {
        id: 1,
        title: 'Implement user authentication',
        description: 'Add JWT-based authentication system',
        project: 'E-Commerce Platform',
        assignedTo: 'John Doe',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2024-12-20',
        createdBy: 'Jane Smith',
        createdAt: '2024-11-01',
    },
    {
        id: 2,
        title: 'Design database schema',
        description: 'Create ER diagrams and database models',
        project: 'Mobile App Development',
        assignedTo: 'Jane Smith',
        status: 'completed',
        priority: 'high',
        dueDate: '2024-11-15',
        createdBy: 'Bob Wilson',
        createdAt: '2024-10-25',
    },
    {
        id: 3,
        title: 'Setup CI/CD pipeline',
        description: 'Configure GitHub Actions for deployment',
        project: 'E-Commerce Platform',
        assignedTo: 'Bob Wilson',
        status: 'todo',
        priority: 'medium',
        dueDate: '2024-12-25',
        createdBy: 'John Doe',
        createdAt: '2024-11-10',
    },
    {
        id: 4,
        title: 'Write API documentation',
        description: 'Document all REST API endpoints',
        project: 'CRM System',
        assignedTo: 'Alice Brown',
        status: 'in_review',
        priority: 'low',
        dueDate: '2024-12-18',
        createdBy: 'Charlie Davis',
        createdAt: '2024-11-05',
    },
    {
        id: 5,
        title: 'Fix payment gateway bug',
        description: 'Resolve issue with Stripe integration',
        project: 'E-Commerce Platform',
        assignedTo: 'Charlie Davis',
        status: 'completed',
        priority: 'urgent',
        dueDate: '2024-11-16',
        createdBy: 'John Doe',
        createdAt: '2024-11-12',
    },
    {
        id: 6,
        title: 'Create landing page',
        description: 'Design and implement homepage',
        project: 'Mobile App Development',
        assignedTo: 'Jane Smith',
        status: 'in_progress',
        priority: 'medium',
        dueDate: '2024-12-22',
        createdBy: 'Alice Brown',
        createdAt: '2024-11-08',
    },
];

const columns: ColumnDef<Task>[] = [
    {
        accessorKey: 'title',
        header: 'Task',
        cell: ({ row }) => {
            return (
                <div className="max-w-[300px]">
                    <div className="font-medium">{row.getValue('title')}</div>
                    <div className="text-sm text-muted-foreground truncate">
                        {row.original.description}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'project',
        header: 'Project',
    },
    {
        accessorKey: 'assignedTo',
        header: 'Assigned To',
        cell: ({ row }) => {
            const assignedTo = row.getValue('assignedTo') as string;
            const initials = assignedTo
                .split(' ')
                .map((n) => n[0])
                .join('');
            return (
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={row.original.assignedToAvatar} />
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{assignedTo}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
                todo: 'outline',
                in_progress: 'default',
                in_review: 'secondary',
                completed: 'secondary',
                blocked: 'destructive',
            };
            return (
                <Badge variant={variants[status]}>
                    {status.replace('_', ' ')}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => {
            const priority = row.getValue('priority') as string;
            const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
                low: 'outline',
                medium: 'secondary',
                high: 'default',
                urgent: 'destructive',
            };
            return (
                <Badge variant={variants[priority]}>
                    {priority}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'dueDate',
        header: 'Due Date',
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const task = row.original;
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
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit task
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete task
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function TasksPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-muted-foreground">Manage all tasks across projects</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Task
                </Button>
            </div>
            <DataTable columns={columns} data={testTasks} />
        </div>
    );
}