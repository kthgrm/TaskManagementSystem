import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    MoreHorizontal,
    Search,
    Plus,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronDown,
    ChevronRight,
    MessageSquare,
    Calendar as CalendarIcon
} from 'lucide-react';

type Task = {
    id: number;
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'completed' | 'blocked';
    priority: 'low' | 'medium' | 'high';
    project: string;
    dueDate: string;
    assignedDate: string;
};

// Test data
const testTasks: Task[] = [
    {
        id: 1,
        title: "Update user authentication flow",
        description: "Implement OAuth 2.0 for better security",
        status: "in_progress",
        priority: "high",
        project: "Authentication System",
        dueDate: "2025-11-14",
        assignedDate: "2025-11-10"
    },
    {
        id: 2,
        title: "Design new dashboard layout",
        description: "Create wireframes and mockups",
        status: "todo",
        priority: "medium",
        project: "UI Redesign",
        dueDate: "2025-11-15",
        assignedDate: "2025-11-12"
    },
    {
        id: 3,
        title: "Fix bug in payment module",
        description: "Users can't complete checkout process",
        status: "in_progress",
        priority: "high",
        project: "Payment Gateway",
        dueDate: "2025-11-18",
        assignedDate: "2025-11-08"
    },
    {
        id: 4,
        title: "Write API documentation",
        description: "Document all REST endpoints",
        status: "todo",
        priority: "low",
        project: "Documentation",
        dueDate: "2025-11-20",
        assignedDate: "2025-11-11"
    },
    {
        id: 6,
        title: "Implement search functionality",
        description: "Add full-text search for projects and tasks",
        status: "in_progress",
        priority: "medium",
        project: "Search Feature",
        dueDate: "2025-11-22",
        assignedDate: "2025-11-09"
    },
    {
        id: 8,
        title: "Create user onboarding flow",
        description: "Design step-by-step tutorial for new users",
        status: "todo",
        priority: "low",
        project: "User Experience",
        dueDate: "2025-11-28",
        assignedDate: "2025-11-13"
    },
    {
        id: 9,
        title: "Review pull requests",
        description: "Code review for authentication module",
        status: "todo",
        priority: "medium",
        project: "Authentication System",
        dueDate: "",
        assignedDate: "2025-11-14"
    },
];

// Helper function to categorize tasks by date
const categorizeTasksByDate = (tasks: Task[]) => {
    const now = new Date('2025-11-15'); // Current date
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay()));

    const nextWeekEnd = new Date(endOfWeek);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

    const categories = {
        pastDates: [] as Task[],
        today: [] as Task[],
        thisWeek: [] as Task[],
        nextWeek: [] as Task[],
        later: [] as Task[],
    };

    tasks.forEach(task => {

        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate < today) {
            categories.pastDates.push(task);
        } else if (dueDate.getTime() === today.getTime()) {
            categories.today.push(task);
        } else if (dueDate <= endOfWeek) {
            categories.thisWeek.push(task);
        } else if (dueDate <= nextWeekEnd) {
            categories.nextWeek.push(task);
        } else {
            categories.later.push(task);
        }
    });

    return categories;
};

const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
        todo: { variant: "outline", icon: AlertCircle },
        in_progress: { variant: "secondary", icon: Clock },
        completed: { variant: "default", icon: CheckCircle2 },
        blocked: { variant: "destructive", icon: AlertCircle },
    };
    const config = variants[status] || variants.todo;
    const Icon = config.icon;
    return (
        <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
            <Icon className="h-3 w-3" />
            {status.replace('_', ' ')}
        </Badge>
    );
};

// Task row component
const TaskRow = ({ task }: { task: Task }) => {
    return (
        <div className="flex items-center gap-4 py-3 px-4 border-b hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{task.title}</p>
                </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
                <div className="w-32 text-sm text-muted-foreground">
                    {getStatusBadge(task.status)}
                </div>
                <div className="w-40 text-sm truncate">{task.project}</div>
                <div className="w-32 text-sm text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
                </div>
                <div className="w-24">
                    {getStatusBadge(task.status)}
                </div>
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
                        <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Update Status</DropdownMenuItem>
                        <DropdownMenuItem>Add Comment</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

// Task group component
const TaskGroup = ({ title, count, tasks, color = "text-foreground" }: {
    title: string;
    count: number;
    tasks: Task[];
    color?: string;
}) => {
    const [isOpen, setIsOpen] = useState(true);

    if (count === 0) return null;

    return (
        <div className="border rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
                {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={`font-semibold ${color}`}>
                    {title}
                </span>
                <span className="text-sm text-muted-foreground">
                    {count} {count === 1 ? 'item' : 'items'}
                </span>
            </button>
            {isOpen && (
                <div>
                    {tasks.map((task) => (
                        <TaskRow key={task.id} task={task} />
                    ))}
                </div>
            )}
        </div>
    );
};

export const UserTasks = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTasks = testTasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const categorizedTasks = categorizeTasksByDate(filteredTasks);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
                    <p className="text-muted-foreground">
                        Manage and track your assigned tasks
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Item
                </Button>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            {/* Task Groups */}
            <div className="space-y-4">
                <TaskGroup
                    title="Past Dates"
                    count={categorizedTasks.pastDates.length}
                    tasks={categorizedTasks.pastDates}
                    color="text-red-600"
                />
                <TaskGroup
                    title="Today"
                    count={categorizedTasks.today.length}
                    tasks={categorizedTasks.today}
                />
                <TaskGroup
                    title="This week"
                    count={categorizedTasks.thisWeek.length}
                    tasks={categorizedTasks.thisWeek}
                    color="text-blue-600"
                />
                <TaskGroup
                    title="Next week"
                    count={categorizedTasks.nextWeek.length}
                    tasks={categorizedTasks.nextWeek}
                    color="text-cyan-600"
                />
                <TaskGroup
                    title="Later"
                    count={categorizedTasks.later.length}
                    tasks={categorizedTasks.later}
                    color="text-yellow-600"
                />
            </div>
        </div>
    );
};