import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronDown,
    ChevronRight,
    Calendar as CalendarIcon,
    Clipboard,
    Loader2
} from 'lucide-react';
import { taskService, type Task } from '@/api/task.service';
import toast from 'react-hot-toast';
import { EditTaskDialog } from '../projects/components/EditTaskDialog';

// Helper function to categorize tasks by date
const categorizeTasksByDate = (tasks: Task[]) => {
    const now = new Date();
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
        noDueDate: [] as Task[],
    };

    tasks.forEach(task => {
        if (!task.due_date) {
            categories.noDueDate.push(task);
            return;
        }

        const dueDate = new Date(task.due_date);
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
    const variants: Record<string, { className: string, icon: any, label: string }> = {
        todo: { className: "bg-gray-100 text-gray-700", icon: AlertCircle, label: "To Do" },
        in_progress: { className: "bg-yellow-100 text-yellow-700", icon: Clock, label: "In Progress" },
        completed: { className: "bg-green-100 text-green-700", icon: CheckCircle2, label: "Completed" },
    };
    const config = variants[status] || variants.todo;
    const Icon = config.icon;
    return (
        <Badge className={`${config.className} flex items-center gap-1 w-fit border-0`}>
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    );
};

const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
        low: "bg-blue-100 text-blue-700",
        medium: "bg-yellow-100 text-yellow-700",
        high: "bg-red-100 text-red-700",
    };
    const className = variants[priority] || variants.medium;
    return (
        <Badge className={`${className} border-0 capitalize`}>
            {priority}
        </Badge>
    );
};

// Task row component
const TaskRow = ({ task, onTaskUpdate, onTaskClick }: { task: Task; onTaskUpdate: () => void; onTaskClick: (task: Task) => void }) => {
    const navigate = useNavigate();

    const handleMarkComplete = async () => {
        try {
            await taskService.updateTask(task.id, {
                title: task.title,
                description: task.description,
                project: task.project,
                assigned_to: task.assigned_to,
                priority: task.priority,
                status: 'completed',
                due_date: task.due_date || undefined,
            });
            toast.success('Task marked as completed');
            onTaskUpdate();
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error('Failed to update task');
        }
    };

    const handleViewProject = () => {
        navigate(`/user/projects/${task.project}`);
    };

    return (
        <div className="flex items-center gap-4 py-3 px-4 border-b hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <Clipboard className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                    <button
                        onClick={() => onTaskClick(task)}
                        className="font-medium text-sm hover:underline text-left"
                    >
                        {task.title}
                    </button>
                    {task.description && (
                        <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
                <div className="w-32">
                    {getStatusBadge(task.status)}
                </div>
                <div className="w-24">
                    {getPriorityBadge(task.priority)}
                </div>
                <div className="w-32 text-sm text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
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
                        <DropdownMenuItem onClick={() => onTaskClick(task)}>
                            View Details
                        </DropdownMenuItem>
                        {task.status !== 'completed' && (
                            <DropdownMenuItem onClick={handleMarkComplete}>
                                Mark as Completed
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleViewProject}>
                            View Project
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

// Task group component
const TaskGroup = ({ title, count, tasks, color = "text-foreground", onTaskUpdate, onTaskClick }: {
    title: string;
    count: number;
    tasks: Task[];
    color?: string;
    onTaskUpdate: () => void;
    onTaskClick: (task: Task) => void;
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
                        <TaskRow key={task.id} task={task} onTaskUpdate={onTaskUpdate} onTaskClick={onTaskClick} />
                    ))}
                </div>
            )}
        </div>
    );
};

export const UserTasks = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const data = await taskService.getAllTasks();
            setTasks(data);
        } catch (error) {
            console.error('Error loading tasks:', error);
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleTaskUpdate = () => {
        loadTasks();
        setSelectedTask(null);
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const categorizedTasks = categorizeTasksByDate(filteredTasks);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
                    <p className="text-muted-foreground">
                        Manage and track your assigned tasks
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            {/* Task Groups */}
            {tasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Clipboard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tasks assigned to you yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <TaskGroup
                        title="Past Dates"
                        count={categorizedTasks.pastDates.length}
                        tasks={categorizedTasks.pastDates}
                        color="text-red-600"
                        onTaskUpdate={handleTaskUpdate}
                        onTaskClick={setSelectedTask}
                    />
                    <TaskGroup
                        title="Today"
                        count={categorizedTasks.today.length}
                        tasks={categorizedTasks.today}
                        onTaskUpdate={handleTaskUpdate}
                        onTaskClick={setSelectedTask}
                    />
                    <TaskGroup
                        title="This week"
                        count={categorizedTasks.thisWeek.length}
                        tasks={categorizedTasks.thisWeek}
                        color="text-blue-600"
                        onTaskUpdate={handleTaskUpdate}
                        onTaskClick={setSelectedTask}
                    />
                    <TaskGroup
                        title="Next week"
                        count={categorizedTasks.nextWeek.length}
                        tasks={categorizedTasks.nextWeek}
                        color="text-cyan-600"
                        onTaskUpdate={handleTaskUpdate}
                        onTaskClick={setSelectedTask}
                    />
                    <TaskGroup
                        title="Later"
                        count={categorizedTasks.later.length}
                        tasks={categorizedTasks.later}
                        color="text-yellow-600"
                        onTaskUpdate={handleTaskUpdate}
                        onTaskClick={setSelectedTask}
                    />
                    <TaskGroup
                        title="No Due Date"
                        count={categorizedTasks.noDueDate.length}
                        tasks={categorizedTasks.noDueDate}
                        color="text-gray-600"
                        onTaskUpdate={handleTaskUpdate}
                        onTaskClick={setSelectedTask}
                    />
                </div>
            )}

            {selectedTask && (
                <EditTaskDialog
                    open={!!selectedTask}
                    onOpenChange={(open: boolean) => !open && setSelectedTask(null)}
                    task={selectedTask}
                    onSuccess={handleTaskUpdate}
                />
            )}
        </div>
    );
};