import { useState, useEffect } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable, SortableHeader } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreHorizontal, Plus, Edit, Trash2, Loader2, ListTodo, Clock, CheckCircle2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { taskService, type Task } from '@/api/task.service';
import toast from 'react-hot-toast';
import { CreateTaskDialog } from './components/CreateTaskDialog';
import { EditTaskDialog } from './components/EditTaskDialog';

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editTask, setEditTask] = useState<Task | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const tasksData = await taskService.getAllTasks();
            setTasks(tasksData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (task: Task) => {
        if (!confirm(`Are you sure you want to delete "${task.title}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await taskService.deleteTask(task.id);
            toast.success('Task deleted successfully');
            loadData();
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Failed to delete task');
        }
    };

    const columns: ColumnDef<Task>[] = [
        {
            accessorKey: 'title',
            header: ({ column }) => <SortableHeader column={column}>Task</SortableHeader>,
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
            header: ({ column }) => <SortableHeader column={column}>Project</SortableHeader>,
            cell: ({ row }) => row.original.project_name || 'Unknown',
        },
        {
            accessorKey: 'assigned_to',
            header: ({ column }) => <SortableHeader column={column}>Assigned To</SortableHeader>,
            cell: ({ row }) => {
                const assignee = row.original.assigned_to_details;
                if (!assignee) return 'Unassigned';
                const initials = `${assignee.first_name?.[0] || ''}${assignee.last_name?.[0] || ''}`;
                return (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{assignee.first_name} {assignee.last_name}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                const config: Record<string, { className: string; label: string }> = {
                    todo: { className: 'bg-gray-100 text-gray-700', label: 'To Do' },
                    in_progress: { className: 'bg-yellow-100 text-yellow-700', label: 'In Progress' },
                    completed: { className: 'bg-green-100 text-green-700', label: 'Completed' },
                };
                const statusConfig = config[status] || config.todo;
                return (
                    <Badge className={`${statusConfig.className} border-0`}>
                        {statusConfig.label}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'priority',
            header: ({ column }) => <SortableHeader column={column}>Priority</SortableHeader>,
            cell: ({ row }) => {
                const priority = row.getValue('priority') as string;
                const variants: Record<string, string> = {
                    low: 'bg-blue-100 text-blue-700',
                    medium: 'bg-yellow-100 text-yellow-700',
                    high: 'bg-red-100 text-red-700',
                };
                return (
                    <Badge className={`${variants[priority]} border-0 capitalize`}>
                        {priority}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'due_date',
            header: ({ column }) => <SortableHeader column={column}>Due Date</SortableHeader>,
            cell: ({ row }) => {
                const date = row.getValue('due_date') as string;
                return date ? new Date(date).toLocaleDateString() : 'No date';
            },
        },
        {
            id: 'actions',
            header: 'Actions',
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
                            <DropdownMenuItem onClick={() => setEditTask(task)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit task
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(task)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete task
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];


    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-violet-800 to-violet-600 bg-clip-text text-transparent">Tasks Management</h1>
                    <p className="text-muted-foreground mt-1">Manage and monitor all tasks across projects</p>
                </div>
                <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="bg-violet-800 hover:bg-violet-900 text-white shadow-md hover:shadow-lg transition-all"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Task
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-violet-800 hover:shadow-md transition-shadow">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Total Tasks</p>
                                <p className="text-3xl font-bold text-violet-800">{tasks.length}</p>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-violet-100 flex items-center justify-center">
                                <ListTodo className="h-6 w-6 text-violet-800" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">In Progress</p>
                                <p className="text-3xl font-bold text-yellow-600">{tasks.filter(t => t.status === 'in_progress').length}</p>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
                                <p className="text-3xl font-bold text-green-600">{tasks.filter(t => t.status === 'completed').length}</p>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-violet-800">All Tasks</CardTitle>
                    <CardDescription>View and manage task details, assignments, and progress</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={tasks}
                        searchKey="title"
                        searchPlaceholder="Search tasks by title..."
                    />
                </CardContent>
            </Card>

            <CreateTaskDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={loadData}
            />

            {editTask && (
                <EditTaskDialog
                    open={!!editTask}
                    onOpenChange={(open) => !open && setEditTask(null)}
                    task={editTask}
                    onSuccess={() => {
                        loadData();
                        setEditTask(null);
                    }}
                />
            )}
        </div>
    );
}