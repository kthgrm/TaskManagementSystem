import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, AlertCircle, ListTodo, FolderKanban } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Test data for user dashboard
const userStats = {
    totalTasks: 24,
    completed: 12,
    inProgress: 8,
    todo: 4,
    projects: 3,
    completionRate: 50
};

const recentTasks = [
    { id: 1, title: "Update user authentication flow", status: "in_progress", priority: "high", project: "Authentication System", dueDate: "2024-12-20" },
    { id: 2, title: "Design new dashboard layout", status: "todo", priority: "medium", project: "UI Redesign", dueDate: "2024-12-22" },
    { id: 3, title: "Fix bug in payment module", status: "in_progress", priority: "high", project: "Payment Gateway", dueDate: "2024-12-18" },
    { id: 4, title: "Write API documentation", status: "todo", priority: "low", project: "Documentation", dueDate: "2024-12-25" },
];

const myProjects = [
    { id: 1, name: "Authentication System", tasksCompleted: 8, totalTasks: 12, progress: 67, status: "active" },
    { id: 2, name: "UI Redesign", tasksCompleted: 3, totalTasks: 10, progress: 30, status: "active" },
    { id: 3, name: "Payment Gateway", tasksCompleted: 1, totalTasks: 6, progress: 17, status: "active" },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed': return 'default';
        case 'in_progress': return 'secondary';
        case 'todo': return 'outline';
        default: return 'outline';
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'high': return 'destructive';
        case 'medium': return 'default';
        case 'low': return 'outline';
        default: return 'outline';
    }
};

export const UserDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {user?.first_name || user?.username}!
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                        <ListTodo className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userStats.totalTasks}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {userStats.projects} projects
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userStats.completed}</div>
                        <p className="text-xs text-muted-foreground">
                            {userStats.completionRate}% completion rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userStats.inProgress}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently working on
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">To Do</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userStats.todo}</div>
                        <p className="text-xs text-muted-foreground">
                            Pending tasks
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Recent Tasks */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Recent Tasks</CardTitle>
                        <CardDescription>
                            Your latest task assignments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentTasks.map((task) => (
                                <div key={task.id} className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0">
                                    <div className="space-y-1 flex-1">
                                        <p className="text-sm font-medium leading-none">{task.title}</p>
                                        <p className="text-xs text-muted-foreground">{task.project}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant={getStatusColor(task.status)} className="text-xs">
                                                {task.status.replace('_', ' ')}
                                            </Badge>
                                            <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                                                {task.priority}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground ml-4">
                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-4" asChild>
                            <Link to="/user/tasks">View All Tasks</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* My Projects */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>My Projects</CardTitle>
                        <CardDescription>
                            Projects you're currently working on
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {myProjects.map((project) => (
                                <div key={project.id} className="space-y-2 border-b pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FolderKanban className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">{project.name}</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">{project.status}</Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{project.tasksCompleted} of {project.totalTasks} tasks</span>
                                            <span>{project.progress}%</span>
                                        </div>
                                        <Progress value={project.progress} className="h-2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-4" asChild>
                            <Link to="/user/projects">View All Projects</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                        Common tasks and shortcuts
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2 flex-wrap">
                    <Button asChild>
                        <Link to="/user/tasks">
                            <ListTodo className="mr-2 h-4 w-4" />
                            View My Tasks
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to="/user/projects">
                            <FolderKanban className="mr-2 h-4 w-4" />
                            My Projects
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to="/profile">
                            Profile Settings
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};