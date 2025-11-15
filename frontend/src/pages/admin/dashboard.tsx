import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    FolderKanban,
    ClipboardList,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp,
    Activity
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
    LineChart,
    Line,
    Legend
} from 'recharts';// Test data for statistics
const statistics = {
    totalUsers: 45,
    activeUsers: 38,
    totalProjects: 12,
    activeProjects: 8,
    completedProjects: 3,
    archivedProjects: 1,
    totalTasks: 156,
    completedTasks: 89,
    inProgressTasks: 42,
    todoTasks: 18,
    tasksThisWeek: 23,
    tasksThisMonth: 67,
};

// Project statistics with progress
const projectStats = [
    {
        name: 'E-Commerce Platform',
        progress: 62,
        tasks: { total: 45, completed: 28 },
        members: 8,
        status: 'active' as const
    },
    {
        name: 'Mobile App Development',
        progress: 47,
        tasks: { total: 32, completed: 15 },
        members: 5,
        status: 'active' as const
    },
    {
        name: 'CRM System',
        progress: 100,
        tasks: { total: 28, completed: 28 },
        members: 6,
        status: 'completed' as const
    },
    {
        name: 'Analytics Dashboard',
        progress: 36,
        tasks: { total: 22, completed: 8 },
        members: 4,
        status: 'active' as const
    },
];

// Recent activities
const recentActivities = [
    { user: 'John Doe', action: 'created task', target: 'Implement authentication', time: '5 min ago' },
    { user: 'Jane Smith', action: 'completed task', target: 'Design database schema', time: '12 min ago' },
    { user: 'Bob Wilson', action: 'updated project', target: 'E-Commerce Platform', time: '1 hour ago' },
    { user: 'Alice Brown', action: 'added member', target: 'Mobile App Development', time: '2 hours ago' },
];

// Task status distribution for pie chart
const taskStatusData = [
    { name: 'Completed', value: statistics.completedTasks, color: '#22c55e' },
    { name: 'In Progress', value: statistics.inProgressTasks, color: '#3b82f6' },
    { name: 'To Do', value: statistics.todoTasks, color: '#6b7280' },
];

// Weekly task completion trend
const weeklyTaskData = [
    { day: 'Mon', completed: 12, created: 8 },
    { day: 'Tue', completed: 15, created: 10 },
    { day: 'Wed', completed: 18, created: 12 },
    { day: 'Thu', completed: 14, created: 15 },
    { day: 'Fri', completed: 16, created: 9 },
    { day: 'Sat', completed: 8, created: 5 },
    { day: 'Sun', completed: 6, created: 4 },
];

// Project workload distribution
const projectWorkloadData = projectStats.map(p => ({
    name: p.name.split(' ')[0], // Shortened name for chart
    tasks: p.tasks.total,
    completed: p.tasks.completed,
    remaining: p.tasks.total - p.tasks.completed,
})); export const AdminDashboard = () => {
    const { user } = useAuth();
    const completionRate = Math.round((statistics.completedTasks / statistics.totalTasks) * 100);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {user?.first_name || user?.username}!
                </p>
            </div>

            {/* Overview Statistics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">{statistics.activeUsers}</span> active users
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.totalProjects}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">{statistics.activeProjects}</span> active,
                            <span className="text-blue-600"> {statistics.completedProjects}</span> completed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.totalTasks}</div>
                        <p className="text-xs text-muted-foreground">
                            {statistics.tasksThisWeek} tasks this week
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Task Status Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.completedTasks}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.inProgressTasks}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">To Do</CardTitle>
                        <ClipboardList className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.todoTasks}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Task Status Distribution - Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Task Status Distribution</CardTitle>
                        <CardDescription>Overview of all task statuses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={taskStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
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
                    </CardContent>
                </Card>

                {/* Weekly Task Trend - Line Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Task Trend</CardTitle>
                        <CardDescription>Tasks completed vs created this week</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={weeklyTaskData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} name="Completed" />
                                <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} name="Created" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Project Workload - Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Project Workload</CardTitle>
                        <CardDescription>Task distribution across projects</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={projectWorkloadData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed" />
                                <Bar dataKey="remaining" stackId="a" fill="#94a3b8" name="Remaining" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activities</CardTitle>
                        <CardDescription>Latest system activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.map((activity, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm">
                                            <span className="font-medium">{activity.user}</span>{' '}
                                            <span className="text-muted-foreground">{activity.action}</span>{' '}
                                            <span className="font-medium">"{activity.target}"</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Project Statistics with Progress Bars */}
            <Card>
                <CardHeader>
                    <CardTitle>Project Progress</CardTitle>
                    <CardDescription>Detailed progress for each project</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {projectStats.map((project, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{project.name}</span>
                                    <Badge variant={project.status === 'completed' ? 'secondary' : 'default'}>
                                        {project.status}
                                    </Badge>
                                </div>
                                <span className="text-sm text-muted-foreground">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Tasks: {project.tasks.completed}/{project.tasks.total}</span>
                                <span>{project.members} members</span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};
