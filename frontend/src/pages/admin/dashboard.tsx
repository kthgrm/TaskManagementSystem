import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    FolderKanban,
    ClipboardList,
    TrendingUp,
    Loader2,
    Clipboard
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { userService } from '@/api/user.service';
import { projectService, type Project } from '@/api/project.service';
import { taskService, type Task } from '@/api/task.service';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [usersData, projectsData, tasksData] = await Promise.all([
                userService.getAllUsers(),
                projectService.getAllProjects(),
                taskService.getAllTasks()
            ]);
            setUsers(usersData);
            setProjects(projectsData);
            setTasks(tasksData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Calculate statistics from real data
    const statistics = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.is_active).length,
        adminUsers: users.filter(u => u.is_staff).length,
        totalProjects: projects.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
        todoTasks: tasks.filter(t => t.status === 'todo').length,
        highPriorityTasks: tasks.filter(t => t.priority === 'high').length,
        mediumPriorityTasks: tasks.filter(t => t.priority === 'medium').length,
        lowPriorityTasks: tasks.filter(t => t.priority === 'low').length,
    };

    // Calculate completion rate
    const completionRate = statistics.totalTasks > 0
        ? Math.round((statistics.completedTasks / statistics.totalTasks) * 100)
        : 0;

    // Task status distribution for pie chart
    const taskStatusData = [
        { name: 'Completed', value: statistics.completedTasks, color: '#22c55e' },
        { name: 'In Progress', value: statistics.inProgressTasks, color: '#3b82f6' },
        { name: 'To Do', value: statistics.todoTasks, color: '#6b7280' },
    ].filter(item => item.value > 0);

    // Priority distribution for pie chart
    const priorityData = [
        { name: 'High', value: statistics.highPriorityTasks, color: '#ef4444' },
        { name: 'Medium', value: statistics.mediumPriorityTasks, color: '#f59e0b' },
        { name: 'Low', value: statistics.lowPriorityTasks, color: '#3b82f6' },
    ].filter(item => item.value > 0);

    // Get top projects by task count
    const projectStats = projects.map(project => {
        const projectTasks = tasks.filter(t => t.project === project.id);
        const completedCount = projectTasks.filter(t => t.status === 'completed').length;
        const totalCount = projectTasks.length;
        const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        return {
            id: project.id,
            name: project.title,
            progress,
            tasks: { total: totalCount, completed: completedCount },
            members: (project.members?.length || 0) + 1, // +1 for creator
        };
    }).sort((a, b) => b.tasks.total - a.tasks.total).slice(0, 5);

    // Project workload distribution
    const projectWorkloadData = projectStats.map(p => ({
        name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
        tasks: p.tasks.total,
        completed: p.tasks.completed,
        remaining: p.tasks.total - p.tasks.completed,
    }));

    // Get recent tasks (last 5 created)
    const recentTasks = [...tasks]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-violet-800 to-violet-600 bg-clip-text text-transparent">
                            Admin Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Welcome back, {user?.first_name || user?.username}! Here's your system overview.
                        </p>
                    </div>
                </div>
            </div>

            {/* Key Metrics Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-violet-800 hover:shadow-lg transition-all hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                        <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-violet-800" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-violet-800">{statistics.totalUsers}</div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-600 hover:shadow-lg transition-all hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <FolderKanban className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{statistics.totalProjects}</div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-600 hover:shadow-lg transition-all hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
                        <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <ClipboardList className="h-5 w-5 text-amber-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">{statistics.totalTasks}</div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-600 hover:shadow-lg transition-all hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <div className="text-3xl font-bold text-green-600">{completionRate}%</div>
                            <Progress value={completionRate} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                                {statistics.completedTasks} of {statistics.totalTasks} tasks done
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Task Status Distribution */}
                <Card className="border-t-4 border-t-green-600 shadow-md hover:shadow-lg transition-shadow pt-0">
                    <CardHeader className="bg-linear-to-r from-green-50 to-transparent py-4">
                        <CardTitle className="text-green-800">Task Status</CardTitle>
                        <CardDescription>Distribution by completion status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {taskStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={taskStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={60}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {taskStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                                No tasks available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Priority Distribution */}
                <Card className="border-t-4 border-t-amber-600 shadow-md hover:shadow-lg transition-shadow pt-0">
                    <CardHeader className="bg-linear-to-r from-amber-50 to-transparent py-4">
                        <CardTitle className="text-amber-800">Task Priority</CardTitle>
                        <CardDescription>Distribution by priority level</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {priorityData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={priorityData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={60}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {priorityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                                No tasks available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Project Workload */}
                <Card className="border-t-4 border-t-violet-600 shadow-md hover:shadow-lg transition-shadow pt-0">
                    <CardHeader className="bg-linear-to-r from-violet-50 to-transparent py-4">
                        <CardTitle className="text-violet-800">Project Workload</CardTitle>
                        <CardDescription>Task distribution across top 5 projects</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {projectWorkloadData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={projectWorkloadData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed" />
                                    <Bar dataKey="remaining" stackId="a" fill="#94a3b8" name="Remaining" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                No projects available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Tasks */}
                <Card className="border-t-4 border-t-blue-600 shadow-md hover:shadow-lg transition-shadow pt-0">
                    <CardHeader className="bg-linear-to-r from-blue-50 to-transparent py-4">
                        <CardTitle className="text-blue-800">Recent Tasks</CardTitle>
                        <CardDescription>Latest 5 created tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentTasks.length > 0 ? (
                            <div className="space-y-4">
                                {recentTasks.map((task) => {
                                    const project = projects.find(p => p.id === task.project);
                                    const assignee = task.assigned_to_details;
                                    return (
                                        <div key={task.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                                            <Clipboard className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium">{task.title}</p>
                                                    <Badge variant={
                                                        task.status === 'completed' ? 'secondary' :
                                                            task.status === 'in_progress' ? 'default' : 'outline'
                                                    }>
                                                        {task.status}
                                                    </Badge>
                                                    <Badge variant={
                                                        task.priority === 'high' ? 'destructive' :
                                                            task.priority === 'medium' ? 'default' : 'outline'
                                                    }>
                                                        {task.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {project?.title || 'Unknown Project'} •
                                                    {assignee ? ` ${assignee.first_name} ${assignee.last_name}` : ' Unassigned'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                No tasks available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Project Progress Details */}
            <Card className="border-t-4 border-t-violet-600 shadow-md hover:shadow-lg transition-shadow pt-0">
                <CardHeader className="bg-linear-to-r from-violet-50 to-transparent py-4">
                    <CardTitle className="text-violet-800">Project Progress Overview</CardTitle>
                    <CardDescription>Detailed completion metrics for top 5 projects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {projectStats.length > 0 ? (
                        projectStats.map((project) => (
                            <div key={project.id} className="space-y-2 p-4 rounded-lg border hover:bg-violet-50/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center text-violet-800 font-bold">
                                            {project.name[0].toUpperCase()}
                                        </div>
                                        <span className="text-sm font-semibold">{project.name}</span>
                                    </div>
                                    <Badge className="bg-violet-800 text-white hover:bg-violet-900">
                                        {project.progress}%
                                    </Badge>
                                </div>
                                <Progress value={project.progress} className="h-2.5" />
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center gap-1">
                                            <ClipboardList className="h-3 w-3" />
                                            {project.tasks.completed}/{project.tasks.total} tasks
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {project.members} members
                                        </span>
                                    </div>
                                    <span className="text-green-600 font-medium">
                                        {project.tasks.completed} completed
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center justify-center h-24 text-muted-foreground">
                            No projects available
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
