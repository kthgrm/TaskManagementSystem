import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    BarChart,
    Users,
    CheckCircle2,
    Clock,
    TrendingUp,
    Calendar,
    Filter,
    Download,
    Loader2,
    FolderKanban,
    User,
} from 'lucide-react';
import { reportService, type ReportData } from '@/api/report.service';
import { projectService, type Project } from '@/api/project.service';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function UserReportsPage() {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedProject, setSelectedProject] = useState<string>('all');

    useEffect(() => {
        loadProjects();
        loadReports();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await projectService.getAllProjects();
            setProjects(data);
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    };

    const loadReports = async () => {
        try {
            setLoading(true);
            const filters: any = {};
            if (startDate) filters.start_date = startDate;
            if (endDate) filters.end_date = endDate;
            if (selectedProject !== 'all') filters.project_id = selectedProject;

            const data = await reportService.getUserReports(filters);
            setReportData(data);
        } catch (error) {
            console.error('Error loading reports:', error);
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = () => {
        loadReports();
    };

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedProject('all');
    };

    const handleExportReport = () => {
        if (!reportData) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPos = 20;

        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('My Reports & Analytics', pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        // Date and filters
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
        const filterText = `Filters: ${startDate || 'All'} to ${endDate || 'All'} | Project: ${selectedProject === 'all' ? 'All Projects' : projects.find(p => p.id.toString() === selectedProject)?.title || 'Unknown'}`;
        doc.text(filterText, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        // Personal Statistics
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('My Personal Statistics', 14, yPos);
        yPos += 8;

        if (task_completion_rates.my_tasks) {
            autoTable(doc, {
                startY: yPos,
                head: [['Metric', 'Value']],
                body: [
                    ['My Total Tasks', task_completion_rates.my_tasks.total.toString()],
                    ['My Completed Tasks', task_completion_rates.my_tasks.completed.toString()],
                    ['My In Progress', task_completion_rates.my_tasks.in_progress.toString()],
                    ['My Completion Rate', `${task_completion_rates.my_tasks.completion_rate}%`]
                ],
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229] }
            });
            yPos = (doc as any).lastAutoTable.finalY + 10;
        }

        // Overall Statistics
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Overall Project Statistics', 14, yPos);
        yPos += 8;

        autoTable(doc, {
            startY: yPos,
            head: [['Metric', 'Value']],
            body: [
                ['Total Tasks', task_completion_rates.total_tasks.toString()],
                ['Completed Tasks', task_completion_rates.completed_tasks.toString()],
                ['In Progress', task_completion_rates.in_progress_tasks.toString()],
                ['To Do', task_completion_rates.todo_tasks.toString()],
                ['Overall Completion Rate', `${task_completion_rates.overall_completion_rate}%`]
            ],
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] }
        });
        yPos = (doc as any).lastAutoTable.finalY + 10;

        // Project Summaries
        if (project_summaries.length > 0) {
            doc.addPage();
            yPos = 20;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('My Project Summaries', 14, yPos);
            yPos += 8;

            autoTable(doc, {
                startY: yPos,
                head: [['Project', 'Progress', 'Total', 'Completed', 'Your Tasks']],
                body: project_summaries.map(p => [
                    p.project_name + (p.is_owner ? ' (Owner)' : ''),
                    `${p.completion_percentage}%`,
                    p.total_tasks.toString(),
                    p.completed_tasks.toString(),
                    `${p.your_completed}/${p.your_tasks}`
                ]),
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229] }
            });
            yPos = (doc as any).lastAutoTable.finalY + 10;
        }

        // Team Productivity (only for owned projects)
        if (member_productivity.length > 0) {
            if (yPos > 200) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Team Productivity (My Projects)', 14, yPos);
            yPos += 8;

            autoTable(doc, {
                startY: yPos,
                head: [['Name', 'Email', 'Assigned', 'Completed', 'Rate']],
                body: member_productivity.map(m => [
                    m.name,
                    m.email,
                    m.total_tasks_assigned.toString(),
                    m.completed_tasks.toString(),
                    `${m.completion_rate}%`
                ]),
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229] }
            });
        }

        // Save PDF
        doc.save(`my_report_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Report exported as PDF');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!reportData) return null;

    const { project_summaries, task_completion_rates, member_productivity } = reportData;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Reports & Analytics</h1>
                    <p className="text-muted-foreground">
                        Insights for your projects and personal productivity
                    </p>
                </div>
                <Button variant="outline" onClick={handleExportReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-sm font-medium mb-2 block">Start Date</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-sm font-medium mb-2 block">End Date</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-sm font-medium mb-2 block">Project</label>
                            <Select value={selectedProject} onValueChange={setSelectedProject}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Projects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Projects</SelectItem>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id.toString()}>
                                            {project.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end gap-2">
                            <Button onClick={handleApplyFilters}>
                                Apply Filters
                            </Button>
                            <Button variant="outline" onClick={handleClearFilters}>
                                Clear
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Personal Stats */}
            {task_completion_rates.my_tasks && (
                <Card className="border-violet-200 bg-violet-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-violet-600" />
                            My Personal Stats
                        </CardTitle>
                        <CardDescription>Your individual task completion metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Tasks Assigned to Me</div>
                                <div className="text-3xl font-bold text-violet-600">
                                    {task_completion_rates.my_tasks.total}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Completed</div>
                                <div className="text-3xl font-bold text-green-600">
                                    {task_completion_rates.my_tasks.completed}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">My Completion Rate</div>
                                <div className="text-3xl font-bold text-blue-600">
                                    {task_completion_rates.my_tasks.completion_rate}%
                                </div>
                            </div>
                        </div>
                        <Progress value={task_completion_rates.my_tasks.completion_rate} className="mt-4 h-3" />
                    </CardContent>
                </Card>
            )}

            {/* Task Completion Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{task_completion_rates.total_tasks}</div>
                        <p className="text-xs text-muted-foreground">Across all projects</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {task_completion_rates.completed_tasks}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {task_completion_rates.overall_completion_rate}% completion rate
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {task_completion_rates.in_progress_tasks}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">To Do</CardTitle>
                        <Calendar className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-600">
                            {task_completion_rates.todo_tasks}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Project Progress Summaries */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FolderKanban className="h-5 w-5" />
                        My Project Progress
                    </CardTitle>
                    <CardDescription>Projects you own or are a member of</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {project_summaries.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No projects found</p>
                        ) : (
                            project_summaries.map((project) => (
                                <div key={project.project_id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{project.project_name}</h3>
                                                {project.is_owner && (
                                                    <Badge className="bg-violet-100 text-violet-700 border-0">Owner</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Created by {project.created_by} • {project.member_count} members
                                            </p>
                                            {project.your_tasks !== undefined && (
                                                <p className="text-xs text-violet-600 font-medium mt-1">
                                                    Your tasks: {project.your_completed}/{project.your_tasks} completed
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-violet-600">
                                                {project.completion_percentage}%
                                            </div>
                                            <p className="text-xs text-muted-foreground">Overall</p>
                                        </div>
                                    </div>
                                    <Progress value={project.completion_percentage} className="mb-3" />
                                    <div className="flex gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                            <div className="h-3 w-3 rounded-full bg-green-500" />
                                            <span>{project.completed_tasks} Completed</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                            <span>{project.in_progress_tasks} In Progress</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="h-3 w-3 rounded-full bg-gray-400" />
                                            <span>{project.todo_tasks} To Do</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Team Member Productivity (only for projects user owns) */}
            {member_productivity.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Team Productivity
                        </CardTitle>
                        <CardDescription>Performance metrics for members of projects you own</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {member_productivity.map((member) => (
                                <div key={member.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="font-medium">{member.name}</div>
                                        <div className="text-sm text-muted-foreground">{member.email}</div>
                                        <div className="flex gap-3 mt-2 text-xs">
                                            <span>
                                                <strong>{member.total_tasks_assigned}</strong> tasks assigned
                                            </span>
                                            <span>
                                                <strong>{member.completed_tasks}</strong> completed
                                            </span>
                                            <span>
                                                <strong>{member.in_progress_tasks}</strong> in progress
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                            <span className="text-lg font-bold text-green-600">
                                                {member.completion_rate}%
                                            </span>
                                        </div>
                                        <Progress value={member.completion_rate} className="w-24" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
