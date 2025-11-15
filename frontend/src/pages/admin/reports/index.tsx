import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, Filter, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ReportType = 'project_progress' | 'task_completion' | 'team_productivity' | 'all';

type Report = {
    id: number;
    name: string;
    type: ReportType;
    description: string;
    project?: string;
    dateRange: string;
    generatedBy: string;
    generatedAt: string;
    downloadUrl?: string;
    metrics?: {
        totalItems?: number;
        completedItems?: number;
        completionRate?: number;
        productivity?: string;
    };
};

const testReports: Report[] = [
    {
        id: 1,
        name: 'E-Commerce Platform - Progress Summary',
        type: 'project_progress',
        description: 'Project progress summary including milestones and completion status',
        project: 'E-Commerce Platform',
        dateRange: 'Nov 1 - Nov 15, 2024',
        generatedBy: 'John Doe',
        generatedAt: '2024-11-15 10:30:00',
        downloadUrl: '/reports/ecommerce-progress-nov-2024.pdf',
        metrics: {
            totalItems: 45,
            completedItems: 28,
            completionRate: 62,
        },
    },
    {
        id: 2,
        name: 'Task Completion Rate - Q4 2024',
        type: 'task_completion',
        description: 'Overall task completion rates across all projects',
        dateRange: 'Oct 1 - Dec 31, 2024',
        generatedBy: 'Jane Smith',
        generatedAt: '2024-11-14 15:20:00',
        downloadUrl: '/reports/task-completion-q4-2024.pdf',
        metrics: {
            totalItems: 156,
            completedItems: 89,
            completionRate: 57,
        },
    },
    {
        id: 3,
        name: 'Team Member Productivity - November',
        type: 'team_productivity',
        description: 'Individual and team productivity metrics',
        dateRange: 'Nov 1 - Nov 30, 2024',
        generatedBy: 'Bob Wilson',
        generatedAt: '2024-11-15 09:00:00',
        metrics: {
            productivity: 'High',
        },
    },
    {
        id: 4,
        name: 'Mobile App Development - Progress',
        type: 'project_progress',
        description: 'Detailed progress report for mobile application',
        project: 'Mobile App Development',
        dateRange: 'Nov 1 - Nov 15, 2024',
        generatedBy: 'Alice Brown',
        generatedAt: '2024-11-13 08:00:00',
        downloadUrl: '/reports/mobile-app-progress-nov-2024.pdf',
        metrics: {
            totalItems: 32,
            completedItems: 15,
            completionRate: 47,
        },
    },
    {
        id: 5,
        name: 'Weekly Task Completion - Week 46',
        type: 'task_completion',
        description: 'Task completion analysis for the current week',
        dateRange: 'Nov 11 - Nov 17, 2024',
        generatedBy: 'Charlie Davis',
        generatedAt: '2024-11-13 18:30:00',
        downloadUrl: '/reports/weekly-tasks-week46-2024.pdf',
        metrics: {
            totalItems: 23,
            completedItems: 18,
            completionRate: 78,
        },
    },
    {
        id: 6,
        name: 'Development Team Productivity - October',
        type: 'team_productivity',
        description: 'Team productivity breakdown and insights',
        dateRange: 'Oct 1 - Oct 31, 2024',
        generatedBy: 'John Doe',
        generatedAt: '2024-11-01 10:00:00',
        downloadUrl: '/reports/team-productivity-oct-2024.pdf',
        metrics: {
            productivity: 'Medium',
        },
    },
    {
        id: 7,
        name: 'CRM System - Final Progress Report',
        type: 'project_progress',
        description: 'Completed project final summary',
        project: 'CRM System',
        dateRange: 'Sep 1 - Mar 31, 2024',
        generatedBy: 'Jane Smith',
        generatedAt: '2024-04-01 14:00:00',
        downloadUrl: '/reports/crm-final-report-2024.pdf',
        metrics: {
            totalItems: 28,
            completedItems: 28,
            completionRate: 100,
        },
    },
];

const columns: ColumnDef<Report>[] = [
    {
        accessorKey: 'name',
        header: 'Report Name',
        cell: ({ row }) => {
            const typeLabels = {
                project_progress: 'Project Progress',
                task_completion: 'Task Completion',
                team_productivity: 'Team Productivity',
                all: 'All',
            };
            return (
                <div className="space-y-1">
                    <div className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {row.getValue('name')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {typeLabels[row.original.type as keyof typeof typeLabels]}
                        {row.original.project && ` • ${row.original.project}`}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'metrics',
        header: 'Metrics',
        cell: ({ row }) => {
            const metrics = row.original.metrics;
            if (!metrics) return <span className="text-muted-foreground text-sm">N/A</span>;

            if (metrics.completionRate !== undefined) {
                return (
                    <div className="text-sm">
                        <div className="font-medium">{metrics.completionRate}%</div>
                        <div className="text-xs text-muted-foreground">
                            {metrics.completedItems}/{metrics.totalItems} items
                        </div>
                    </div>
                );
            }

            if (metrics.productivity) {
                return (
                    <Badge variant={metrics.productivity === 'High' ? 'default' : 'secondary'}>
                        {metrics.productivity}
                    </Badge>
                );
            }

            return null;
        },
    },
    {
        accessorKey: 'dateRange',
        header: 'Date Range',
        cell: ({ row }) => (
            <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {row.getValue('dateRange')}
            </div>
        ),
    },
    {
        accessorKey: 'generatedBy',
        header: 'Generated By',
        cell: ({ row }) => (
            <span className="text-sm">{row.getValue('generatedBy')}</span>
        ),
    },
    {
        accessorKey: 'generatedAt',
        header: 'Generated At',
        cell: ({ row }) => (
            <span className="text-sm">{row.getValue('generatedAt')}</span>
        ),
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const report = row.original;
            return (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        if (report.downloadUrl) {
                            window.open(report.downloadUrl, '_blank');
                        }
                    }}
                >
                    <Download className="h-4 w-4" />
                </Button>
            );
        },
    },
];

export default function ReportsPage() {
    const [reportTypeFilter, setReportTypeFilter] = useState<ReportType>('all');
    const [projectFilter, setProjectFilter] = useState<string>('all');

    // Get unique projects from reports
    const projects = Array.from(new Set(testReports.map(r => r.project).filter(Boolean))) as string[];

    // Filter reports based on selections
    const filteredReports = testReports.filter(report => {
        const typeMatch = reportTypeFilter === 'all' || report.type === reportTypeFilter;
        const projectMatch = projectFilter === 'all' || report.project === projectFilter;
        return typeMatch && projectMatch;
    });

    // Calculate statistics
    const projectProgressReports = filteredReports.filter(r => r.type === 'project_progress');
    const taskCompletionReports = filteredReports.filter(r => r.type === 'task_completion');
    const productivityReports = filteredReports.filter(r => r.type === 'team_productivity');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                    <p className="text-muted-foreground">
                        Generate and view project progress, task completion, and team productivity reports
                    </p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Generate Report
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Select Report Type</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Project Progress Summary
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Task Completion Rate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Team Member Productivity
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Report Type Statistics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredReports.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Project Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{projectProgressReports.length}</div>
                        <p className="text-xs text-muted-foreground">Summary reports</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{taskCompletionReports.length}</div>
                        <p className="text-xs text-muted-foreground">Completion rates</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Productivity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{productivityReports.length}</div>
                        <p className="text-xs text-muted-foreground">Productivity metrics</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Type: {reportTypeFilter === 'all' ? 'All' : reportTypeFilter.replace('_', ' ')}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setReportTypeFilter('all')}>
                            All Types
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setReportTypeFilter('project_progress')}>
                            Project Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setReportTypeFilter('task_completion')}>
                            Task Completion
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setReportTypeFilter('team_productivity')}>
                            Team Productivity
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Project: {projectFilter === 'all' ? 'All' : projectFilter}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Filter by Project</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setProjectFilter('all')}>
                            All Projects
                        </DropdownMenuItem>
                        {projects.map(project => (
                            <DropdownMenuItem key={project} onClick={() => setProjectFilter(project)}>
                                {project}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {(reportTypeFilter !== 'all' || projectFilter !== 'all') && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setReportTypeFilter('all');
                            setProjectFilter('all');
                        }}
                    >
                        Clear Filters
                    </Button>
                )}
            </div>

            <DataTable columns={columns} data={filteredReports} />
        </div>
    );
}