import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    MoreHorizontal,
    Plus,
    Calendar,
    MessageSquare,
    ChevronDown,
    Search,
    Filter,
    Settings,
    Share2,
    User
} from 'lucide-react';

type Task = {
    id: number;
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    assignee: string;
    dueDate: string;
    comments: number;
};

// Sample project data
const projectsData: Record<string, any> = {
    '1': {
        id: 1,
        name: 'Authentication System',
        description: 'Implement OAuth 2.0 and improve security measures',
        progress: 67,
        totalTasks: 12,
        completedTasks: 8,
        members: 5,
        startDate: '2024-11-01',
        dueDate: '2024-12-31',
        tasks: [
            {
                id: 1,
                title: 'Setup OAuth provider',
                description: 'Configure OAuth 2.0 provider',
                status: 'completed',
                priority: 'high',
                assignee: 'John Doe',
                dueDate: '2024-11-15',
                comments: 3
            },
            {
                id: 2,
                title: 'Implement token refresh',
                description: 'Add automatic token refresh mechanism',
                status: 'in_progress',
                priority: 'high',
                assignee: 'Jane Smith',
                dueDate: '2024-11-20',
                comments: 5
            },
            {
                id: 3,
                title: 'Add multi-factor authentication',
                description: 'Implement 2FA for enhanced security',
                status: 'in_progress',
                priority: 'medium',
                assignee: 'Bob Johnson',
                dueDate: '2024-11-25',
                comments: 2
            },
            {
                id: 4,
                title: 'Write security documentation',
                description: 'Document security best practices',
                status: 'todo',
                priority: 'low',
                assignee: 'Alice Brown',
                dueDate: '2024-12-05',
                comments: 0
            },
            {
                id: 5,
                title: 'Implement password reset flow',
                description: 'Create secure password reset mechanism',
                status: 'todo',
                priority: 'medium',
                assignee: 'Charlie Davis',
                dueDate: '2024-12-10',
                comments: 1
            },
        ]
    },
    '2': {
        id: 2,
        name: 'UI Redesign',
        description: 'Complete overhaul of the user interface',
        progress: 30,
        totalTasks: 10,
        completedTasks: 3,
        members: 8,
        startDate: '2024-11-15',
        dueDate: '2025-01-15',
        tasks: [
            {
                id: 6,
                title: 'Create design system',
                description: 'Build comprehensive component library',
                status: 'completed',
                priority: 'high',
                assignee: 'Sarah Wilson',
                dueDate: '2024-11-20',
                comments: 8
            },
            {
                id: 7,
                title: 'Design new dashboard',
                description: 'Create mockups for dashboard redesign',
                status: 'in_progress',
                priority: 'high',
                assignee: 'Mike Taylor',
                dueDate: '2024-11-30',
                comments: 4
            },
            {
                id: 8,
                title: 'Implement dark mode',
                description: 'Add dark theme support',
                status: 'todo',
                priority: 'medium',
                assignee: 'Emily White',
                dueDate: '2024-12-15',
                comments: 2
            },
        ]
    },
    '3': {
        id: 3,
        name: 'Payment Gateway',
        description: 'Integrate multiple payment providers',
        progress: 17,
        totalTasks: 6,
        completedTasks: 1,
        members: 3,
        startDate: '2024-12-01',
        dueDate: '2024-12-20',
        tasks: [
            {
                id: 9,
                title: 'Research payment providers',
                description: 'Evaluate Stripe, PayPal, and Square',
                status: 'completed',
                priority: 'high',
                assignee: 'David Lee',
                dueDate: '2024-12-05',
                comments: 6
            },
            {
                id: 10,
                title: 'Integrate Stripe API',
                description: 'Implement Stripe payment processing',
                status: 'in_progress',
                priority: 'high',
                assignee: 'Lisa Green',
                dueDate: '2024-12-12',
                comments: 3
            },
            {
                id: 11,
                title: 'Add payment webhooks',
                description: 'Handle payment confirmation webhooks',
                status: 'todo',
                priority: 'medium',
                assignee: 'Tom Harris',
                dueDate: '2024-12-18',
                comments: 1
            },
        ]
    }
};

const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
        todo: { label: 'To Do', variant: 'outline' },
        in_progress: { label: 'In Progress', variant: 'secondary' },
        completed: { label: 'Completed', variant: 'default' },
    };
    const { label, variant } = config[status] || { label: status, variant: 'outline' };
    return <Badge variant={variant} className="font-normal">{label}</Badge>;
};

const TaskCard = ({ task }: { task: Task }) => {
    return (
        <div className="bg-white border rounded-lg p-3 mb-2 hover:shadow-sm transition-shadow">
            <div className="space-y-2">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h4 className="text-sm font-medium">{task.title}</h4>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {getStatusBadge(task.status)}
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                            <User className="h-3 w-3" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {task.comments > 0 && (
                            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                                <MessageSquare className="h-3 w-3" />
                                <span>{task.comments}</span>
                            </button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreHorizontal className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KanbanColumn = ({
    title,
    tasks,
    count,
    color
}: {
    title: string;
    tasks: Task[];
    count: number;
    color: string;
}) => {
    return (
        <div className="flex-1 min-w-[280px]">
            <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-semibold ${color}`}>{title}</h3>
                        <Badge variant="secondary" className="rounded-full">{count}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <div className="space-y-2">
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export const ProjectDetail = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const project = projectsData[projectId || '1'];

    if (!project) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Project not found</p>
            </div>
        );
    }

    const todoTasks = project.tasks.filter((t: Task) => t.status === 'todo');
    const inProgressTasks = project.tasks.filter((t: Task) => t.status === 'in_progress');
    const completedTasks = project.tasks.filter((t: Task) => t.status === 'completed');

    return (
        <div className="space-y-4">
            {/* Project Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Board Controls */}
            <div className="flex items-center justify-between border-b">
                <Tabs defaultValue="kanban" className="w-full">
                    <div className="flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="table">Main table</TabsTrigger>
                            <TabsTrigger value="kanban">Kanban</TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-2 pb-2">
                            <Button variant="ghost" size="sm">
                                <Search className="h-4 w-4 mr-2" />
                                Search
                            </Button>
                            <Button variant="ghost" size="sm">
                                <User className="h-4 w-4 mr-2" />
                                Person
                            </Button>
                            <Button variant="ghost" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Hide</DropdownMenuItem>
                                    <DropdownMenuItem>Sort</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Settings</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <TabsContent value="table" className="mt-4">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Task</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Assignee</TableHead>
                                        <TableHead>Due Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {project.tasks.map((task: Task) => (
                                        <TableRow key={task.id}>
                                            <TableCell className="font-medium">{task.title}</TableCell>
                                            <TableCell>{getStatusBadge(task.status)}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    task.priority === 'high' ? 'destructive' :
                                                        task.priority === 'medium' ? 'default' : 'secondary'
                                                }>
                                                    {task.priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{task.assignee}</TableCell>
                                            <TableCell>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    <TabsContent value="kanban" className="mt-4">
                        <div className="flex gap-4 overflow-x-auto pb-4">
                            <KanbanColumn
                                title="To Do"
                                tasks={todoTasks}
                                count={todoTasks.length}
                                color="text-gray-700"
                            />
                            <KanbanColumn
                                title="In Progress"
                                tasks={inProgressTasks}
                                count={inProgressTasks.length}
                                color="text-blue-600"
                            />
                            <KanbanColumn
                                title="Completed"
                                tasks={completedTasks}
                                count={completedTasks.length}
                                color="text-green-600"
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};
