import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, AlertCircle, ListTodo, FolderKanban, TrendingUp, Calendar, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { projectService, type Project } from '@/api/project.service';
import { taskService, type Task } from '@/api/task.service';
import { getInitials, getMediaUrl } from '@/lib/utils';
import toast from 'react-hot-toast';

export const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [projectsData, tasksData] = await Promise.all([
                projectService.getAllProjects(),
                taskService.getMyTasks(),
            ]);
            setProjects(projectsData);
            setTasks(tasksData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics
    const stats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
        todoTasks: tasks.filter(t => t.status === 'todo').length,
        overdueTasks: tasks.filter(t => {
            if (!t.due_date || t.status === 'completed') return false;
            return new Date(t.due_date) < new Date();
        }).length,
        completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0,
    };

    // Get recent tasks (last 5)
    const recentTasks = tasks
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5);

    // Get active projects (top 5 by recent activity)
    const activeProjects = projects
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5);

    // Get upcoming tasks (next 5 by due date)
    const upcomingTasks = tasks
        .filter(t => t.due_date && t.status !== 'completed')
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
        .slice(0, 5);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'todo':
                return 'bg-gray-100 text-gray-700';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-700';
            case 'completed':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low':
                return 'bg-blue-100 text-blue-700';
            case 'medium':
                return 'bg-yellow-100 text-yellow-700';
            case 'high':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-800"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome back, {user?.first_name || user?.username}! 👋
                </h1>
                <p className="text-muted-foreground mt-1">
                    Here's what's happening with your projects and tasks today.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                        <ListTodo className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTasks}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.completedTasks} completed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
                        <p className="text-xs text-muted-foreground">
                            Active tasks
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completionRate}%</div>
                        <Progress value={stats.completionRate} className="mt-2 h-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.overdueTasks}</div>
                        <p className="text-xs text-muted-foreground">
                            Need attention
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Active Projects */}
                <Card className="col-span-1">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Active Projects</CardTitle>
                                <CardDescription>Projects you're currently working on</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/user/projects">View All</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {activeProjects.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FolderKanban className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No active projects</p>
                                    <Button variant="link" asChild className="mt-2">
                                        <Link to="/user/projects">Create your first project</Link>
                                    </Button>
                                </div>
                            ) : (
                                activeProjects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/user/projects/${project.id}`)}
                                    >
                                        <div className="h-10 w-10 rounded-md bg-violet-500 flex items-center justify-center text-white font-semibold shrink-0">
                                            {getInitials(project.title)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium truncate">{project.title}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Progress value={project.completion_percentage} className="h-1.5 flex-1" />
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {project.completion_percentage}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <ListTodo className="h-3 w-3" />
                                            {project.task_count}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Tasks */}
                <Card className="col-span-1">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Upcoming Deadlines</CardTitle>
                                <CardDescription>Tasks due soon</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/user/tasks">View All</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {upcomingTasks.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No upcoming deadlines</p>
                                </div>
                            ) : (
                                upcomingTasks.map((task) => {
                                    const dueDate = new Date(task.due_date!);
                                    const isOverdue = dueDate < new Date();
                                    const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                                    return (
                                        <div
                                            key={task.id}
                                            className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="font-medium text-sm truncate flex-1">{task.title}</h4>
                                                    <Badge className={`${getPriorityColor(task.priority)} border-0 text-xs`}>
                                                        {task.priority}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                                        {isOverdue
                                                            ? 'Overdue'
                                                            : daysUntilDue === 0
                                                                ? 'Due today'
                                                                : daysUntilDue === 1
                                                                    ? 'Due tomorrow'
                                                                    : `Due in ${daysUntilDue} days`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Tasks */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Tasks</CardTitle>
                            <CardDescription>Your most recently updated tasks</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/user/tasks">View All</Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentTasks.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No tasks yet</p>
                                <Button variant="link" asChild className="mt-2">
                                    <Link to="/user/projects">Create a task in a project</Link>
                                </Button>
                            </div>
                        ) : (
                            recentTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-sm truncate">{task.title}</h4>
                                            <Badge className={`${getStatusColor(task.status)} border-0 text-xs`}>
                                                {task.status.replace('_', ' ')}
                                            </Badge>
                                            <Badge className={`${getPriorityColor(task.priority)} border-0 text-xs`}>
                                                {task.priority}
                                            </Badge>
                                        </div>
                                        {task.description && (
                                            <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                                        )}
                                    </div>
                                    {task.assigned_to_details && (
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={getMediaUrl(task.assigned_to_details.profile_picture)} />
                                                <AvatarFallback className="text-xs">
                                                    {task.assigned_to_details.first_name[0]}
                                                    {task.assigned_to_details.last_name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    )}
                                    {task.due_date && (
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Get started with common tasks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Button variant="outline" className="justify-start" asChild>
                            <Link to="/user/projects">
                                <FolderKanban className="mr-2 h-4 w-4" />
                                View Projects
                            </Link>
                        </Button>
                        <Button variant="outline" className="justify-start" asChild>
                            <Link to="/user/tasks">
                                <ListTodo className="mr-2 h-4 w-4" />
                                My Tasks
                            </Link>
                        </Button>
                        <Button variant="outline" className="justify-start" asChild>
                            <Link to="/profile">
                                <Users className="mr-2 h-4 w-4" />
                                Profile Settings
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};