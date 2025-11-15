import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Edit, Trash2, Users } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';

type Project = {
    id: number;
    name: string;
    description: string;
    status: 'active' | 'completed' | 'archived';
    members: number;
    tasks: number;
    completedTasks: number;
    progress: number;
    startDate: string;
    endDate: string;
    createdBy: string;
};

const testProjects: Project[] = [
    {
        id: 1,
        name: 'E-Commerce Platform',
        description: 'Build modern e-commerce solution',
        status: 'active',
        members: 8,
        tasks: 45,
        completedTasks: 28,
        progress: 62,
        startDate: '2024-01-15',
        endDate: '2024-12-31',
        createdBy: 'John Doe',
    },
    {
        id: 2,
        name: 'Mobile App Development',
        description: 'Cross-platform mobile application',
        status: 'active',
        members: 5,
        tasks: 32,
        completedTasks: 15,
        progress: 47,
        startDate: '2024-03-01',
        endDate: '2024-11-30',
        createdBy: 'Jane Smith',
    },
    {
        id: 3,
        name: 'CRM System',
        description: 'Customer relationship management',
        status: 'completed',
        members: 6,
        tasks: 28,
        completedTasks: 28,
        progress: 100,
        startDate: '2023-09-01',
        endDate: '2024-03-31',
        createdBy: 'Bob Wilson',
    },
    {
        id: 4,
        name: 'Analytics Dashboard',
        description: 'Real-time analytics platform',
        status: 'active',
        members: 4,
        tasks: 22,
        completedTasks: 8,
        progress: 36,
        startDate: '2024-05-01',
        endDate: '2024-10-31',
        createdBy: 'Alice Brown',
    },
    {
        id: 5,
        name: 'Legacy System Migration',
        description: 'Migrate old systems to cloud',
        status: 'archived',
        members: 3,
        tasks: 15,
        completedTasks: 15,
        progress: 100,
        startDate: '2023-06-01',
        endDate: '2023-12-31',
        createdBy: 'Charlie Davis',
    },
];

const columns: ColumnDef<Project>[] = [
    {
        accessorKey: 'name',
        header: 'Project Name',
        cell: ({ row }) => {
            return (
                <div>
                    <div className="font-medium">{row.getValue('name')}</div>
                    <div className="text-sm text-muted-foreground">{row.original.description}</div>
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
                active: 'default',
                completed: 'secondary',
                archived: 'outline',
            };
            return <Badge variant={variants[status]}>{status}</Badge>;
        },
    },
    {
        accessorKey: 'progress',
        header: 'Progress',
        cell: ({ row }) => {
            const progress = row.getValue('progress') as number;
            return (
                <div className="flex items-center gap-2">
                    <Progress value={progress} className="w-[60px]" />
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'members',
        header: 'Members',
        cell: ({ row }) => (
            <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                {row.getValue('members')}
            </div>
        ),
    },
    {
        accessorKey: 'tasks',
        header: 'Tasks',
        cell: ({ row }) => {
            const tasks = row.getValue('tasks') as number;
            const completed = row.original.completedTasks;
            return (
                <div className="text-sm">
                    {completed}/{tasks}
                </div>
            );
        },
    },
    {
        accessorKey: 'endDate',
        header: 'End Date',
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const project = row.original;
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
                            Edit project
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete project
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function ProjectsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Manage all projects in the system</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                </Button>
            </div>
            <DataTable columns={columns} data={testProjects} />
        </div>
    );
}