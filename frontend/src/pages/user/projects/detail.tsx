import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Loader2, Plus, Search, User, Filter, SortAsc, LayoutGrid, X, ArrowUpDown, Settings, List, Grid2X2, Flag, Calendar } from 'lucide-react';
import { projectService, type Project } from '@/api/project.service';
import { taskService, type Task } from '@/api/task.service';
import toast from 'react-hot-toast';
import { BoardView } from './components/BoardView';
import { ListView } from './components/ListView';
import { CreateTaskDialog } from './components/CreateTaskDialog';
import { EditTaskDialog } from './components/EditTaskDialog';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';

export default function ProjectDetailPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('main-table');
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [taskDialogTab, setTaskDialogTab] = useState<'details' | 'comments' | 'activity'>('details');

    // Toolbar states
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [filterPerson, setFilterPerson] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [filterDeadline, setFilterDeadline] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'title' | 'due_date' | 'priority' | 'status'>('due_date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [groupBy, setGroupBy] = useState<'none' | 'status' | 'priority' | 'assignee'>('none');

    useEffect(() => {
        if (projectId) {
            loadProject();
            loadTasks();
        }
    }, [projectId]);

    // Handle URL parameters to open task dialog from notifications
    useEffect(() => {
        const taskId = searchParams.get('taskId');
        const tab = searchParams.get('tab') as 'details' | 'comments' | 'activity' | null;

        if (taskId && tasks.length > 0) {
            const task = tasks.find(t => t.id === parseInt(taskId));
            if (task) {
                setSelectedTask(task);
                setTaskDialogTab(tab || 'details');
                // Clear URL parameters after opening dialog
                setSearchParams({});
            }
        }
    }, [searchParams, tasks, setSearchParams]);

    const loadProject = async () => {
        if (!projectId) return;
        try {
            const data = await projectService.getProject(parseInt(projectId));
            setProject(data);
        } catch (error: any) {
            console.error('Error loading project:', error);
            toast.error(error.response?.data?.detail || 'Failed to load project');
            navigate('/user/projects');
        } finally {
            setLoading(false);
        }
    };

    const loadTasks = async () => {
        if (!projectId) return;
        try {
            const data = await taskService.getAllTasks({
                project_id: parseInt(projectId),
            });
            setTasks(data);
        } catch (error: any) {
            console.error('Error loading tasks:', error);
        }
    };

    const handleTaskCreated = () => {
        loadTasks();
        setShowCreateTask(false);
    };

    const handleTaskUpdated = () => {
        loadTasks();
    };

    // Get unique assignees from project members and creator
    const assignees = useMemo(() => {
        if (!project) return [];
        const allAssignees = [...(project.members_details || [])];

        // Add project creator if not already in members
        if (project.created_by_details && !allAssignees.find(m => m.id === project.created_by_details!.id)) {
            allAssignees.unshift(project.created_by_details);
        }

        return allAssignees;
    }, [project]);

    // Filter and sort tasks
    const filteredAndSortedTasks = useMemo(() => {
        let result = [...tasks];

        // Apply search
        if (searchQuery) {
            result = result.filter(task =>
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply person filter
        if (filterPerson !== 'all') {
            if (filterPerson === 'unassigned') {
                result = result.filter(task => !task.assigned_to);
            } else {
                result = result.filter(task => task.assigned_to?.toString() === filterPerson);
            }
        }

        // Apply status filter
        if (filterStatus !== 'all') {
            result = result.filter(task => task.status === filterStatus);
        }

        // Apply priority filter
        if (filterPriority !== 'all') {
            result = result.filter(task => task.priority === filterPriority);
        }

        // Apply deadline filter
        if (filterDeadline !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const weekFromNow = new Date(today);
            weekFromNow.setDate(weekFromNow.getDate() + 7);

            result = result.filter(task => {
                if (!task.due_date) return false;
                const dueDate = new Date(task.due_date);
                const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

                switch (filterDeadline) {
                    case 'overdue':
                        return dueDateOnly < today && task.status !== 'completed';
                    case 'today':
                        return dueDateOnly.getTime() === today.getTime();
                    case 'this_week':
                        return dueDateOnly >= today && dueDateOnly < weekFromNow;
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        result.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'due_date':
                    const dateA = a.due_date ? new Date(a.due_date).getTime() : 0;
                    const dateB = b.due_date ? new Date(b.due_date).getTime() : 0;
                    comparison = dateA - dateB;
                    break;
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
                    break;
                case 'status':
                    const statusOrder = { todo: 1, in_progress: 2, completed: 3 };
                    comparison = statusOrder[a.status] - statusOrder[b.status];
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [tasks, searchQuery, filterPerson, filterStatus, filterPriority, filterDeadline, sortBy, sortOrder]);

    const hasActiveFilters = searchQuery || filterPerson !== 'all' || filterStatus !== 'all' || filterPriority !== 'all' || filterDeadline !== 'all';

    const clearFilters = () => {
        setSearchQuery('');
        setFilterPerson('all');
        setFilterStatus('all');
        setFilterPriority('all');
        setFilterDeadline('all');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!project) {
        return null;
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-700/50">
                <div className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="flex-1">
                                <h1 className="text-2xl font-semibold flex items-center gap-2 mb-2">
                                    {project.title}
                                </h1>
                                {/* Progress Bar */}
                                <div className="flex items-center gap-3 max-w-md">
                                    <Progress value={project.completion_percentage} className="h-2 flex-1" />
                                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                                        {project.completion_percentage}% complete
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {user && project.created_by === user.id && (
                                <Button
                                    variant="ghost"
                                    className="text-violet-800 hover:bg-gray-300 hover:text-violet-600"
                                    onClick={() => navigate(`/user/projects/${projectId}/settings`)}
                                >
                                    <Settings className='h-4 w-4' />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-transparent border-0 gap-1">
                            <TabsTrigger
                                value="main-table"
                                className="data-[state=active]:bg-violet-800 data-[state=active]:text-white px-4 py-2 hover:bg-gray-300 text-gray-600"
                            >
                                <List className="h-4 w-4" />
                                Main table
                            </TabsTrigger>
                            <TabsTrigger
                                value="kanban"
                                className="data-[state=active]:bg-violet-800 data-[state=active]:text-white px-4 py-2 hover:bg-gray-300 text-gray-600"
                            >
                                <Grid2X2 className="h-4 w-4" />
                                Kanban
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Toolbar */}
            <div className="px-6 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                        {/* Search */}
                        {showSearch ? (
                            <div className="relative flex items-center gap-2">
                                <Search className="absolute left-3 h-4 w-4" />
                                <Input
                                    placeholder="Search tasks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-8 w-64 h-8  border-violet-800"
                                    autoFocus
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 h-6 w-6"
                                    onClick={() => {
                                        setShowSearch(false);
                                        setSearchQuery('');
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:bg-gray-300"
                                onClick={() => setShowSearch(true)}
                            >
                                <Search className="h-4 w-4" />
                                Search
                            </Button>
                        )}

                        {/* Person Filter */}
                        <Select value={filterPerson} onValueChange={setFilterPerson}>
                            <SelectTrigger className="w-auto h-8 bg-transparent">
                                <User className="h-4 w-4 mr-2" />
                                <span className="text-sm">Assignee</span>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {assignees.map((person) => (
                                    <SelectItem key={person.id} value={person.id.toString()}>
                                        {person.first_name} {person.last_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Status Filter */}
                        <div className="relative">
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-auto h-8 bg-transparent">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <span className="text-sm">Status</span>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority Filter */}
                        <Select value={filterPriority} onValueChange={setFilterPriority}>
                            <SelectTrigger className="w-auto h-8 bg-transparent">
                                <Flag className="h-4 w-4 mr-2" />
                                <span className="text-sm">Priority</span>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priorities</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Deadline Filter */}
                        <Select value={filterDeadline} onValueChange={setFilterDeadline}>
                            <SelectTrigger className="w-auto h-8 bg-transparent">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span className="text-sm">Deadline</span>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Deadlines</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                                <SelectItem value="today">Due Today</SelectItem>
                                <SelectItem value="this_week">Due This Week</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Sort */}
                        <div className="flex items-center gap-1">
                            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                                <SelectTrigger className="w-auto h-8 bg-transparent">
                                    <SortAsc className="h-4 w-4 mr-2" />
                                    <span className="text-sm">Sort</span>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="title">Title</SelectItem>
                                    <SelectItem value="due_date">Due Date</SelectItem>
                                    <SelectItem value="priority">Priority</SelectItem>
                                    <SelectItem value="status">Status</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:bg-gray-700/50"
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                            >
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Group By - Only show on Main table view */}
                        {activeTab === 'main-table' && (
                            <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
                                <SelectTrigger className="w-auto h-8 bg-transparent">
                                    <LayoutGrid className="h-4 w-4 mr-2" />
                                    <span className="text-sm">Group by</span>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="status">Status</SelectItem>
                                    <SelectItem value="priority">Priority</SelectItem>
                                    <SelectItem value="assignee">Assignee</SelectItem>
                                </SelectContent>
                            </Select>
                        )}

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:bg-gray-700/50"
                                onClick={clearFilters}
                            >
                                Clear filters
                            </Button>
                        )}
                    </div>

                    <Button
                        onClick={() => setShowCreateTask(true)}
                        size="sm"
                        className="bg-violet-800 hover:bg-violet-600 text-white"
                    >
                        <Plus className="h-3 w-3 ml-1" />
                        New task
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto px-6">
                <Tabs value={activeTab} className="w-full h-full">
                    <TabsContent value="main-table" className="mt-0 h-full">
                        <ListView
                            tasks={filteredAndSortedTasks}
                            onTaskUpdate={handleTaskUpdated}
                            groupBy={groupBy}
                            projectMembers={assignees}
                        />
                    </TabsContent>
                    <TabsContent value="kanban" className="mt-0 h-full">
                        <BoardView
                            tasks={filteredAndSortedTasks}
                            onTaskUpdate={handleTaskUpdated}
                            projectMembers={assignees}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {projectId && (
                <CreateTaskDialog
                    open={showCreateTask}
                    onOpenChange={setShowCreateTask}
                    projectId={parseInt(projectId)}
                    onSuccess={handleTaskCreated}
                />
            )}

            {selectedTask && (
                <EditTaskDialog
                    open={!!selectedTask}
                    onOpenChange={(open: boolean) => {
                        if (!open) {
                            setSelectedTask(null);
                            setTaskDialogTab('details');
                        }
                    }}
                    task={selectedTask}
                    onSuccess={() => {
                        handleTaskUpdated();
                        setSelectedTask(null);
                        setTaskDialogTab('details');
                    }}
                    defaultTab={taskDialogTab}
                />
            )}
        </div>
    );
}
