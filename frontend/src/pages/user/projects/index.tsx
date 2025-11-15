import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Search, FolderKanban, Users, ListTodo, Calendar } from 'lucide-react';

type Project = {
    id: number;
    name: string;
    description: string;
    status: 'active' | 'on_hold' | 'completed';
    role: 'member' | 'lead';
    totalTasks: number;
    completedTasks: number;
    members: number;
    startDate: string;
    dueDate: string;
};

// Test data
const testProjects: Project[] = [
    {
        id: 1,
        name: "Authentication System",
        description: "Implement OAuth 2.0 and improve security measures",
        status: "active",
        role: "lead",
        totalTasks: 12,
        completedTasks: 8,
        members: 5,
        startDate: "2024-11-01",
        dueDate: "2024-12-31"
    },
    {
        id: 2,
        name: "UI Redesign",
        description: "Complete overhaul of the user interface",
        status: "active",
        role: "member",
        totalTasks: 10,
        completedTasks: 3,
        members: 8,
        startDate: "2024-11-15",
        dueDate: "2025-01-15"
    },
    {
        id: 3,
        name: "Payment Gateway",
        description: "Integrate multiple payment providers",
        status: "active",
        role: "member",
        totalTasks: 6,
        completedTasks: 1,
        members: 3,
        startDate: "2024-12-01",
        dueDate: "2024-12-20"
    },
    {
        id: 4,
        name: "Mobile App Development",
        description: "Create iOS and Android applications",
        status: "on_hold",
        role: "member",
        totalTasks: 20,
        completedTasks: 5,
        members: 6,
        startDate: "2024-10-01",
        dueDate: "2025-02-28"
    },
    {
        id: 5,
        name: "Backend Optimization",
        description: "Improve API performance and database queries",
        status: "completed",
        role: "lead",
        totalTasks: 8,
        completedTasks: 8,
        members: 4,
        startDate: "2024-10-15",
        dueDate: "2024-11-30"
    },
];

const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        active: "default",
        on_hold: "secondary",
        completed: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace('_', ' ')}</Badge>;
};

const getRoleBadge = (role: string) => {
    return (
        <Badge variant={role === 'lead' ? 'default' : 'secondary'}>
            {role}
        </Badge>
    );
};

const columns: ColumnDef<Project>[] = [
    {
        accessorKey: "name",
        header: "Project",
        cell: ({ row }) => (
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{row.original.name}</span>
                </div>
                <div className="text-sm text-muted-foreground line-clamp-1">
                    {row.original.description}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "role",
        header: "My Role",
        cell: ({ row }) => getRoleBadge(row.original.role),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
        accessorKey: "progress",
        header: "Progress",
        cell: ({ row }) => {
            const progress = (row.original.completedTasks / row.original.totalTasks) * 100;
            return (
                <div className="space-y-1 min-w-[150px]">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{row.original.completedTasks} of {row.original.totalTasks} tasks</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            );
        },
    },
    {
        accessorKey: "members",
        header: "Team",
        cell: ({ row }) => (
            <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{row.original.members}</span>
            </div>
        ),
    },
    {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: ({ row }) => new Date(row.original.dueDate).toLocaleDateString(),
    },
    {
        id: "actions",
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>View Tasks</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Team</DropdownMenuItem>
                        <DropdownMenuItem>View Timeline</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export const UserProjects = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filteredProjects = testProjects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Calculate statistics
    const stats = {
        total: testProjects.length,
        active: testProjects.filter(p => p.status === 'active').length,
        onHold: testProjects.filter(p => p.status === 'on_hold').length,
        completed: testProjects.filter(p => p.status === 'completed').length,
        asLead: testProjects.filter(p => p.role === 'lead').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
                    <p className="text-muted-foreground">
                        Projects you're currently assigned to
                    </p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">On Hold</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.onHold}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completed}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">As Lead</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.asLead}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Project Details Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.filter(p => p.status === 'active').map((project) => {
                    const progress = (project.completedTasks / project.totalTasks) * 100;
                    return (
                        <Card key={project.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                        <CardTitle className="text-base">{project.name}</CardTitle>
                                        <CardDescription className="text-sm line-clamp-2">
                                            {project.description}
                                        </CardDescription>
                                    </div>
                                    {getRoleBadge(project.role)}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-medium">{Math.round(progress)}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <ListTodo className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">{project.completedTasks}/{project.totalTasks} tasks</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">{project.members} members</span>
                                    </div>
                                    <div className="flex items-center gap-2 col-span-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <Button className="w-full" variant="outline" size="sm">
                                    View Project
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Projects Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Projects</CardTitle>
                            <CardDescription>
                                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Status: {statusFilter === 'all' ? 'All' : statusFilter.replace('_', ' ')}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setStatusFilter('all')}>All</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter('active')}>Active</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter('on_hold')}>On Hold</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter('completed')}>Completed</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={filteredProjects} />
                </CardContent>
            </Card>
        </div>
    );
};
